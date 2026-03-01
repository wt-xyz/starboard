import { Provider, Wallet } from 'fuels';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Vault } from '../../contracts/types/index.js';
import { BTC_ASSET, DEPLOYER_PK, ETH_ASSET, USER_0_ADDRESS, USER_1_ADDRESS } from './utils';

const { Client } = pg;

const graphQLUrl = 'http://127.0.0.1:4000/v1/graphql';

// Hardcoded expected: must match scenario in populate-events-state.ts
// BTC: User0 long (price dropped to 36000) → liquidatable; User1 short → not liquidatable
// ETH: User0 long (price dropped to 2750) → liquidatable; User1 short → not liquidatable
const EXPECTED_LIQUIDATIONS = [
  { account: USER_0_ADDRESS, indexAssetId: BTC_ASSET, isLong: true, liquidatable: true },
  { account: USER_1_ADDRESS, indexAssetId: BTC_ASSET, isLong: false, liquidatable: false },
  { account: USER_0_ADDRESS, indexAssetId: ETH_ASSET, isLong: true, liquidatable: true },
  { account: USER_1_ADDRESS, indexAssetId: ETH_ASSET, isLong: false, liquidatable: false },
];

describe('Verify State', () => {
  let client: pg.Client;
  let vault: Vault;

  beforeAll(async () => {
    if (
      !process.env.VITE_DB_USER ||
      !process.env.VITE_DB_PASS ||
      !process.env.VITE_DB_PORT ||
      !process.env.VITE_DB_NAME
    ) {
      throw new Error('Environment variables not set');
    }
    client = new Client({
      user: process.env.VITE_DB_USER,
      password: process.env.VITE_DB_PASS,
      host: 'localhost',
      port: parseInt(process.env.VITE_DB_PORT, 10),
      database: process.env.VITE_DB_NAME,
    });

    await client.connect();

    const vaultAddress = process.env.VAULT_CONTRACT;
    if (!vaultAddress) {
      throw new Error('VAULT_CONTRACT environment variable not set');
    }
    const provider = new Provider(graphQLUrl);
    const deployerWallet = Wallet.fromPrivateKey(DEPLOYER_PK, provider);
    vault = new Vault(vaultAddress, deployerWallet);
  });

  describe('State calculated correctly', () => {
    it('should have current_position_state rows for open positions', async () => {
      const result = await client.query(`
        SELECT cps.position_key_id, cps.collateral, cps.size, cps.position_fee, cps.liquidation_fee,
               cps.pnl, cps.funding_rate, cps.minimal_collateral, cps.effective_collateral,
               pk.account, pk.index_asset_id, pk.is_long
        FROM current_position_state cps
        JOIN position_key pk ON pk.id = cps.position_key_id
      `);
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows.length).toBe(EXPECTED_LIQUIDATIONS.length);
    });

    it('effective_collateral should equal collateral - position_fee - liquidation_fee + pnl + funding_rate', async () => {
      const result = await client.query(`
        SELECT position_key_id, collateral, position_fee, liquidation_fee, pnl, funding_rate, effective_collateral
        FROM current_position_state
      `);
      for (const row of result.rows) {
        const collateral = BigInt(row.collateral);
        const positionFee = BigInt(row.position_fee);
        const liquidationFee = BigInt(row.liquidation_fee);
        const pnl = BigInt(row.pnl);
        const fundingRate = BigInt(row.funding_rate);
        const effectiveCollateral = BigInt(row.effective_collateral);
        const expectedEffective = collateral - positionFee - liquidationFee + pnl + fundingRate;
        expect(
          effectiveCollateral,
          `position_key_id=${row.position_key_id}: effective_collateral ${effectiveCollateral} should equal collateral - position_fee - liquidation_fee + pnl + funding_rate = ${expectedEffective}`
        ).toBe(expectedEffective);
      }
    });
  });

  describe('effective_collateral < minimal_collateral iff position is to be liquidated (vault.validate_liquidation)', () => {
    it('each open position should satisfy effective_collateral < minimal_collateral <=> liquidatable', async () => {
      const result = await client.query(`
        SELECT cps.position_key_id, cps.effective_collateral, cps.minimal_collateral,
               pk.account, pk.index_asset_id, pk.is_long
        FROM current_position_state cps
        JOIN position_key pk ON pk.id = cps.position_key_id
      `);

      for (const row of result.rows) {
        const effectiveCollateral = BigInt(row.effective_collateral);
        const minimalCollateral = BigInt(row.minimal_collateral);
        const indexLiquidatable = effectiveCollateral < minimalCollateral;

        const identity = { Address: { bits: row.account } };
        const validateResult = (
          await vault.functions
            .validate_liquidation(identity, row.index_asset_id, row.is_long, false)
            .get()
        ).value;
        const liquidationState = validateResult[0].toNumber();
        const contractLiquidatable = liquidationState !== 0;

        expect(
          indexLiquidatable,
          `account=${row.account} index_asset_id=${row.index_asset_id} is_long=${row.is_long}: indexer effective_collateral < minimal_collateral (${indexLiquidatable}) should match vault.validate_liquidation (${contractLiquidatable})`
        ).toBe(contractLiquidatable);

        const expected = EXPECTED_LIQUIDATIONS.find(
          (e) =>
            e.account === row.account &&
            e.indexAssetId === row.index_asset_id &&
            e.isLong === row.is_long
        );
        expect(
          expected,
          `No expected entry for account=${row.account} index_asset_id=${row.index_asset_id} is_long=${row.is_long}`
        ).toBeDefined();
        expect(
          indexLiquidatable,
          `account=${row.account} index_asset_id=${row.index_asset_id} is_long=${row.is_long}: indexer should match hardcoded expected (${expected!.liquidatable})`
        ).toBe(expected!.liquidatable);
      }
    });

    it('every expected (account, asset, is_long) should have a current_position_state row', async () => {
      const result = await client.query(`
        SELECT pk.account, pk.index_asset_id, pk.is_long
        FROM current_position_state cps
        JOIN position_key pk ON pk.id = cps.position_key_id
      `);
      const stateKeys = new Set(
        result.rows.map((r) => `${r.account}|${r.index_asset_id}|${r.is_long}`)
      );
      for (const e of EXPECTED_LIQUIDATIONS) {
        const key = `${e.account}|${e.indexAssetId}|${e.isLong}`;
        expect(
          stateKeys.has(key),
          `Expected position ${key} should exist in current_position_state`
        ).toBe(true);
      }
    });
  });

  afterAll(async () => {
    await client.end();
  });
});
