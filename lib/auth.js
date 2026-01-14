const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');
const authPath = path.join(dataDir, 'auth.json');
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const sessions = new Map();

function ensureAuthStore() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function isSetup() {
  return fs.existsSync(authPath);
}

function setupPassword({ password, email }) {
  if (isSetup()) {
    throw new Error('Senha já configurada.');
  }
  if (!password || password.length < 6) {
    throw new Error('Senha deve ter pelo menos 6 caracteres.');
  }
  ensureAuthStore();
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 120000;
  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, 32, 'sha256')
    .toString('hex');
  fs.writeFileSync(
    authPath,
    JSON.stringify({ salt, hash, iterations, email: email || '' }, null, 2),
  );
}

function verifyPassword(password) {
  if (!isSetup()) {
    return false;
  }
  const payload = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  const hash = crypto
    .pbkdf2Sync(password, payload.salt, payload.iterations, 32, 'sha256')
    .toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(payload.hash, 'hex'));
}

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(token, { token, expiresAt });
  return token;
}

function getSession(token) {
  if (!token) {
    return null;
  }
  const session = sessions.get(token);
  if (!session) {
    return null;
  }
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

module.exports = {
  ensureAuthStore,
  isSetup,
  setupPassword,
  verifyPassword,
  createSession,
  getSession,
};
