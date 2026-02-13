// NON GENERATED MIGRATION
export default class Data1768329135950 {
  name = 'Data1768329135950';

  async up(db) {
    await db.query(`CREATE TABLE "current_position" ("position_id" character varying NOT NULL, "change" character varying(9) NOT NULL, "timestamp" integer NOT NULL, "collateral" numeric NOT NULL, "size" numeric NOT NULL, "out_average_price" numeric NOT NULL, "cumulative_funding_rate" numeric NOT NULL, "position_open_id" character varying NOT NULL UNIQUE, "position_key_id" character varying, CONSTRAINT "PK_CURRENT_POSITION" PRIMARY KEY ("position_key_id"))`);
    await db.query(`
      CREATE OR REPLACE FUNCTION current_position_update() RETURNS TRIGGER AS $$
      DECLARE
         v_account text;
         v_index_asset_id text;
         v_is_long boolean;
      BEGIN
         IF NEW.latest = TRUE THEN
            IF NEW.change = 'CLOSE' OR NEW.change = 'LIQUIDATE' OR NEW.size = 0 THEN
               DELETE FROM current_position WHERE position_key_id = NEW.position_key_id;
            ELSE
               INSERT INTO current_position VALUES(NEW.id, NEW.change, NEW.timestamp, NEW.collateral, NEW.size, NEW.out_average_price, NEW.cumulative_funding_rate, NEW.open_id, NEW.position_key_id)
                  ON CONFLICT(position_key_id)
                  DO UPDATE SET position_id = NEW.id, change = NEW.change, timestamp = NEW.timestamp, collateral = NEW.collateral, size = NEW.size, out_average_price = NEW.out_average_price, cumulative_funding_rate = NEW.cumulative_funding_rate;
            END IF;
            SELECT account, index_asset_id, is_long INTO v_account, v_index_asset_id, v_is_long FROM position_key WHERE id = NEW.position_key_id;
            PERFORM pg_notify('starboard:position:'||SUBSTRING(v_account, 1, 42), json_build_object('account', v_account, 'asset', v_index_asset_id, 'isLong', v_is_long, 'openId', NEW.open_id, 'positionKeyId', NEW.position_key_id, 'change', NEW.change)::text);
         END IF;
         RETURN NEW;
      END;
      $$ LANGUAGE plpgsql`);
          await db.query(`
      CREATE OR REPLACE TRIGGER current_position_update_trigger
      AFTER INSERT ON position
      FOR EACH ROW
      EXECUTE FUNCTION current_position_update()`);
        }

  async down(db) {
    await db.query(`DROP TRIGGER current_position_update_trigger ON position`);
    await db.query(`DROP FUNCTION current_position_update()`);
    await db.query(`DROP TABLE "current_position"`);
  }
}
