import { requireAdmin } from "../../../../server/auth.js";
import { generateLicenseCode, normalizeLicenseCode, sha256 } from "../../../../server/crypto.js";
import { ensureDatabase } from "../../../../server/db.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../../server/http.js";

export async function onRequestGet(context) {
  try {
    await ensureDatabase(context.env);
    await requireAdmin(context.request, context.env);
    const result = await context.env.DB.prepare(
      `SELECT id, account, note, code_last4, active, created_at, last_used_at, use_count
       FROM licenses
       ORDER BY created_at DESC
       LIMIT 500`
    ).all();
    return json({ ok: true, licenses: result.results || [] });
  } catch (error) {
    return handleError(error);
  }
}

export async function onRequestPost(context) {
  try {
    assertSameOrigin(context.request);
    await ensureDatabase(context.env);
    await requireAdmin(context.request, context.env);
    const body = await readJson(context.request);
    const account = String(body.account || "").trim();
    const note = String(body.note || "").trim();
    if (account.length < 2 || account.length > 60) {
      throw new HttpError(400, "帳號需為 2～60 個字元");
    }
    if (note.length > 300) {
      throw new HttpError(400, "備註不可超過 300 個字元");
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateLicenseCode();
      const normalized = normalizeLicenseCode(code);
      const codeHash = await sha256(normalized);
      try {
        await context.env.DB.prepare(
          `INSERT INTO licenses
             (id, account, note, code_hash, code_last4, active, created_at, use_count)
           VALUES (?, ?, ?, ?, ?, 1, ?, 0)`
        ).bind(
          crypto.randomUUID(),
          account,
          note,
          codeHash,
          normalized.slice(-4),
          new Date().toISOString()
        ).run();
        return json({
          ok: true,
          license: { account, note, code }
        }, 201);
      } catch (error) {
        const message = String(error && error.message || "");
        if (message.includes("licenses.account")) {
          throw new HttpError(409, "此帳號已經存在");
        }
        if (!message.includes("licenses.code_hash") || attempt === 4) throw error;
      }
    }
    throw new HttpError(500, "授權碼產生失敗");
  } catch (error) {
    return handleError(error);
  }
}
