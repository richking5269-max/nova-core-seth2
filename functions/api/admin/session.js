import { getAdminSession } from "../../../server/auth.js";
import { handleError, json } from "../../../server/http.js";

export async function onRequestGet(context) {
  try {
    const session = await getAdminSession(context.request, context.env);
    return json({ ok: Boolean(session), authenticated: Boolean(session) }, session ? 200 : 401);
  } catch (error) {
    return handleError(error);
  }
}
