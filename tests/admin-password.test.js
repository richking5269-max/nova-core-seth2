import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { onRequestPost as changeAdminPassword } from "../functions/api/admin/password.js";
import { createAdminSession, requireAdmin } from "../server/auth.js";
import { deriveAdminPasswordHash, validateAdminPassword, verifyAdminPassword } from "../server/admin-password.js";

function createEnvironment() {
  let credential = null;
  const DB = {
    async batch() {},
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async all() {
          return /PRAGMA table_info\(licenses\)/.test(sql)
            ? { results: [{ name: "license_code" }] }
            : { results: [] };
        },
        async first() {
          return /SELECT password_salt/.test(sql) ? credential : null;
        },
        async run() {
          if (/INSERT INTO admin_credentials/.test(sql)) {
            credential = {
              password_salt: values[0],
              password_hash: values[1],
              version: credential ? credential.version + 1 : 1
            };
          }
          return { meta: { changes: 1 } };
        }
      };
    }
  };
  return {
    DB,
    ADMIN_PASSWORD: "initial-admin-password",
    ADMIN_SESSION_SECRET: "test-session-secret-with-at-least-thirty-two-characters"
  };
}

test("admin passwords use salted PBKDF2 and enforce length limits", async () => {
  const salt = "00112233445566778899aabbccddeeff";
  const hash = await deriveAdminPasswordHash("sample-password", salt);
  assert.equal(hash.length, 64);
  assert.equal(hash, await deriveAdminPasswordHash("sample-password", salt));
  assert.equal(validateAdminPassword("123456"), "123456");
  assert.throws(() => validateAdminPassword("12345"), /至少需要 6 個字元/);
});

test("password API replaces the initial secret and invalidates older sessions", async () => {
  const env = createEnvironment();
  const loginRequest = new Request("https://example.test/api/admin/login");
  const oldCookie = await createAdminSession(loginRequest, env);
  const request = new Request("https://example.test/api/admin/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: oldCookie.split(";")[0],
      Origin: "https://example.test"
    },
    body: JSON.stringify({
      currentPassword: "initial-admin-password",
      newPassword: "replacement-admin-password",
      confirmPassword: "replacement-admin-password"
    })
  });
  const response = await changeAdminPassword({ request, env });
  assert.equal(response.status, 200);
  assert.equal(await verifyAdminPassword(env, "initial-admin-password"), false);
  assert.equal(await verifyAdminPassword(env, "replacement-admin-password"), true);
  await assert.rejects(() => requireAdmin(new Request("https://example.test", {
    headers: { Cookie: oldCookie.split(";")[0] }
  }), env), /管理員密碼已變更/);
  const refreshedCookie = response.headers.get("set-cookie").split(";")[0];
  await assert.doesNotReject(() => requireAdmin(new Request("https://example.test", {
    headers: { Cookie: refreshedCookie }
  }), env));
});

test("admin UI, migration and worker password route are present", async () => {
  const adminHtml = await readFile(new URL("../admin/index.html", import.meta.url), "utf8");
  const adminJs = await readFile(new URL("../admin/admin.js", import.meta.url), "utf8");
  const worker = await readFile(new URL("../worker/entry.js", import.meta.url), "utf8");
  const migration = await readFile(new URL("../migrations/0003_admin_credentials.sql", import.meta.url), "utf8");
  assert.match(adminHtml, /id="openPasswordBtn"/);
  assert.match(adminHtml, /id="passwordDialog"/);
  assert.match(adminJs, /\/api\/admin\/password/);
  assert.match(worker, /\/api\/admin\/password/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS admin_credentials/);
});
