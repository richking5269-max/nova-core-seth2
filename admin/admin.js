"use strict";

const state = {
  licenses: [],
  deleteTarget: null
};

const byId = (id) => document.getElementById(id);
const loginView = byId("loginView");
const dashboardView = byId("dashboardView");
const codeDialog = byId("codeDialog");
const deleteDialog = byId("deleteDialog");
const passwordDialog = byId("passwordDialog");
let toastTimer = null;

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = { message: "伺服器回應格式錯誤" };
  }
  if (!response.ok) {
    const error = new Error(data.message || "操作失敗");
    error.status = response.status;
    throw error;
  }
  return data;
}

function setBusy(button, busy, busyText, normalText) {
  button.disabled = busy;
  button.textContent = busy ? busyText : normalText;
}

function showToast(message) {
  const toast = byId("adminToast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

function showLogin() {
  dashboardView.classList.add("hidden");
  loginView.classList.remove("hidden");
  byId("adminPassword").value = "";
}

function showDashboard() {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
}

async function checkSession() {
  try {
    await api("/api/admin/session");
    showDashboard();
    await loadLicenses();
  } catch {
    showLogin();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const password = byId("adminPassword").value;
  const button = byId("adminLoginBtn");
  byId("loginError").textContent = "";
  if (!password) {
    byId("loginError").textContent = "請輸入管理員密碼";
    return;
  }
  setBusy(button, true, "驗證中...", "登入後台");
  try {
    await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password })
    });
    showDashboard();
    await loadLicenses();
  } catch (error) {
    byId("loginError").textContent = error.message;
  } finally {
    setBusy(button, false, "驗證中...", "登入後台");
  }
}

async function handleLogout() {
  const button = byId("logoutBtn");
  button.disabled = true;
  try {
    await api("/api/admin/logout", { method: "POST", body: "{}" });
  } catch {
    // The local session is cleared from the UI even if the request fails.
  } finally {
    button.disabled = false;
    showLogin();
  }
}

function openPasswordDialog() {
  byId("passwordForm").reset();
  byId("passwordError").textContent = "";
  passwordDialog.showModal();
  byId("currentAdminPassword").focus();
}

async function handlePasswordChange(event) {
  event.preventDefault();
  const currentPassword = byId("currentAdminPassword").value;
  const newPassword = byId("newAdminPassword").value;
  const confirmPassword = byId("confirmAdminPassword").value;
  const button = byId("changePasswordBtn");
  const error = byId("passwordError");
  error.textContent = "";
  if (!currentPassword) { error.textContent = "請輸入目前密碼"; return; }
  if (newPassword.length < 6) { error.textContent = "新密碼至少需要 6 個字元"; return; }
  if (newPassword !== confirmPassword) { error.textContent = "兩次輸入的新密碼不一致"; return; }
  setBusy(button, true, "更新中...", "確認更改");
  try {
    const data = await api("/api/admin/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
    byId("passwordForm").reset();
    passwordDialog.close();
    showToast(data.message || "管理員密碼已更新");
  } catch (requestError) {
    error.textContent = requestError.message;
  } finally {
    setBusy(button, false, "更新中...", "確認更改");
  }
}

function formatDate(value) {
  if (!value) return "尚未使用";
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));
}

function updateStats(items) {
  const used = items.filter((item) => Number(item.use_count) > 0).length;
  const totalUses = items.reduce((sum, item) => sum + Number(item.use_count || 0), 0);
  byId("totalCount").textContent = String(items.length);
  byId("usedCount").textContent = String(used);
  byId("unusedCount").textContent = String(items.length - used);
  byId("verificationCount").textContent = totalUses.toLocaleString("zh-TW");
}

function createCell(label, value, className = "") {
  const cell = document.createElement("div");
  cell.className = `license-cell ${className}`.trim();
  const small = document.createElement("small");
  const content = document.createElement(className === "account" ? "strong" : "span");
  small.textContent = label;
  content.textContent = value;
  cell.append(small, content);
  return cell;
}

function renderLicenses() {
  const query = byId("searchInput").value.trim().toLocaleLowerCase("zh-TW");
  const items = state.licenses.filter((item) => {
    if (!query) return true;
    return String(item.account).toLocaleLowerCase("zh-TW").includes(query)
      || String(item.note || "").toLocaleLowerCase("zh-TW").includes(query)
      || String(item.license_code || "").toLocaleLowerCase("zh-TW").includes(query);
  });
  const list = byId("licenseList");
  list.replaceChildren();
  byId("emptyState").classList.toggle("hidden", items.length > 0);
  list.classList.toggle("hidden", items.length === 0);

  items.forEach((item) => {
    const row = document.createElement("article");
    row.className = "license-row";
    const account = createCell("用戶帳號", item.account, "account");
    const note = createCell("啟用日期/代理線", item.note || "—", "note");
    const code = createCell(
      "授權碼",
      item.license_code || `舊資料無法還原（末四碼 ${item.code_last4 || "----"}）`,
      "code"
    );
    code.querySelector("span").classList.add("code-tail");
    const created = createCell("建立時間", formatDate(item.created_at), "created");
    const usage = createCell("使用狀態", Number(item.use_count) > 0 ? `已驗證 ${item.use_count} 次` : "尚未使用", "last-used");
    usage.querySelector("span").classList.add("usage-badge");
    if (!Number(item.use_count)) usage.querySelector("span").classList.add("unused");
    usage.title = item.last_used_at ? `最後使用：${formatDate(item.last_used_at)}` : "尚未使用";
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `刪除 ${item.account}`);
    deleteButton.addEventListener("click", () => openDeleteDialog(item));
    row.append(account, note, code, created, usage, deleteButton);
    list.appendChild(row);
  });
}

