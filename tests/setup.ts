// Test setup file
import { vi } from 'vitest';

// Mock console.log in tests to reduce noise
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock timers for async operations
vi.useFakeTimers();

// Cleanup after tests
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});