const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Runs once before the whole test suite. Resets a dedicated SQLite test
// database (backend/prisma/test.db) and applies all migrations to it, so
// tests always start from a clean, known schema and never touch dev.db.
module.exports = async function globalSetup() {
  const backendDir = path.resolve(__dirname, '..');
  const prismaDir = path.join(backendDir, 'prisma');

  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const p = path.join(prismaDir, `test.db${suffix}`);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  execSync('npx prisma migrate deploy', {
    cwd: backendDir,
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'inherit'
  });
};
