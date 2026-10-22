// Manual mock for the `ioredis` package, used automatically by Jest for
// every test (no explicit jest.mock('ioredis') needed - see Jest docs on
// mocking node_modules packages). Keeps tests from opening a real TCP
// connection to Redis, which may not be running in this environment.
class RedisMock {
  constructor(..._args: any[]) {}

  rpush = jest.fn().mockResolvedValue(1);
  lpush = jest.fn().mockResolvedValue(1);
  publish = jest.fn().mockResolvedValue(1);
  subscribe = jest.fn((...args: any[]) => {
    const callback = args[args.length - 1];
    if (typeof callback === 'function') {
      callback(null, args.length - 1);
    }
  });
  on = jest.fn();
  quit = jest.fn().mockResolvedValue('OK');
  disconnect = jest.fn();
}

export default RedisMock;
