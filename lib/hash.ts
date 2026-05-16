import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Hashing password using Node.js native crypto (scrypt)
 * Format: salt:hash
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString('hex')}`;
}

/**
 * Verify password against a hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  
  const hashBuffer = Buffer.from(hash, 'hex');
  const verifyBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
  
  return timingSafeEqual(hashBuffer, verifyBuffer);
}
