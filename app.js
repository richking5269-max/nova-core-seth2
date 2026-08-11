"use strict";

const games = [
  { id: "seth1", name: "ATG－戰神賽特", freeSpinCostMultiplier: 100, signalSetId: "seth", maxTableNumber: 1300 },
  { id: "seth2", name: "ATG－戰神賽特2 覺醒之力", freeSpinCostMultiplier: 200, signalSetId: "seth", maxTableNumber: 4000 },
  { id: "red-three-kingdoms", name: "ATG－赤三國", freeSpinCostMultiplier: 100, signalSetId: "red-three-kingdoms", maxTableNumber: 200 },
  { id: "tiger-girl", name: "ATG－虎小妹", freeSpinCostMultiplier: 200, signalSetId: "tiger-girl", maxTableNumber: 3000 }
];

const allowedBetAmounts = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24, 28, 30, 32, 36,
  40, 42, 48, 54, 56, 60, 64, 72, 80, 96, 100, 112, 120, 128, 140, 144, 160,
  180, 200, 240, 280, 300, 320, 360, 400, 420, 480, 500, 540, 560, 600, 640,
  700, 720, 800, 840, 900, 960, 980, 1000, 1080, 1120, 1200, 1260, 1280,
  1400, 1440, 1600, 1800, 2000
];

const minimumFreeSpinPurchases = 3;

