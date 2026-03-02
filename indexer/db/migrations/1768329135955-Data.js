// NON GENERATED MIGRATION
export default class Data1768329135955 {
    name = 'Data1768329135955';
  
    async up(db) {
      await db.query(
        `CREATE VIEW "liquidation_state" AS SELECT pk.account, pk.index_asset_id, pk.is_long, position_key_id, effective_collateral/NULLIF(minimal_collateral, 0) AS liquidation_ratio FROM current_position_state cps LEFT JOIN position_key pk ON cps.position_key_id=pk.id`
      );
    }
  
    async down(db) {
        await db.query(`DROP VIEW "liquidation_state"`);
    }
  }
  
