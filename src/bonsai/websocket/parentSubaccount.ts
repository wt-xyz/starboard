import { produce } from 'immer';
import { isEmpty, keyBy } from 'lodash';
import { CompositeClient } from 'starboard-client-js';

import {
  IndexerAssetPositionResponseObject,
  IndexerOrderResponseObject,
  IndexerPerpetualPositionResponseObject,
  IndexerPerpetualPositionStatus,
} from '@/types/indexer/indexerApiGen';
import {
  isWsParentSubaccountSubscribed,
  isWsParentSubaccountUpdates,
} from '@/types/indexer/indexerChecks';
import { IndexerWsOrderUpdate } from '@/types/indexer/indexerManual';

import { type RootStore } from '@/state/_store';
import { createAppSelector } from '@/state/appTypes';
import { setParentSubaccountRaw } from '@/state/raw';

import { isTruthy } from '@/lib/isTruthy';
import { MustBigNumber } from '@/lib/numbers';

import { accountRefreshSignal } from '../accountRefreshSignal';
import { createNewPositionFromTrade } from '../calculators/accountActions';
import { createStoreEffect } from '../lib/createStoreEffect';
import { Loadable, loadableIdle, loadableLoaded, loadablePending } from '../lib/loadable';
import {
  convertToStoredChildSubaccount,
  freshChildSubaccount,
  isValidSubaccount,
} from '../lib/subaccountUtils';
import { logBonsaiError } from '../logs';
import { selectParentSubaccountInfo, selectWebsocketUrl } from '../socketSelectors';
import { ParentSubaccountData } from '../types/rawTypes';
import { makeWsValueManager, subscribeToWsValue } from './lib/indexerValueManagerHelpers';
import { IndexerWebsocket } from './lib/indexerWebsocket';
import { WebsocketDerivedValue } from './lib/websocketDerivedValue';

interface AccountValueArgsBase {
  address: string;
  parentSubaccountNumber: string;
}

function accountWebsocketValueCreator(
  websocket: IndexerWebsocket,
  { address, parentSubaccountNumber }: AccountValueArgsBase
) {
  return new WebsocketDerivedValue<Loadable<ParentSubaccountData>>(
    websocket,
    {
      channel: 'v4_parent_subaccounts',
      id: `${address}/${parentSubaccountNumber}`,
      handleBaseData: (baseMessage): Loadable<ParentSubaccountData> => {
        accountRefreshSignal.notify();
        const parentSubaccountNumberParsed = MustBigNumber(parentSubaccountNumber).toNumber();

        // empty message means account has had no transfers yet, but it's still valid
        if (baseMessage == null || isEmpty(baseMessage)) {
          return loadableLoaded({
            address,
            parentSubaccount: parentSubaccountNumberParsed,
            live: {},
            childSubaccounts: {
              [parentSubaccountNumberParsed]: freshChildSubaccount({
                address,
                subaccountNumber: parentSubaccountNumberParsed,
              }),
            },
          });
        }

        const message = isWsParentSubaccountSubscribed(baseMessage);
        const result = {
          address: message.subaccount.address,
          parentSubaccount: message.subaccount.parentSubaccountNumber,
          childSubaccounts: keyBy(
            message.subaccount.childSubaccounts
              .filter(isValidSubaccount)
              .map(convertToStoredChildSubaccount),
            (c) => c.subaccountNumber
          ),
          live: {
            orders: keyBy(message.orders, (o) => o.id),
          },
        };
        if (result.childSubaccounts[parentSubaccountNumber] == null) {
          result.childSubaccounts[parentSubaccountNumber] = freshChildSubaccount({
            address,
            subaccountNumber: parentSubaccountNumberParsed,
          });
        }
        return loadableLoaded(result);
      },
      handleUpdates: (baseUpdates, value, fullMessage) => {
        console.debug({ baseUpdates, value, fullMessage }, 'ParentSubaccountTracker Update');
        const updates = isWsParentSubaccountUpdates(baseUpdates);
        const subaccountNumber = fullMessage?.subaccountNumber as number | undefined;
        if (value.data == null) {
          logBonsaiError('ParentSubaccountTracker', 'found unexpectedly null base data in update', {
            address,
            subaccountNumber,
          });
          return value;
        }
        if (updates.length === 0 || subaccountNumber == null) {
          return value;
        }
        const resultData = produce(value.data, (returnValue) => {
          updates.forEach((update) => {
            if (update.assetPositions != null) {
              update.assetPositions.forEach((positionUpdate) => {
                returnValue.childSubaccounts[positionUpdate.subaccountNumber] ??=
                  freshChildSubaccount({
                    address,
                    subaccountNumber: positionUpdate.subaccountNumber,
                  });

                const assetPositions =
                  returnValue.childSubaccounts[positionUpdate.subaccountNumber]!.assetPositions;

                if (assetPositions[positionUpdate.symbol] == null) {
                  assetPositions[positionUpdate.symbol] =
                    positionUpdate as IndexerAssetPositionResponseObject;
                } else {
                  assetPositions[positionUpdate.symbol] = {
                    ...(assetPositions[
                      positionUpdate.symbol
                    ] as IndexerAssetPositionResponseObject),
                    ...positionUpdate,
                  };
                }
              });
            }
            if (update.perpetualPositions != null) {
              update.perpetualPositions.forEach((positionUpdate) => {
                returnValue.childSubaccounts[positionUpdate.subaccountNumber] ??=
                  freshChildSubaccount({
                    address,
                    subaccountNumber: positionUpdate.subaccountNumber,
                  });

                const perpPositions =
                  returnValue.childSubaccounts[positionUpdate.subaccountNumber]!
                    .openPerpetualPositions;

                if (perpPositions[positionUpdate.market] == null) {
                  perpPositions[positionUpdate.market] =
                    positionUpdate as IndexerPerpetualPositionResponseObject;
                } else {
                  perpPositions[positionUpdate.market] = {
                    ...(perpPositions[
                      positionUpdate.market
                    ] as IndexerPerpetualPositionResponseObject),
                    ...positionUpdate,
                  };
                }
                if (
                  perpPositions[positionUpdate.market]?.status !==
                  IndexerPerpetualPositionStatus.OPEN
                ) {
                  delete perpPositions[positionUpdate.market];
                }
              });
            }
            if (update.tradingReward != null) {
              returnValue.live.tradingRewards ??= [];
              returnValue.live.tradingRewards = [
                ...returnValue.live.tradingRewards,
                update.tradingReward,
              ];
            }
            if (update.fills != null) {
              returnValue.live.fills ??= [];
              returnValue.live.fills = [
                ...returnValue.live.fills,
                ...update.fills.map((f) => ({
                  ...f,
                  subaccountNumber,
                  // NOTE: provides ticker in ws response instead of market for soem reason
                  market: f.market ?? ((f as any).ticker as string),
                })),
              ];
            }
            if (update.orders != null) {
              returnValue.live.orders = { ...(returnValue.live.orders ?? {}) };
              const allOrders = returnValue.live.orders;
              update.orders.forEach((o) => {
                const previousOrder = allOrders[o.id];
                if (previousOrder == null) {
                  allOrders[o.id] = {
                    ...(o as IndexerOrderResponseObject),
                    subaccountNumber,
                  };
                } else {
                  allOrders[o.id] = {
                    ...(allOrders[o.id] as IndexerOrderResponseObject),
                    ...(o as IndexerWsOrderUpdate),
                    subaccountNumber,
                  };
                }
              });
            }
            if (update.transfers != null) {
              returnValue.live.transfers ??= [];
              returnValue.live.transfers = [...returnValue.live.transfers, update.transfers];
            }
          });
        });

        return { ...value, data: resultData };
      },
    },
    loadablePending()
  );
}

