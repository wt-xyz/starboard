import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BNB_ASSET, BTC_ASSET, ETH_ASSET } from './utils';

const { Client } = pg;

describe('Verify SetFees indexing', () => {
  let client: pg.Client;

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
  });

  describe('DB tests', () => {
    it('should store two SetFeesLog events', async () => {
      const result = await client.query('SELECT COUNT(*) as c FROM set_fees_log');
      const count = result.rows[0].c;
      expect(count).toBe('2');
    });

    it('should store the correct values in SetFeesLog (1st call)', async () => {
      const result = await client.query(
        'SELECT liquidity_fee_basis_points, increase_position_fee_basis_points, decrease_position_fee_basis_points, liquidation_fee_basis_points, timestamp FROM set_fees_log ORDER BY id ASC LIMIT 1'
      );

      const row = result.rows[0];
      expect(row.liquidity_fee_basis_points).toBe(30);
      expect(row.increase_position_fee_basis_points).toBe(10);
      expect(row.decrease_position_fee_basis_points).toBe(0);
      expect(row.liquidation_fee_basis_points).toBe(10);
      expect(row.timestamp).toBeDefined();
    });

    it('should store the correct values in SetFeesLog (2nd call)', async () => {
      const result = await client.query(
        'SELECT liquidity_fee_basis_points, increase_position_fee_basis_points, decrease_position_fee_basis_points, liquidation_fee_basis_points, timestamp FROM set_fees_log ORDER BY id DESC LIMIT 1'
      );

      const row = result.rows[0];
      expect(row.liquidity_fee_basis_points).toBe(40);
      expect(row.increase_position_fee_basis_points).toBe(15);
      expect(row.decrease_position_fee_basis_points).toBe(5);
      expect(row.liquidation_fee_basis_points).toBe(20);
      expect(row.timestamp).toBeDefined();
    });

    it('should update CurrentFees with the latest values', async () => {
      const result = await client.query('SELECT * FROM current_fees WHERE id = $1', ['1']);
      expect(result.rows.length).toBe(1);

      const row = result.rows[0];

      // The latest call in populate-events-set-fees.ts uses:
      // liquidity_fee_basis_points = 40
      // increase_position_fee_basis_points = 15
      // decrease_position_fee_basis_points = 5
      // liquidation_fee_basis_points = 20
      expect(row.liquidity_fee_basis_points).toBe(40);
      expect(row.increase_position_fee_basis_points).toBe(15);
      expect(row.decrease_position_fee_basis_points).toBe(5);
      expect(row.liquidation_fee_basis_points).toBe(20);
    });

    it('should have CurrentAssetConfig for BNB after one SetAssetConfig', async () => {
      const result = await client.query(
        'SELECT asset, max_leverage FROM current_asset_config WHERE id = $1',
        [BNB_ASSET]
      );
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].asset).toBe(BNB_ASSET);
      expect(result.rows[0].max_leverage).toBe('500000');
    });

    it('should have CurrentAssetConfig for ETH after two SetAssetConfig (second wins)', async () => {
      const result = await client.query(
        'SELECT asset, max_leverage FROM current_asset_config WHERE id = $1',
        [ETH_ASSET]
      );
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].asset).toBe(ETH_ASSET);
      expect(result.rows[0].max_leverage).toBe('200000');
    });

    it('should have CurrentAssetConfig for BTC with max_leverage 0 after SetAssetConfig then ClearAssetConfig', async () => {
      const result = await client.query(
        'SELECT asset, max_leverage FROM current_asset_config WHERE id = $1',
        [BTC_ASSET]
      );
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].asset).toBe(BTC_ASSET);
      expect(result.rows[0].max_leverage).toBe('0');
    });
  });

  afterAll(async () => {
    await client.end();
  });
});
