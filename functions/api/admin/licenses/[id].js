import { requireAdmin } from "../../../../server/auth.js";
import { ensureDatabase } from "../../../../server/db.js";
import { assertSameOrigin, handleError, HttpError, json } from "../../../../server/http.js";

export async function onRequestDelete(context) {
  try {
    assertSameOrigin(context.request);
    await ensureDatabase(context.env);
    await requireAdmin(context.request, context.env);
    const id = String(context.params.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      throw new HttpError(400, "資料識別碼錯誤");
    }
    const result = await context.env.DB.prepare(
      "DELETE FROM licenses WHERE id = ?"
    ).bind(id).run();
    if (!result.meta || Number(result.meta.changes) < 1) {
      throw new HttpError(404, "找不到這筆使用者資料");
    }
    return json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
