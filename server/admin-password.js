import { constantTimeEqual } from "./crypto.js";
import { ensureDatabase } from "./db.js";
import { HttpError } from "./http.js";

const encoder = new TextEncoder();
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 200;
const PBKDF2_ITERATIONS = 210000;

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(value) {
  const normalized = String(value || "");
  if (!normalized || normalized.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(normalized)) {
    throw new HttpError(500, "管理員憑證格式錯誤");
  }
  return Uint8Array.from(normalized.match(/.{2}/g), (pair) => Number.parseInt(pair, 16));
}

export function validateAdminPassword(value) {
  const password = String(value || "");
  if (password.length < PASSWORD_MIN_LENGTH) throw new HttpError(400, "新密碼至少需要 6 個字元");
  if (password.length > PASSWORD_MAX_LENGTH) throw new HttpError(400, "新密碼不可超過 200 個字元");
  return password;
}

export async function deriveAdminPasswordHash(password, saltHex) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(String(password || "")),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    hash: "SHA-256",
    salt: hexToBytes(saltHex),
    iterations: PBKDF2_ITERATIONS
  }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}

async function readAdminCredential(env) {
  await ensureDatabase(env);
  return env.DB.prepare(
    "SELECT password_salt, password_hash, version FROM admin_credentials WHERE id = 1"
  ).first();
}

export async function getAdminCredentialVersion(env) {
  const credential = await readAdminCredential(env);
  return credential ? Math.max(1, Number(credential.version) || 1) : 0;
}

export async function verifyAdminPassword(env, password) {
  const credential = await readAdminCredential(env);
  if (credential) {
    const passwordHash = await deriveAdminPasswordHash(password, credential.password_salt);
    return constantTimeEqual(passwordHash, credential.password_hash);
  }
  if (!env.ADMIN_PASSWORD) throw new HttpError(503, "後台尚未設定初始密碼");
  return constantTimeEqual(password, env.ADMIN_PASSWORD);
}

export async function updateAdminPassword(env, value) {
  await ensureDatabase(env);
  const password = validateAdminPassword(value);
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  const passwordHash = await deriveAdminPasswordHash(password, salt);
  const updatedAt = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO admin_credentials (id, password_salt, password_hash, version, updated_at)
     VALUES (1, ?, ?, 1, ?)
     ON CONFLICT(id) DO UPDATE SET
       password_salt = excluded.password_salt,
       password_hash = excluded.password_hash,
       version = admin_credentials.version + 1,
       updated_at = excluded.updated_at`
  ).bind(salt, passwordHash, updatedAt).run();
  return getAdminCredentialVersion(env);
}
