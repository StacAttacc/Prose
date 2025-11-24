import { afterEach, afterAll, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
  // S'assurer qu'il y a un conteneur DOM disponible
  if (!document.body) {
    document.body = document.createElement('body');
  }
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());

