const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.hzhlbnnqgriqgsnscraq:wLOb8W6ZG2uy8Ly3@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT * FROM notifications');
  console.log('Total notifications:', res.rows.length);
  if (res.rows.length > 0) {
    console.log(res.rows);
  }
  await client.end();
}

run().catch(console.error);
