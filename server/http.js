export function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

export async function readJson(request, maxBytes = 4096) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) {
    throw new HttpError(413, "請求內容過大");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new HttpError(413, "請求內容過大");
  }
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new HttpError(400, "資料格式錯誤");
  }
}

export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");
  const expected = new URL(request.url).origin;
  if (!origin || origin !== expected) {
    throw new HttpError(403, "來源驗證失敗");
  }
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function handleError(error) {
  if (error instanceof HttpError) {
    return json({ ok: false, message: error.message }, error.status);
  }
  console.error("Unhandled API error", error);
  return json({ ok: false, message: "系統暫時無法處理，請稍後再試" }, 500);
}