const sethSignalIcons = [
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

const redThreeKingdomsSignalIcons = [
  { id: "purple-orb", name: "紫色圓環", image: "./signals/red-three-kingdoms/red3k-purple-orb.png", maxQuantity: 7 },
  { id: "blue-dragon", name: "藍龍", image: "./signals/red-three-kingdoms/red3k-blue-dragon.png", maxQuantity: 7 },
  { id: "gold-emblem", name: "金色圖騰", image: "./signals/red-three-kingdoms/red3k-gold-emblem.png", maxQuantity: 7 },
  { id: "red-emblem", name: "紅色圖騰", image: "./signals/red-three-kingdoms/red3k-red-emblem.png", maxQuantity: 7 },
  { id: "green-emblem", name: "綠色圖騰", image: "./signals/red-three-kingdoms/red3k-green-emblem.png", maxQuantity: 7 },
  { id: "blue-warrior", name: "藍甲武將", image: "./signals/red-three-kingdoms/red3k-blue-warrior.png", maxQuantity: 7 },
  { id: "green-guardian", name: "翡翠守護獸", image: "./signals/red-three-kingdoms/red3k-green-guardian.png", maxQuantity: 7 },
  { id: "purple-weapon", name: "紫色兵器", image: "./signals/red-three-kingdoms/red3k-purple-weapon.png", maxQuantity: 7 },
  { id: "green-weapon", name: "綠色兵器", image: "./signals/red-three-kingdoms/red3k-green-weapon.png", maxQuantity: 7 },
  { id: "scatter", name: "SCATTER", image: "./signals/red-three-kingdoms/red3k-scatter.png", maxQuantity: 3, isFreeSpinSymbol: true }
];

const tigerGirlSignalIcons = [
  { id: "green-gem", name: "綠寶石", image: "./signals/tiger-girl/tiger-green-gem.png", maxQuantity: 7 },
  { id: "blue-gem", name: "藍寶石", image: "./signals/tiger-girl/tiger-blue-gem.png", maxQuantity: 7 },
  { id: "red-gem", name: "紅寶石", image: "./signals/tiger-girl/tiger-red-gem.png", maxQuantity: 7 },
  { id: "gold-emblem", name: "金色圖騰", image: "./signals/tiger-girl/tiger-gold-emblem.png", maxQuantity: 7 },
  { id: "gold-ingot", name: "黃金元寶", image: "./signals/tiger-girl/tiger-gold-ingot.png", maxQuantity: 7 },
  { id: "jade-drum", name: "翡翠鼓", image: "./signals/tiger-girl/tiger-jade-drum.png", maxQuantity: 7 },
  { id: "purple-charm", name: "紫色法器", image: "./signals/tiger-girl/tiger-purple-charm.png", maxQuantity: 7 },
  { id: "yellow-gem", name: "黃寶石", image: "./signals/tiger-girl/tiger-yellow-gem.png", maxQuantity: 7 },
  { id: "purple-gem", name: "紫寶石", image: "./signals/tiger-girl/tiger-purple-gem.png", maxQuantity: 7 },
  { id: "scatter", name: "SCATTER", image: "./signals/tiger-girl/tiger-scatter.png", maxQuantity: 3, isFreeSpinSymbol: true }
];

const signalIconSets = {
  seth: sethSignalIcons,
  "red-three-kingdoms": redThreeKingdomsSignalIcons,
  "tiger-girl": tigerGirlSignalIcons
};

const signalTiers = [
  {
    id: "primary",
    label: "PRIMARY SIGNAL",
    title: "強力推薦",
    rank: "S 級",
    description: "優先觀察此組購買免遊訊號"
  },
  {
    id: "backup-1",
    label: "BACKUP SIGNAL 01",
    title: "備用訊號 1",
    rank: "A 級",
    description: "主訊號未出現時切換觀察"
  },
  {
    id: "backup-2",
    label: "BACKUP SIGNAL 02",
    title: "備用訊號 2",
    rank: "A 級",
    description: "第二組替代觀察訊號"
  }
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

function getGameById(gameId) {
  return games.find((game) => game.id === gameId);
}

function getTableNumberLimit(gameId) {
  return getGameById(gameId)?.maxTableNumber || 4000;
}

function syncTableNumberLimit() {
  const input = byId("tableNumber");
  const game = getGameById(byId("game").value);
  const maximum = game?.maxTableNumber || 4000;
  input.maxLength = String(maximum).length;
  input.setAttribute("aria-valuemax", String(maximum));
  input.title = game ? `${game.name} 房號範圍：1～${maximum}` : "房號範圍依遊戲而定";
  input.placeholder = game
    ? `請輸入您進入的房號（1～${maximum}）`
    : "請輸入您進入的房號";
}

function validateSettings() {
  const values = {
    device: byId("device").value,
    account: byId("account").value.trim(),
    amount: byId("amount").value.trim(),
    gameId: byId("game").value,
    tableNumber: byId("tableNumber").value.trim()
  };
  const selectedGame = getGameById(values.gameId);
  const maximumTableNumber = getTableNumberLimit(values.gameId);
  const errors = {
    device: values.device ? "" : "請選擇裝置",
    account: values.account.length >= 2 ? "" : "請輸入至少 2 個字元的會員帳號",
    amount: isPositiveInteger(values.amount) ? "" : "請輸入有效金額",
    game: values.gameId ? "" : "請選擇遊戲",
    tableNumber: isPositiveInteger(values.tableNumber) && Number(values.tableNumber) <= maximumTableNumber
      ? ""
      : `桌號需為 1～${maximumTableNumber}`
  };
  Object.entries(errors).forEach(([id, message]) => setError(id, message));
  if (Object.values(errors).some(Boolean)) return null;
  values.amount = Number(values.amount);
  values.tableNumber = Number(values.tableNumber);
  values.gameName = selectedGame.name;
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

function generateMachineProfit(random = Math.random) {
  const tiers = [
    { weight: 40, min: 0, max: 50000 },
    { weight: 30, min: 50001, max: 150000 },
    { weight: 14, min: 150001, max: 300000 },
    { weight: 8, min: 300001, max: 400000 },
    { weight: 8, min: 400001, max: 500000 }
  ];
  let roll = random() * 100;
  let selectedTier = tiers[tiers.length - 1];

  for (const tier of tiers) {
    if (roll < tier.weight) {
      selectedTier = tier;
      break;
    }
    roll -= tier.weight;
  }

  const magnitude = Math.floor(
    random() * (selectedTier.max - selectedTier.min + 1)
  ) + selectedTier.min;
  if (magnitude === 0) return 0;
  return magnitude * (random() < 0.2 ? 1 : -1);
}

const machineProfitCacheKey = "nova-core:machine-profit-cache:v1";
const machineProfitCacheWindowMs = 60 * 60 * 1000;
const machineProfitCacheMaxEntries = 50;

function getMachineProfitStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function createEmptyMachineProfitCache() {
  return {
    version: 1,
    lastRoomKey: "",
    rooms: {}
  };
}

function readMachineProfitCache(storage = getMachineProfitStorage()) {
  if (!storage) return createEmptyMachineProfitCache();
  try {
    const cached = JSON.parse(storage.getItem(machineProfitCacheKey) || "");
    if (!cached || cached.version !== 1 || typeof cached.rooms !== "object" || !cached.rooms) {
      return createEmptyMachineProfitCache();
    }
    return {
      version: 1,
      lastRoomKey: typeof cached.lastRoomKey === "string" ? cached.lastRoomKey : "",
      rooms: cached.rooms
    };
  } catch {
    return createEmptyMachineProfitCache();
  }
}

function writeMachineProfitCache(cache, storage = getMachineProfitStorage()) {
  if (!storage) return;
  try {
    storage.setItem(machineProfitCacheKey, JSON.stringify(cache));
  } catch {
    // Private browsing or a full storage quota must not block result generation.
  }
}

function getMachineProfitRoomKey(settings) {
  const account = String(settings.account || "").trim().toLowerCase();
  return `${account}::${settings.tableNumber}`;
}

function generateNearbyMachineProfit(baselineProfit, random = Math.random) {
  const maximumDifference = Math.min(
    40000,
    Math.max(5000, Math.round(Math.abs(baselineProfit) * 0.12))
  );
  const offset = Math.floor(random() * (maximumDifference * 2 + 1)) - maximumDifference;
  let value = Math.max(-500000, Math.min(500000, baselineProfit + offset));

  if (baselineProfit > 0) value = Math.max(1, value);
  if (baselineProfit < 0) value = Math.min(-1, value);
  return value;
}

function pruneMachineProfitCache(cache, currentRoomKey) {
  const entries = Object.entries(cache.rooms);
  if (entries.length <= machineProfitCacheMaxEntries) return;
  entries
    .filter(([roomKey]) => roomKey !== currentRoomKey)
    .sort(([, left], [, right]) => Number(right.lastUsedAt || 0) - Number(left.lastUsedAt || 0))
    .slice(machineProfitCacheMaxEntries - 1)
    .forEach(([roomKey]) => {
      delete cache.rooms[roomKey];
    });
}

function generateCachedMachineProfit(
  settings,
  { now = Date.now(), random = Math.random, storage = getMachineProfitStorage() } = {}
) {
  const cache = readMachineProfitCache(storage);
  const roomKey = getMachineProfitRoomKey(settings);
  const cachedRoom = cache.rooms[roomKey];
  const cachedAt = Number(cachedRoom?.createdAt || 0);
  const withinOneHour = Boolean(
    cachedRoom &&
    cachedAt > 0 &&
    now >= cachedAt &&
    now - cachedAt <= machineProfitCacheWindowMs
  );
  const isConsecutiveRoom = Boolean(cachedRoom && cache.lastRoomKey === roomKey);
  let machineProfit;
  let baselineProfit;
  let createdAt;

  if (cachedRoom && (withinOneHour || isConsecutiveRoom)) {
    baselineProfit = Number(cachedRoom.baselineProfit);
    if (!Number.isFinite(baselineProfit)) baselineProfit = generateMachineProfit(random);
    machineProfit = generateNearbyMachineProfit(baselineProfit, random);
    createdAt = cachedAt || now;
  } else {
    machineProfit = generateMachineProfit(random);
    baselineProfit = machineProfit;
    createdAt = now;
  }

  cache.lastRoomKey = roomKey;
  cache.rooms[roomKey] = {
    baselineProfit,
    lastProfit: machineProfit,
    createdAt,
    lastUsedAt: now
  };
  pruneMachineProfitCache(cache, roomKey);
  writeMachineProfitCache(cache, storage);
  return machineProfit;
}

function selectWeightedSuggestedBet(safeBets, random = Math.random) {
  const maximumBet = safeBets[safeBets.length - 1];
  const groups = [
    {
      weight: 20,
      values: safeBets.filter((bet) => bet > maximumBet * 0.6)
    },
    {
      weight: 70,
      values: safeBets.filter((bet) => bet >= maximumBet * 0.3 && bet <= maximumBet * 0.6)
    },
    {
      weight: 10,
      values: safeBets.filter((bet) => bet < maximumBet * 0.3)
    }
  ].filter((group) => group.values.length > 0);

  const totalWeight = groups.reduce((sum, group) => sum + group.weight, 0);
  let roll = random() * totalWeight;
  let selectedGroup = groups[groups.length - 1];

  for (const group of groups) {
    if (roll < group.weight) {
      selectedGroup = group;
      break;
    }
    roll -= group.weight;
  }

  const selectedIndex = Math.min(
    selectedGroup.values.length - 1,
    Math.floor(random() * selectedGroup.values.length)
  );
  return selectedGroup.values[selectedIndex];
}

function calculateBetPlan(amount, gameId, random = Math.random) {
  const game = games.find((item) => item.id === gameId);
  const freeSpinMultiplier = game ? game.freeSpinCostMultiplier : 200;
  const requiredCapitalMultiplier = freeSpinMultiplier * minimumFreeSpinPurchases;
  const safeBetCeiling = Math.floor(amount / requiredCapitalMultiplier);
  const safeBets = allowedBetAmounts.filter((bet) => bet <= safeBetCeiling);

  if (safeBets.length === 0) {
    return {
      suggestedBet: null,
      freeSpinCost: null,
      remainingBalance: amount,
      purchaseCapacity: 0,
      minimumRequired: allowedBetAmounts[0] * requiredCapitalMultiplier
    };
  }

  const suggestedBet = selectWeightedSuggestedBet(safeBets, random);
  const freeSpinCost = suggestedBet * freeSpinMultiplier;
  return {
    suggestedBet,
    freeSpinCost,
    remainingBalance: amount - freeSpinCost,
    purchaseCapacity: Math.floor(amount / freeSpinCost),
    minimumRequired: 0
  };
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
    quantity: randomInteger(
      1,
      signal.isFreeSpinSymbol ? Math.min(3, signal.maxQuantity) : signal.maxQuantity
    )
  }));
}

