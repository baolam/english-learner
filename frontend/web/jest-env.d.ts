// Jest 28+ typed `expect()` via the `@jest/expect` module rather than the
// classic `jest.Matchers` global namespace. @testing-library/jest-dom's
// default import only augments the old namespace, so TypeScript doesn't see
// matchers like `toBeInTheDocument()` without this dedicated subpath import.
import '@testing-library/jest-dom/jest-globals';
