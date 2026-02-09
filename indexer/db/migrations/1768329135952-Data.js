// NON GENERATED MIGRATION
export default class Data1768329135952 {
    name = 'Data1768329135952';
  
    async up(db) {
      await db.query(
        `INSERT INTO current_fees VALUES('1', 30, 10, 0, 10) ON CONFLICT(id) DO NOTHING`
      );
    }
  
    async down(db) {
        // nothing
    }
  }
  