const AccountValueManager = makeWsValueManager(accountWebsocketValueCreator);

const selectParentSubaccount = createAppSelector(
  [selectWebsocketUrl, selectParentSubaccountInfo],
  (wsUrl, { wallet, subaccount }) => ({ wsUrl, wallet, subaccount })
);

export function setUpParentSubaccount(store: RootStore) {
  return createStoreEffect(store, selectParentSubaccount, ({ subaccount, wallet, wsUrl }) => {
    console.debug('createStoreEffect::start', { wallet, subaccount });
    if (!isTruthy(wallet) || subaccount == null) {
      return undefined;
    }
    console.debug('createStoreEffect::checks');

    // Dummy flag to keep dydx's original logic structure
    const isFuelWallet = wallet.startsWith('0x');

    if (isFuelWallet) {
      console.debug('createStoreEffect::Fuel Wallet');

      // Helper function to update Redux with latest trades
      const updatePositionsFromTrades = () => {
        const trades = CompositeClient.getTrades();
        const accountTrades = trades[wallet] ?? [];

        console.debug({ trades, accountTrades, wallet });

        const openPerpetualPositions: Record<string, IndexerPerpetualPositionResponseObject> = {};
        accountTrades.forEach((trade) => {
          const position = createNewPositionFromTrade({
            ...trade,
            averagePrice: trade.price,
            marketOraclePrice: trade.price, // Use trade price as oracle price
            subaccountNumber: trade.subaccount?.subaccountNumber ?? 0,
          });
          openPerpetualPositions[position.market] = position;
        });

        // Construct ParentSubaccountData with positions
        const fuelData: ParentSubaccountData = {
          address: wallet,
          parentSubaccount: 0,
          childSubaccounts: {
            '0': {
              address: wallet,
              subaccountNumber: 0,
              openPerpetualPositions,
              assetPositions: {},
            },
          },
          live: { orders: {}, fills: [], transfers: [], tradingRewards: [] },
        };

        // Dispatch to Redux
        store.dispatch(setParentSubaccountRaw(loadableLoaded(fuelData)));
      };

      // Initial update
      updatePositionsFromTrades();

      // Subscribe to trade changes
      const unsubscribe = CompositeClient.subscribeTrades(updatePositionsFromTrades);

      return () => {
        unsubscribe();
        store.dispatch(setParentSubaccountRaw(loadableIdle()));
      };
    }

    // Original dYdX websocket logic
    const unsub = subscribeToWsValue(
      AccountValueManager,
      { wsUrl, address: wallet, parentSubaccountNumber: subaccount.toString() },
      (val) => store.dispatch(setParentSubaccountRaw(val))
    );

    return () => {
      unsub();
      store.dispatch(setParentSubaccountRaw(loadableIdle()));
    };
  });
}
