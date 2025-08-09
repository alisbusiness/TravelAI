import { describe, it, expect } from 'vitest';
import { env } from '../src/config/env.js';

describe('env config', () => {
  it('parses required fields', () => {
    expect(env.CLIENT_URL).toBeDefined();
    expect(env.AFFILIATE_UTM_SOURCE).toBeDefined();
  });
});

