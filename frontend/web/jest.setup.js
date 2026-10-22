import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// jsdom doesn't expose these globals even though Node does; several
// components (streaming chat responses) rely on them being globally
// available, matching the real browser environment.
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore - Node's TextDecoder type is slightly stricter than lib.dom's
  global.TextDecoder = TextDecoder;
}
