import { onRequestPost as adminLogin } from "../functions/api/admin/login.js";
import { onRequestPost as adminLogout } from "../functions/api/admin/logout.js";
import { onRequestGet as adminSession } from "../functions/api/admin/session.js";
import { onRequestPost as changeAdminPassword } from "../functions/api/admin/password.js";
import {
  onRequestGet as listLicenses,
  onRequestPost as createLicense
} from "../functions/api/admin/licenses/index.js";
import { onRequestDelete as deleteLicense } from "../functions/api/admin/licenses/[id].js";
import { onRequestPost as verifyLicense } from "../functions/api/license/verify.js";

function methodNotAllowed() {
  return Response.json(
    { ok: false, message: "不支援的請求方式" },
    { status: 405, headers: { "Cache-Control": "no-store", Allow: "GET, POST, DELETE" } }
  );
}

function contextFor(request, env, executionContext, params = {}) {
  return {
    request,
    env,
    params,
    waitUntil: executionContext.waitUntil.bind(executionContext),
    passThroughOnException:
      typeof executionContext.passThroughOnException === "function"
        ? executionContext.passThroughOnException.bind(executionContext)
        : () => {}
  };
}

export default {
  async fetch(request, env, executionContext) {
    const url = new URL(request.url);
    const context = contextFor(request, env, executionContext);

    if (url.pathname === "/api/license/verify") {
      return request.method === "POST" ? verifyLicense(context) : methodNotAllowed();
    }
    if (url.pathname === "/api/admin/login") {
      return request.method === "POST" ? adminLogin(context) : methodNotAllowed();
    }
    if (url.pathname === "/api/admin/logout") {
      return request.method === "POST" ? adminLogout(context) : methodNotAllowed();
    }
    if (url.pathname === "/api/admin/session") {
      return request.method === "GET" ? adminSession(context) : methodNotAllowed();
    }
    if (url.pathname === "/api/admin/password") {
      return request.method === "POST" ? changeAdminPassword(context) : methodNotAllowed();
    }
    if (url.pathname === "/api/admin/licenses") {
      if (request.method === "GET") return listLicenses(context);
      if (request.method === "POST") return createLicense(context);
      return methodNotAllowed();
    }

    const deleteMatch = url.pathname.match(/^\/api\/admin\/licenses\/([0-9a-f-]{36})$/i);
    if (deleteMatch) {
      return request.method === "DELETE"
        ? deleteLicense(contextFor(request, env, executionContext, { id: deleteMatch[1] }))
        : methodNotAllowed();
    }
    if (url.pathname.startsWith("/api/")) {
      return Response.json(
        { ok: false, message: "找不到 API 路徑" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (url.pathname === "/admin") {
      return Response.redirect(`${url.origin}/admin/`, 308);
    }
    if (url.pathname === "/admin/") {
      const adminUrl = new URL("/admin/index.html", url);
      return env.ASSETS.fetch(new Request(adminUrl, request));
    }
    return env.ASSETS.fetch(request);
  }
};
