"use strict";

const games = [
  { id: "seth1", name: "ATG－戰神賽特" },
  { id: "seth2", name: "ATG－戰神賽特2 覺醒之力" }
];

const signalIcons = [
  { id: "snake", name: "蛇", image: "./signals/snake.png", maxQuantity: 7 },
  { id: "eye", name: "眼", image: "./signals/eye.png", maxQuantity: 7 },
  { id: "knife", name: "刀", image: "./signals/knife.png", maxQuantity: 7 },
  { id: "bow", name: "弓", image: "./signals/bow.png", maxQuantity: 7 },
  { id: "gem-green", name: "綠寶石", image: "./signals/gem-green.png", maxQuantity: 7 },
  { id: "gem-red", name: "紅寶石", image: "./signals/gem-red.png", maxQuantity: 7 },
  { id: "gem-blue", name: "藍寶石", image: "./signals/gem-blue.png", maxQuantity: 7 },
  { id: "gem-purple", name: "紫寶石", image: "./signals/gem-purple.png", maxQuantity: 7 },
  { id: "gem-yellow", name: "黃寶石", image: "./signals/gem-yellow.png", maxQuantity: 7 },
  { id: "beetle", name: "甲蟲", image: "./signals/beetle.png", maxQuantity: 3, isFreeSpinSymbol: true }
];

const state = {
  settings: null,
  result: null,
  processingLocked: false,
  processingTimers: new Set(),
  processingRaf: null,
  terminalTimer: null,
  clockTimer: null,
  runtimeStartedAt: null,
  loginLocked: false,
  authorizedAccount: ""
};

const byId = (id) => document.getElementById(id);
const loginScreen = byId("loginScreen");
const appShell = byId("appShell");
const settingsScreen = byId("settingsScreen");
const processingScreen = byId("processingScreen");
const resultScreen = byId("resultScreen");
const form = byId("settingsForm");

function showOnly(screen) {
  [settingsScreen, processingScreen, resultScreen].forEach((item) => item.classList.add("hidden"));
  screen.classList.remove("hidden");
  window.scrollTo(0, 0);
}

function populateGames() {
  const select = byId("game");
  games.forEach((game) => {
    const option = document.createElement("option");
    option.value = game.id;
    option.textContent = game.name;
    select.appendChild(option);
  });
}

async function handleLogin() {
  if (state.loginLocked) return;
  const input = byId("accessCode");
  const code = input.value.trim().toUpperCase();
  if (!code) {
    byId("loginError").textContent = "請輸入授權碼";
    input.focus();
    return;
  }
  const button = byId("loginBtn");
  state.loginLocked = true;
  button.disabled = true;
  button.textContent = "驗證中...";
  byId("loginError").textContent = "";
  try {
    const response = await fetch("/api/license/verify", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    if (!response.ok || !data.ok) {
      throw new Error(data.message || "授權驗證失敗");
    }
    state.authorizedAccount = String(data.account || "");
    byId("account").value = state.authorizedAccount;
    byId("loginError").textContent = "";
    document.body.classList.add("unlocked");
    loginScreen.classList.add("hidden");
    appShell.classList.remove("hidden");
    showOnly(settingsScreen);
  } catch (error) {
    const localFile = window.location.protocol === "file:";
    byId("loginError").textContent = localFile
      ? "連線驗證需從正式網站開啟"
      : error.message || "暫時無法連線驗證，請稍後再試";
    input.value = "";
    input.focus();
  } finally {
    state.loginLocked = false;
    button.disabled = false;
    button.textContent = "授權存取";
  }
}

function setError(id, message) {
  byId(id + "Error").textContent = message;
  byId(id).classList.toggle("invalid", Boolean(message));
}

function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(value);
}

