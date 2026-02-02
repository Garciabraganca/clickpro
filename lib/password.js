const crypto = require('crypto');

// IMPORTANT: These constants MUST match the portal's auth.ts algorithm
// to ensure password hashes are compatible across the system
const ITERATIONS = 120000;
const KEYLEN = 32;      // Changed from 64 to match portal
const DIGEST = 'sha256'; // Changed from sha512 to match portal

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  if (!stored) {
    return false;
  }
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) {
    return false;
  }

  try {
    const derived = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
    const hashBuffer = Buffer.from(hash, 'hex');
    const derivedBuffer = Buffer.from(derived, 'hex');

    // Prevent crash if buffer sizes don't match (incompatible hash)
    if (hashBuffer.length !== derivedBuffer.length) {
      console.error('Password hash length mismatch - possibly incompatible hash algorithm');
      return false;
    }

    return crypto.timingSafeEqual(hashBuffer, derivedBuffer);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
};