function generateSignalPackages(items, gameName) {
  return signalTiers.map((tier) => ({
    ...tier,
    gameName,
    assetsPending: items.length === 0,
    signals: generateFreeSpinSignals(items)
  }));
}

function appendDefinitionList(container, rows) {
  container.replaceChildren();
  rows.forEach(([label, value, valueClass = ""]) => {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    if (valueClass) dd.classList.add(valueClass);
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
  const betPlan = calculateBetPlan(state.settings.amount, state.settings.gameId);
  const selectedGame = games.find((game) => game.id === state.settings.gameId);
  const signalItems = signalIconSets[selectedGame?.signalSetId] || [];
  return {
    ...betPlan,
    sampleCount: randomInteger(10000, 30000),
    boostRate: randomDecimal(15, 46),
    freeSpinRate: randomDecimal(1, 5),
    machineProfit: generateCachedMachineProfit(state.settings),
    signalPackages: generateSignalPackages(signalItems, selectedGame?.name || state.settings.gameName)
  };
}

function renderSignals(packages) {
  const container = byId("signalResults");
  const error = byId("signalImageError");
  container.replaceChildren();
  error.textContent = "";
  packages.forEach((signalPackage) => {
    const card = document.createElement("article");
    card.className = `signal-plan ${signalPackage.id}`;
    if (signalPackage.assetsPending) card.classList.add("assets-pending");
    card.setAttribute("aria-label", signalPackage.title);

    const header = document.createElement("div");
    header.className = "signal-plan-header";
    const headingGroup = document.createElement("div");
    const label = document.createElement("p");
    label.className = "signal-plan-label";
    label.textContent = signalPackage.label;
    const heading = document.createElement("h4");
    heading.textContent = signalPackage.title;
    const rank = document.createElement("span");
    rank.className = "signal-rank";
    rank.textContent = signalPackage.rank;
    headingGroup.append(label, heading);
    header.append(headingGroup, rank);

    const description = document.createElement("p");
    description.className = "signal-plan-description";
    description.textContent = signalPackage.assetsPending
      ? `${signalPackage.gameName} 圖示素材準備中`
      : signalPackage.description;

    const signalList = document.createElement("div");
    signalList.className = "signal-plan-items";
    const signalsToRender = signalPackage.assetsPending
      ? Array.from({ length: 3 }, (_, index) => ({
          id: `placeholder-${index + 1}`,
          name: "圖示待置入",
          isPlaceholder: true
        }))
      : signalPackage.signals;
    signalsToRender.forEach((signal) => {
      const item = document.createElement("div");
      item.className = "signal-item";
      if (signal.isPlaceholder) {
        item.classList.add("signal-placeholder");
        const placeholderFrame = document.createElement("span");
        placeholderFrame.className = "signal-placeholder-mark";
        placeholderFrame.setAttribute("aria-hidden", "true");
        const placeholderState = document.createElement("strong");
        placeholderState.textContent = "ASSET SLOT";
        const placeholderName = document.createElement("span");
        placeholderName.textContent = signal.name;
        item.append(placeholderFrame, placeholderState, placeholderName);
        signalList.appendChild(item);
        return;
      }
      const imageFrame = document.createElement("div");
      imageFrame.className = "signal-image-frame";
      const image = document.createElement("img");
      image.src = signal.image;
      image.alt = "";
      image.addEventListener("error", () => {
        item.classList.add("image-failed");
        error.textContent = "部分訊號圖示載入失敗，請確認 signals 資料夾仍與 index.html 位於同一專案。";
      });
      const quantity = document.createElement("strong");
      quantity.textContent = "×" + signal.quantity;
      imageFrame.appendChild(image);
      item.append(imageFrame, quantity);
      signalList.appendChild(item);
    });

    card.append(header, description, signalList);
    container.appendChild(card);
  });
}

function showResults() {
  clearProcessingTimers();
  state.result = createResult();
  const data = state.settings;
  const result = state.result;
  const suggestedBetText = result.suggestedBet === null
    ? `資金不足（至少需 ${result.minimumRequired.toLocaleString("zh-TW")}）`
    : result.suggestedBet.toLocaleString("zh-TW");
  const machineProfitText = result.machineProfit > 0
    ? `+${result.machineProfit.toLocaleString("zh-TW")}`
    : result.machineProfit.toLocaleString("zh-TW");
  const machineProfitClass = result.machineProfit > 0
    ? "profit-positive"
    : result.machineProfit < 0
      ? "profit-negative"
      : "profit-neutral";
  appendDefinitionList(byId("resultData"), [
    ["設定裝置", data.device],
    ["設定帳號", data.account],
    ["設定金額", data.amount.toLocaleString("zh-TW")],
    ["設定遊戲", data.gameName],
    ["建議金額", suggestedBetText],
    ["設定桌號", String(data.tableNumber)],
    ["機台損益", machineProfitText, machineProfitClass],
    ["樣本數量", result.sampleCount.toLocaleString("zh-TW") + "筆"],
    ["降低空轉", "完成"],
    ["提升爆分率", result.boostRate + "%"],
    ["免遊機率", result.freeSpinRate + "%"]
  ]);
  renderSignals(result.signalPackages);
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
  byId("amount").value = "";
  byId("game").value = "";
  byId("tableNumber").value = "";
  syncTableNumberLimit();
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
byId("game").addEventListener("change", syncTableNumberLimit);
byId("resetBtn").addEventListener("click", resetToSettings);
window.addEventListener("beforeunload", () => {
  clearProcessingTimers();
  if (state.clockTimer) clearInterval(state.clockTimer);
});

populateGames();
syncTableNumberLimit();