function validateSettings() {
  const values = {
    device: byId("device").value,
    account: byId("account").value.trim(),
    amount: byId("amount").value.trim(),
    gameId: byId("game").value,
    tableNumber: byId("tableNumber").value.trim()
  };
  const errors = {
    device: values.device ? "" : "請選擇裝置",
    account: values.account.length >= 2 ? "" : "請輸入至少 2 個字元的會員帳號",
    amount: isPositiveInteger(values.amount) ? "" : "請輸入有效金額",
    game: values.gameId ? "" : "請選擇遊戲",
    tableNumber: isPositiveInteger(values.tableNumber) ? "" : "請輸入有效桌號"
  };
  Object.entries(errors).forEach(([id, message]) => setError(id, message));
  if (Object.values(errors).some(Boolean)) return null;
  values.amount = Number(values.amount);
  values.tableNumber = Number(values.tableNumber);
  values.gameName = games.find((game) => game.id === values.gameId).name;
  byId("account").value = values.account;
  return values;
}

function addTimeout(callback, delay) {
  const timer = setTimeout(() => {
    state.processingTimers.delete(timer);
    callback();
  }, delay);
  state.processingTimers.add(timer);
}

function clearProcessingTimers() {
  state.processingTimers.forEach(clearTimeout);
  state.processingTimers.clear();
  if (state.processingRaf) cancelAnimationFrame(state.processingRaf);
  state.processingRaf = null;
  if (state.terminalTimer) clearInterval(state.terminalTimer);
  state.terminalTimer = null;
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min, max) {
  return (Math.random() * (max - min) + min).toFixed(1);
}

function generateSuggestedBet(amount) {
  const ratio = Math.random() * 0.02 + 0.01;
  return Math.max(1, Math.round(amount * ratio));
}

function shuffleArray(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
  }
  return result;
}

function generateFreeSpinSignals(items) {
  return shuffleArray(items).slice(0, randomInteger(2, 3)).map((signal) => ({
    ...signal,
    quantity: randomInteger(1, signal.maxQuantity)
  }));
}

function appendDefinitionList(container, rows) {
  container.replaceChildren();
  rows.forEach(([label, value]) => {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    container.append(dt, dd);
  });
}

function renderProcessingSummary() {
  const data = state.settings;
  appendDefinitionList(byId("processingSummary"), [
    ["裝置", data.device],
    ["會員帳號", data.account],
    ["設定金額", data.amount.toLocaleString("zh-TW")],
    ["遊戲", data.gameName],
    ["桌號", String(data.tableNumber)]
  ]);
}

function runProgressSegment(from, to, duration, status, onComplete) {
  byId("processingStatus").textContent = status;
  const started = performance.now();
  const update = (now) => {
    if (!state.processingLocked) return;
    const ratio = Math.min(1, (now - started) / duration);
    const value = from + (to - from) * ratio;
    byId("progressBar").style.width = value + "%";
    byId("processingPercent").textContent = Math.floor(value) + "%";
    if (ratio < 1) {
      state.processingRaf = requestAnimationFrame(update);
    } else {
      state.processingRaf = null;
      onComplete();
    }
  };
  state.processingRaf = requestAnimationFrame(update);
}

function startTerminalFeed() {
  const lines = byId("terminalLines");
  const messages = [
    "DATA STREAM / CHANNEL READY",
    "PARAMETER MATRIX / VERIFIED",
    "SIGNAL SAMPLE / SYNCHRONIZED",
    "LOCAL PROCESS / STABLE",
    "RESULT BUFFER / CALIBRATED"
  ];
  lines.replaceChildren();
  state.terminalTimer = setInterval(() => {
    const line = document.createElement("span");
    line.textContent = messages[randomInteger(0, messages.length - 1)] + "  " +
      randomInteger(100000, 999999).toString(16).toUpperCase();
    lines.appendChild(line);
    while (lines.children.length > 5) lines.firstChild.remove();
  }, 320);
}

function startProcessing() {
  if (state.processingLocked) return;
  state.processingLocked = true;
  byId("confirmBtn").disabled = true;
  showOnly(processingScreen);
  renderProcessingSummary();
  byId("progressBar").style.width = "0%";
  byId("processingPercent").textContent = "0%";
  startTerminalFeed();
  runProgressSegment(0, 45, 2500, "偵測數據中", () => {
    runProgressSegment(45, 78, 1800, "數據修改完成", () => {
      runProgressSegment(78, 100, 1800, "修改運行成功", () => {
        state.runtimeStartedAt = Date.now();
        addTimeout(showResults, 600);
      });
    });
  });
}

