import { getDbPool } from '../db';
import { Pool } from 'pg';

describe('Database Connection Utility', () => {
  it('should return a valid pg Pool instance', () => {
    const pool = getDbPool();
    expect(pool).toBeInstanceOf(Pool);
  });

  it('should return the exact same pool instance on subsequent calls (singleton)', () => {
    const pool1 = getDbPool();
    const pool2 = getDbPool();
    expect(pool1).toBe(pool2);
  });
});
