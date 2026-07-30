import { HttpError } from "./http.js";
import { sha256, signSession, verifySession } from "./crypto.js";

const COOKIE_NAME = "nova_admin_session";
const SESSION_SECONDS = 12 * 60 * 60;

function getCookie(request, name) {
  const cookies = request.headers.get("cookie") || "";
  for (const part of cookies.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return "";
}

function requireSecrets(env) {
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
    throw new HttpError(503, "後台尚未完成安全設定");
  }
}

export async function createAdminSession(request, env) {
  requireSecrets(env);
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const token = await signSession({
    role: "admin",
    exp: expiresAt,
    nonce: crypto.randomUUID()
  }, env.ADMIN_SESSION_SECRET);
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}`;
}

export function clearAdminSession(request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export async function requireAdmin(request, env) {
  requireSecrets(env);
  const payload = await verifySession(getCookie(request, COOKIE_NAME), env.ADMIN_SESSION_SECRET);
  if (!payload || payload.role !== "admin") {
    throw new HttpError(401, "請先登入管理後台");
  }
  return payload;
}

export async function getAdminSession(request, env) {
  try {
    return await requireAdmin(request, env);
  } catch {
    return null;
  }
}

export async function getClientKey(request, env) {
  requireSecrets(env);
  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "local";
  return sha256(`${ip}|${env.ADMIN_SESSION_SECRET}`);
}
