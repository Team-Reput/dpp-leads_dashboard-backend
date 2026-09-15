require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function seed() {
  const passwordHash = await bcrypt.hash('test1234', 10); // pick your real password
  const result = await pool.query(
    `SELECT dbo.fn_usp_insert_dashboard_user($1, $2, $3) AS result`,
    ['bluwin', 'g@gmail.com', passwordHash]
  );
  console.log(result.rows[0].result);
  process.exit();
}

seed();