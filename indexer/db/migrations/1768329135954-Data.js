// NON GENERATED MIGRATION
export default class Data1768329135954 {
  name = 'Data1768329135954';

  async up(db) {
    await db.query(`
CREATE OR REPLACE FUNCTION current_funding_info_update() RETURNS TRIGGER AS $$
BEGIN
   PERFORM pg_notify('starboard:funding:'||SUBSTRING(NEW.asset, 1, 42), json_build_object('asset', NEW.asset, 'totalShortSizes', NEW.total_short_sizes, 'totalLongSizes', NEW.total_long_sizes, 'longCumulativeFundingRate', NEW.long_cumulative_funding_rate, 'shortCumulativeFundingRate', NEW.short_cumulative_funding_rate)::text);
   RETURN NEW;
END;
$$ LANGUAGE plpgsql`);
    await db.query(`
CREATE OR REPLACE TRIGGER current_funding_info_update_trigger
AFTER INSERT OR UPDATE ON current_funding_info
FOR EACH ROW
EXECUTE FUNCTION current_funding_info_update()`);
  }

  async down(db) {
    await db.query(`DROP TRIGGER current_funding_info_update_trigger ON current_funding_info`);
    await db.query(`DROP FUNCTION current_funding_info_update()`);
  }
}
