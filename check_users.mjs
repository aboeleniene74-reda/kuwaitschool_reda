import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.execute('SELECT id, email, name, role, openId FROM users LIMIT 10');
  console.log('Users in database:');
  console.log(JSON.stringify(rows, null, 2));
  await conn.end();
}

main().catch(console.error);
