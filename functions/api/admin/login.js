import { constantTimeEqual } from "../../../server/crypto.js";
import { createAdminSession, getClientKey } from "../../../server/auth.js";
import { ensureDatabase } from "../../../server/db.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../server/http.js";

const MAX_FAILURES = 5;
const BLOCK_MS = 15 * 60 * 1000;
const RESET_WINDOW_MS = 30 * 60 * 1000;

export async function onRequestPost(context) {
  try {
    assertSameOrigin(context.request);
    await ensureDatabase(context.env);
    const body = await readJson(context.request);
    const password = String(body.password || "");
    if (!password || password.length > 200) {
      throw new HttpError(400, "請輸入管理員密碼");
    }

    const clientKey = await getClientKey(context.request, context.env);
    const now = Date.now();
    const attempt = await context.env.DB.prepare(
      "SELECT failures, blocked_until, updated_at FROM admin_login_attempts WHERE ip_hash = ?"
    ).bind(clientKey).first();

    if (attempt && Number(attempt.blocked_until) > now) {
      throw new HttpError(429, "嘗試次數過多，請 15 分鐘後再試");
    }

    if (!constantTimeEqual(password, context.env.ADMIN_PASSWORD)) {
      const previousFailures = attempt && now - Number(attempt.updated_at) < RESET_WINDOW_MS
        ? Number(attempt.failures)
        : 0;
      const failures = previousFailures + 1;
      const blockedUntil = failures >= MAX_FAILURES ? now + BLOCK_MS : 0;
      await context.env.DB.prepare(
        `INSERT INTO admin_login_attempts (ip_hash, failures, blocked_until, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(ip_hash) DO UPDATE SET
           failures = excluded.failures,
           blocked_until = excluded.blocked_until,
           updated_at = excluded.updated_at`
      ).bind(clientKey, failures, blockedUntil, now).run();
      throw new HttpError(401, failures >= MAX_FAILURES
        ? "嘗試次數過多，請 15 分鐘後再試"
        : "管理員密碼錯誤");
    }

    await context.env.DB.prepare(
      "DELETE FROM admin_login_attempts WHERE ip_hash = ?"
    ).bind(clientKey).run();
    const cookie = await createAdminSession(context.request, context.env);
    return json({ ok: true }, 200, { "Set-Cookie": cookie });
  } catch (error) {
    return handleError(error);
  }
}
