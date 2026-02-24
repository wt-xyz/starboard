// NON GENERATED MIGRATION
export default class Data1768329135951 {
    name = 'Data1768329135951';
  
    async up(db) {
      await db.query(
        `CREATE VIEW "open_interest" AS SELECT position_key.index_asset_id AS index_asset_id, sum(CASE WHEN position_key.is_long THEN position.size ELSE 0 END) AS open_interest_long, sum(CASE WHEN position_key.is_long THEN 0 ELSE position.size END) AS open_interest_short FROM position LEFT JOIN position_key ON position.position_key_id=position_key.id GROUP BY position_key.index_asset_id`
      );
      await db.query(
        `CREATE VIEW "trade_volume_24h" AS SELECT t1.index_asset_id, t1.trade_volume-COALESCE(t2.trade_volume, 0) AS trade_volume_24h FROM (SELECT index_asset_id, trade_volume FROM trade_volume WHERE (index_asset_id, timestamp) IN (SELECT index_asset_id, MAX(timestamp) FROM trade_volume GROUP BY index_asset_id)) t1 LEFT JOIN (SELECT index_asset_id, trade_volume FROM trade_volume WHERE (index_asset_id, timestamp) IN (SELECT index_asset_id, MAX(timestamp) FROM trade_volume WHERE timestamp < extract(epoch from now())-86400 GROUP BY index_asset_id)) t2 ON t1.index_asset_id = t2.index_asset_id`
      );
    }
  
    async down(db) {
        await db.query(`DROP VIEW "trade_volume_24h"`);
        await db.query(`DROP VIEW "open_interest"`);
    }
  }
  