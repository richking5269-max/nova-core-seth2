import { normalizeLicenseCode, sha256 } from "../../../server/crypto.js";
import { ensureDatabase } from "../../../server/db.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../server/http.js";

export async function onRequestPost(context) {
  try {
    assertSameOrigin(context.request);
    await ensureDatabase(context.env);
    const body = await readJson(context.request, 1024);
    const code = normalizeLicenseCode(body.code);
    if (!/^NOVA-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(code)) {
      throw new HttpError(401, "授權碼無效");
    }
    const codeHash = await sha256(code);
    const license = await context.env.DB.prepare(
      `SELECT id, account
       FROM licenses
       WHERE code_hash = ? AND active = 1`
    ).bind(codeHash).first();
    if (!license) {
      throw new HttpError(401, "授權碼無效或已被刪除");
    }
    await context.env.DB.prepare(
      `UPDATE licenses
       SET last_used_at = ?, use_count = use_count + 1
       WHERE id = ?`
    ).bind(new Date().toISOString(), license.id).run();
    return json({ ok: true, account: license.account });
  } catch (error) {
    return handleError(error);
  }
}
