// Runs before any test module is imported. Overrides env vars so the app
// code (which calls dotenv.config() without `override`) never touches the
// real dev.db, Redis, Anki, or AI service during tests.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.ANKI_CONNECT_URL = 'http://127.0.0.1:65535'; // unreachable on purpose; anki tests mock axios anyway
process.env.AI_SERVICE_URL = 'http://127.0.0.1:65535'; // unreachable on purpose; ai-proxy tests mock axios anyway
process.env.REDIS_URL = 'redis://127.0.0.1:65535'; // unused: ioredis itself is mocked (see __mocks__/ioredis.ts)

// Isolate uploaded test files from the real screenshots/audio the app records.
process.env.SCREENSHOTS_UPLOAD_DIR = './uploads-test/screenshots';
process.env.AUDIO_UPLOAD_DIR = './uploads-test/audio';
