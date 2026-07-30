import { clearAdminSession } from "../../../server/auth.js";
import { assertSameOrigin, handleError, json } from "../../../server/http.js";

export async function onRequestPost(context) {
  try {
    assertSameOrigin(context.request);
    return json({ ok: true }, 200, {
      "Set-Cookie": clearAdminSession(context.request)
    });
  } catch (error) {
    return handleError(error);
  }
}
