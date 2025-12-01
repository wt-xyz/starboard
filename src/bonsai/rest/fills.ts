import { isParentSubaccountFillResponse } from '@/types/indexer/indexerChecks';

import { type RootStore } from '@/state/_store';
import { setAccountFillsRaw } from '@/state/raw';

import { isTruthy } from '@/lib/isTruthy';

import { refreshIndexerQueryOnAccountSocketRefresh } from '../accountRefreshSignal';
import { loadableIdle } from '../lib/loadable';
import { mapLoadableData } from '../lib/mapLoadable';
import { selectParentSubaccountInfo } from '../socketSelectors';
import { createIndexerQueryStoreEffect } from './lib/indexerQueryStoreEffect';
import { queryResultToLoadable } from './lib/queryResultToLoadable';

export function setUpFillsQuery(store: RootStore) {
  const cleanupListener = refreshIndexerQueryOnAccountSocketRefresh(['account', 'fills']);
  // Skip REST fetch on localhost/mock indexer where these endpoints return 404; data comes via GraphQL sockets.
  // const isLocalhost = window.location.href.includes('localhost');
  const cleanupEffect = createIndexerQueryStoreEffect(store, {
    name: 'fills',
    selector: selectParentSubaccountInfo,
    getQueryKey: (data) => ['account', 'fills', data.wallet, data.subaccount],
    getQueryFn: (indexerClient, data) => {
      if (!isTruthy(data.wallet) || data.subaccount == null) {
        return null;
      }
      // if (isLocalhost) {
      //   return null;
      // }
      return () =>
        indexerClient.account.getParentSubaccountNumberFills(data.wallet!, data.subaccount!);
    },
    onResult: (fills) => {
      store.dispatch(
        setAccountFillsRaw(
          mapLoadableData(queryResultToLoadable(fills), isParentSubaccountFillResponse)
        )
      );
    },
    onNoQuery: () => store.dispatch(setAccountFillsRaw(loadableIdle())),
  });
  return () => {
    cleanupListener();
    cleanupEffect();
    store.dispatch(setAccountFillsRaw(loadableIdle()));
  };
}