async function loadLicenses() {
  byId("loadingState").classList.remove("hidden");
  byId("licenseList").classList.add("hidden");
  byId("emptyState").classList.add("hidden");
  byId("listError").textContent = "";
  try {
    const data = await api("/api/admin/licenses");
    state.licenses = data.licenses || [];
    updateStats(state.licenses);
    renderLicenses();
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      return;
    }
    byId("listError").textContent = error.message;
  } finally {
    byId("loadingState").classList.add("hidden");
  }
}

function toggleCreatePanel(visible) {
  byId("createPanel").classList.toggle("hidden", !visible);
  if (visible) byId("userAccount").focus();
}

async function handleCreate(event) {
  event.preventDefault();
  const account = byId("userAccount").value.trim();
  const note = byId("userNote").value.trim();
  const button = byId("createBtn");
  byId("accountError").textContent = "";
  byId("noteError").textContent = "";
  byId("createError").textContent = "";
  if (account.length < 2) {
    byId("accountError").textContent = "帳號至少需要 2 個字元";
    return;
  }
  if (note.length > 300) {
    byId("noteError").textContent = "啟用日期/代理線不可超過 300 個字元";
    return;
  }
  setBusy(button, true, "正在建立...", "確認並產生授權碼");
  try {
    const data = await api("/api/admin/licenses", {
      method: "POST",
      body: JSON.stringify({ account, note })
    });
    byId("generatedAccount").textContent = data.license.account;
    byId("generatedCode").textContent = data.license.code;
    byId("copyStatus").textContent = "";
    byId("createUserForm").reset();
    toggleCreatePanel(false);
    codeDialog.showModal();
    await loadLicenses();
  } catch (error) {
    byId("createError").textContent = error.message;
  } finally {
    setBusy(button, false, "正在建立...", "確認並產生授權碼");
  }
}

async function copyCode() {
  const code = byId("generatedCode").textContent;
  try {
    await navigator.clipboard.writeText(code);
    byId("copyStatus").textContent = "已複製到剪貼簿";
    byId("copyCodeBtn").textContent = "已複製";
  } catch {
    byId("copyStatus").textContent = "無法自動複製，請手動選取授權碼";
  }
}

function closeCodeDialog() {
  codeDialog.close();
  byId("generatedCode").textContent = "";
  byId("copyCodeBtn").textContent = "複製";
}

function openDeleteDialog(item) {
  state.deleteTarget = item;
  byId("deleteAccount").textContent = item.account;
  byId("deleteError").textContent = "";
  deleteDialog.showModal();
}

async function confirmDelete() {
  if (!state.deleteTarget) return;
  const button = byId("confirmDeleteBtn");
  setBusy(button, true, "刪除中...", "確認刪除");
  byId("deleteError").textContent = "";
  try {
    await api(`/api/admin/licenses/${encodeURIComponent(state.deleteTarget.id)}`, {
      method: "DELETE"
    });
    deleteDialog.close();
    state.deleteTarget = null;
    await loadLicenses();
  } catch (error) {
    byId("deleteError").textContent = error.message;
  } finally {
    setBusy(button, false, "刪除中...", "確認刪除");
  }
}

byId("adminLoginForm").addEventListener("submit", handleLogin);
byId("logoutBtn").addEventListener("click", handleLogout);
byId("openPasswordBtn").addEventListener("click", openPasswordDialog);
byId("passwordForm").addEventListener("submit", handlePasswordChange);
byId("cancelPasswordBtn").addEventListener("click", () => passwordDialog.close());
byId("openCreateBtn").addEventListener("click", () => toggleCreatePanel(true));
byId("closeCreateBtn").addEventListener("click", () => toggleCreatePanel(false));
byId("createUserForm").addEventListener("submit", handleCreate);
byId("refreshListBtn").addEventListener("click", loadLicenses);
byId("searchInput").addEventListener("input", renderLicenses);
byId("copyCodeBtn").addEventListener("click", copyCode);
byId("closeCodeBtn").addEventListener("click", closeCodeDialog);
byId("cancelDeleteBtn").addEventListener("click", () => {
  deleteDialog.close();
  state.deleteTarget = null;
});
byId("confirmDeleteBtn").addEventListener("click", confirmDelete);

checkSession();
