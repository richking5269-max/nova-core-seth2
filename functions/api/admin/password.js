import { updateAdminPassword, verifyAdminPassword } from "../../../server/admin-password.js";
import { createAdminSession, requireAdmin } from "../../../server/auth.js";
import { ensureDatabase } from "../../../server/db.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../server/http.js";

export async function onRequestPost(context) {
  try {
    assertSameOrigin(context.request);
    await ensureDatabase(context.env);
    await requireAdmin(context.request, context.env);
    const body = await readJson(context.request);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");
    if (!(await verifyAdminPassword(context.env, currentPassword))) {
      throw new HttpError(401, "目前密碼錯誤");
    }
    if (newPassword !== confirmPassword) throw new HttpError(400, "兩次輸入的新密碼不一致");
    await updateAdminPassword(context.env, newPassword);
    const cookie = await createAdminSession(context.request, context.env);
    return json({ ok: true, message: "管理員密碼已更新" }, 200, { "Set-Cookie": cookie });
  } catch (error) {
    return handleError(error);
  }
}
