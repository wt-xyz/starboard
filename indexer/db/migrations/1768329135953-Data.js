// NON GENERATED MIGRATION
export default class Data1768329135953 {
    name = 'Data1768329135953';
  
    async up(db) {
      await db.query(
        `CREATE VIEW "current_position_state" AS SELECT position_key_id, collateral, size, position_fee, liquidation_fee, pnl, funding_rate, minimal_collateral, collateral-position_fee-liquidation_fee+pnl+funding_rate AS effective_collateral FROM (SELECT cp.position_key_id, cp.collateral, cp.size, FLOOR(cp.size*(SELECT decrease_position_fee_basis_points FROM current_fees)/10000) AS position_fee, FLOOR(cp.size*(SELECT liquidation_fee_basis_points FROM current_fees)/10000) AS liquidation_fee, (CASE WHEN pk.is_long THEN 1 ELSE -1 END)*FLOOR(cp.size*(p.price-cp.out_average_price)/cp.out_average_price) AS pnl, FLOOR(cp.size*(cp.cumulative_funding_rate-(CASE WHEN pk.is_long THEN fi.long_cumulative_funding_rate ELSE fi.short_cumulative_funding_rate END))/1000000000000000000) AS funding_rate, CASE WHEN cac.max_leverage=0 THEN 0 ELSE CEIL(cp.size*10000/cac.max_leverage) END AS minimal_collateral FROM current_position cp JOIN position_key pk ON cp.position_key_id=pk.id JOIN (SELECT asset, FLOOR(price*1000000000000000000/(SELECT price FROM current_price WHERE asset='0x7416a56f222e196d0487dce8a1a8003936862e7a15092a91898d69fa8bce290c')) AS price FROM current_price) p ON p.asset=pk.index_asset_id JOIN (SELECT asset, CASE WHEN total_long_sizes=0 THEN long_cumulative_funding_rate ELSE long_cumulative_funding_rate+(CASE WHEN total_long_sizes>total_short_sizes THEN 1 ELSE -1 END)*FLOOR(total_funding_rate_delta/total_long_sizes) END AS long_cumulative_funding_rate, CASE WHEN total_short_sizes=0 THEN short_cumulative_funding_rate ELSE short_cumulative_funding_rate+(CASE WHEN total_long_sizes>total_short_sizes THEN -1 ELSE 1 END)*FLOOR(total_funding_rate_delta/total_short_sizes) END AS short_cumulative_funding_rate FROM (SELECT asset, total_long_sizes, total_short_sizes, long_cumulative_funding_rate, short_cumulative_funding_rate, (FLOOR(extract(epoch from now()))-timestamp)*ABS(total_long_sizes-total_short_sizes)*23*1000000000 AS total_funding_rate_delta FROM current_funding_info) cfi) fi ON fi.asset=pk.index_asset_id JOIN current_asset_config cac ON cac.asset=pk.index_asset_id) cpsi`
      );
    }
  
    async down(db) {
        await db.query(`DROP VIEW "current_position_state"`);
    }
  }
  