function createResult() {
  return {
    suggestedBet: generateSuggestedBet(state.settings.amount),
    sampleCount: randomInteger(10000, 30000),
    boostRate: randomDecimal(15, 46),
    freeSpinRate: randomDecimal(1, 5),
    signals: generateFreeSpinSignals(signalIcons)
  };
}

function renderSignals(signals) {
  const container = byId("signalResults");
  const error = byId("signalImageError");
  container.replaceChildren();
  error.textContent = "";
  signals.forEach((signal) => {
    const item = document.createElement("div");
    item.className = "signal-item";
    const imageFrame = document.createElement("div");
    imageFrame.className = "signal-image-frame";
    const image = document.createElement("img");
    image.src = signal.image;
    image.alt = signal.name;
    image.addEventListener("error", () => {
      item.classList.add("image-failed");
      error.textContent = "部分訊號圖示載入失敗，請確認 signals 資料夾仍與 index.html 位於同一專案。";
    });
    const quantity = document.createElement("strong");
    quantity.textContent = "×" + signal.quantity;
    const name = document.createElement("span");
    name.textContent = signal.name;
    imageFrame.appendChild(image);
    item.append(imageFrame, quantity, name);
    container.appendChild(item);
  });
}

function showResults() {
  clearProcessingTimers();
  state.result = createResult();
  const data = state.settings;
  const result = state.result;
  appendDefinitionList(byId("resultData"), [
    ["設定裝置", data.device],
    ["設定帳號", data.account],
    ["設定金額", data.amount.toLocaleString("zh-TW")],
    ["設定遊戲", data.gameName],
    ["建議金額", result.suggestedBet.toLocaleString("zh-TW")],
    ["設定桌號", String(data.tableNumber)],
    ["樣本數量", result.sampleCount.toLocaleString("zh-TW") + "筆"],
    ["降低空轉", "完成"],
    ["提升爆分率", result.boostRate + "%"],
    ["免遊機率", result.freeSpinRate + "%"]
  ]);
  renderSignals(result.signals);
  showOnly(resultScreen);
  startClocks();
}

function formatCurrentDateTime(date) {
  return [
    date.getFullYear(), "年", date.getMonth() + 1, "月", date.getDate(), "日 ",
    date.getHours(), "時", date.getMinutes(), "分", date.getSeconds(), "秒"
  ].join("");
}

function formatElapsedTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}時${minutes}分${seconds}秒`;
}

function updateClocks() {
  byId("currentTime").textContent = formatCurrentDateTime(new Date());
  const elapsed = state.runtimeStartedAt ? Math.max(0, Math.floor((Date.now() - state.runtimeStartedAt) / 1000)) : 0;
  byId("elapsedTime").textContent = formatElapsedTime(elapsed);
}

function startClocks() {
  if (state.clockTimer) clearInterval(state.clockTimer);
  updateClocks();
  state.clockTimer = setInterval(updateClocks, 1000);
}

function resetToSettings() {
  clearProcessingTimers();
  if (state.clockTimer) clearInterval(state.clockTimer);
  state.clockTimer = null;
  state.settings = null;
  state.result = null;
  state.runtimeStartedAt = null;
  state.processingLocked = false;
  form.reset();
  form.querySelectorAll(".field-error").forEach((element) => { element.textContent = ""; });
  form.querySelectorAll(".invalid").forEach((element) => element.classList.remove("invalid"));
  byId("signalResults").replaceChildren();
  byId("confirmBtn").disabled = false;
  showOnly(settingsScreen);
}

byId("loginBtn").addEventListener("click", handleLogin);
byId("accessCode").addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleLogin();
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.processingLocked) return;
  const settings = validateSettings();
  if (!settings) return;
  state.settings = settings;
  startProcessing();
});
form.querySelectorAll("input, select").forEach((element) => {
  element.addEventListener("input", () => {
    const errorId = element.id === "game" ? "gameError" : element.id + "Error";
    const error = byId(errorId);
    if (error) error.textContent = "";
    element.classList.remove("invalid");
  });
});
byId("resetBtn").addEventListener("click", resetToSettings);
window.addEventListener("beforeunload", () => {
  clearProcessingTimers();
  if (state.clockTimer) clearInterval(state.clockTimer);
});

populateGames();
