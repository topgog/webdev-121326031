// npm start: opens the database, seeds demo data on the first run, and listens.
const { join } = require('node:path');
const { openDatabase } = require('./data/db');
const { createApp } = require('./app');
const { seedDemo } = require('./seed');

async function main() {
  const production = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  const db = openDatabase(join(__dirname, '..', 'data', 'lab-booking.db'));
  const { app, data } = createApp({ db, now: Date.now, production });

  if (!production) {
    const accounts = await seedDemo(data);
    if (accounts.length > 0) {
      console.log('Demo accounts created (shown once, not stored anywhere):');
      for (const a of accounts) console.log(`  ${a.role.padEnd(7)} ${a.email}  ${a.password}`);
    }
  }

  app.listen(port, () => console.log(`Lab booking is listening on http://localhost:${port}`));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
