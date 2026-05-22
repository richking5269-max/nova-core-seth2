/* ================================================================
   NOVA CORE 賽特 II｜AI 實戰分析終端  —  app.js
================================================================ */

const ACCESS_CODE = String.fromCharCode(65, 65, 65, 56, 56, 56);

// ════════════════════════════════════════
// 文字庫
// ════════════════════════════════════════
const sSignals = [
  '覺醒免遊符號出現兩次以上',
  '免遊符號兩隻以上連續出現',
  '2顆免遊符號配1顆覺醒免遊符號',
  '4顆綠倍數球',
  '2顆6倍球',
  '百倍球未消',
  '綠倍數球集中在同一區',
  '綠倍數球與藍倍數球同時出現',
];

const aSignals = [
  '版面三色寶石＋三種大圖',
  '2組7大圖',
  '7顆大圖集中在中間',
  '6顆大圖集中',
  '7眼未消',
  '6眼2弓',
  '5蛇2刀',
  '6蛇1弓',
  '6眼1甲',
  '7弓未消',
  '5刀2蛇',
  '6刀1寶石',
  '7顆黃寶石',
  '6顆綠寶石',
  '5紅寶2紫寶',
  '三色寶石集中',
  '對角紅寶連鎖',
  '中心十字大圖',
  'L型大圖排列',
  '兩直列大圖',
  '大圖兩柱',
  '3組4大圖',
  '對子圖5對',
  '對子圖6對',
  '整齊對子圖5對',
  '3甲並排',
  '4顆甲蟲靠中間',
  '2甲蟲3眼4刀',
  '角落兩甲',
  '彩甲＋5眼',
  '5眼1甲',
  '連兩轉出現甲蟲',
  '5蛇4刀',
  '5蛇4刀6紅寶',
  '4蛇4刀',
  '4弓5刀5藍寶',
  '1眼6蛇7弓',
  '4紅2紫2黃高價寶石',
  '版面邊緣大圖包圍',
  '3顆免遊符號分散',
  '2顆免遊符號靠中間',
  '2顆免遊符號連續進場',
  '覺醒免遊符號短線出現',
  '免遊符號距離變近',
  '免遊符號壓線',
];

const bSignals = [
  '連續5轉單眼未消',
  '單消三種寶石',
  '平轉10轉未消',
  '平轉7轉未消',
  '單次連消5次',
  '連續8次未消',
  '單消綠寶',
  '消三種大圖',
  '3轉內連消藍寶',
  '版面散亂',
  '消黃寶石',
  '平轉8次未消',
  '紅寶黃寶同消',
  '平轉單消蛇',
  '進免只得 BIG WIN',
  '免遊符號分散',
  '低價圖太多',
  '大圖位置太散',
  '寶石斷層明顯',
  '主圖分散沒有集中',
];

const hotCommands = [
  '偵測到高能爆發區，建議優先鎖定此房號。',
  '免遊前兆明顯，建議先守此房觀察下一波。',
  '高倍球殘留未消，可列入短線追蹤目標。',
  '大圖集中度偏高，建議等待下一輪連消。',
  '覺醒免遊符號出現，建議提高此房觀察優先度。',
  '連消訊號偏強，建議小額跟進觀察節奏。',
  '版面熱度偏高，短線不建議立刻換房。',
  '倍數球位置漂亮，建議觀察是否接免遊符號。',
  '4顆綠倍數球訊號成立，建議優先追蹤。',
  '百倍球未消，建議守候下一輪版面變化。',
];

const highCommands = [
  '小額試探，平轉30次後若無連消可考慮加注。',
  '版面能量累積中，建議採用自動轉50次策略。',
  '免遊符號尚未集中，建議先守低額觀察。',
  '大圖數量偏多，可先列入第二觀察房。',
  '寶石有連消跡象，建議手動慢轉觀察圖案分佈。',
  '甲蟲訊號出現，建議觀察15轉內是否延續。',
  '未消符號偏多，可小額測試一輪版面。',
  '蛇與刀訊號交替，建議每10轉微調押注金額。',
  '出現對子圖，建議提高轉押額度，持續15轉。',
  '3甲並排訊號出現，建議加注5轉尋求突破。',
];

const midCommands = [
  '目前訊號普通，建議先觀望等待下一輪刷新。',
  '偵測到B級訊號，建議平轉50次觀察版面變化。',
  '版面偏散，建議低額慢轉觀察是否集中。',
  '寶石連消後趨於平緩，建議恢復最低押注保底。',
  '目前訊號混沌，建議保持目前押注金額觀望。',
  '免遊符號分佈偏散，建議等待下一次靠近。',
  '連續單消寶石，建議手動慢轉觀察圖案分佈。',
  '若15轉內未見甲蟲，建議更換目標房間。',
  '無明顯強勢訊號，建議採用保守策略平轉累積。',
  '版面尚未轉熱，建議不要急著提高押注。',
];

const lowCommands = [
  '偵測到假訊號頻繁，建議立即停手冷卻5分鐘。',
  '房間目前偏冷，可考慮更換房間或等待10分鐘。',
  '免遊符號太分散，暫不建議列入優先房號。',
  '版面弱勢明顯，建議先觀察其他房號。',
  '大圖位置太散，短線不建議提高押注。',
  '寶石斷層明顯，建議等待下一輪刷新。',
  '主圖沒有集中，建議降低節奏保守觀望。',
  '目前僅有小訊號，建議不要硬追此房。',
  '平轉節奏偏冷，建議先換房比較。',
  '連消條件不足，建議冷卻後再觀察。',
];

// ════════════════════════════════════════
// 工具函式
// ════════════════════════════════════════
const rand      = (a, b) => Math.random() * (b - a) + a;
const randInt   = (a, b) => Math.floor(rand(a, b + 1));
const randomFrom = arr  => arr[randInt(0, arr.length - 1)];
const randomBetween = (a, b) => rand(a, b);

function fmtRoom(n) { return '房號' + String(n).padStart(4, '0'); }
function fmtProb(n) { return n.toFixed(2) + '%'; }

// ════════════════════════════════════════
// 在線會員（每 10 秒 ±1~9 微幅變動）
// ════════════════════════════════════════
let onlineMembers = randInt(129, 561);

function updateOnlineMembers() {
  const change = randInt(-9, 9);
  onlineMembers = Math.max(129, Math.min(561, onlineMembers + change));
  renderTicker();
}

// ════════════════════════════════════════
// 跑馬燈
// ════════════════════════════════════════
function renderTicker() {
  const el = document.getElementById('tickerTrack');
  if (!el) return;
  const text = `僅供內部測試使用｜當前平均訊號強度：89.8%｜即時在線會員：${onlineMembers} 人｜訊號源：亞太節點同步`;
  el.innerHTML = `<span>${text}</span><span>${text}</span><span>${text}</span>`;
}

// ════════════════════════════════════════
// 房號生成（40 間不重複）
// ════════════════════════════════════════
function genUniqueNums(count, min, max) {
  const pool = new Set();
  while (pool.size < count) pool.add(randInt(min, max));
  return [...pool];
}

// ════════════════════════════════════════
// Tier
// ════════════════════════════════════════
function getTier(prob) {
  if (prob >= 95) return 's';
  if (prob >= 75) return 'a';
  return 'b';
}
function getBadgeLabel(prob) {
  if (prob >= 95) return 'S 級';
  if (prob >= 85) return 'A 級';
  if (prob >= 75) return 'A 級';
  return 'B 級';
}

// ════════════════════════════════════════
// 訊號 & 指令（只在建立 / 刷新時抽，不每秒換）
// ════════════════════════════════════════
function buildSignals(prob) {
  const signals = [];
  if (prob >= 95) {
    signals.push({ tag: 'S', text: randomFrom(sSignals) });
  }
  signals.push({ tag: 'A', text: randomFrom(aSignals) });
  signals.push({ tag: 'B', text: randomFrom(bSignals) });
  return signals;
}

function buildCommand(prob) {
  if (prob >= 95) return randomFrom(hotCommands);
  if (prob >= 85) return randomFrom(highCommands);
  if (prob >= 75) return randomFrom(midCommands);
  return randomFrom(lowCommands);
}

// ════════════════════════════════════════
// 建立房間（房號、訊號、指令固定）
// ════════════════════════════════════════
function makeRoom(roomNum) {
  const prob = parseFloat(rand(70.00, 98.80).toFixed(2));
  return {
    roomNum,
    name:    fmtRoom(roomNum),
    prob,
    signals: buildSignals(prob),
    cmd:     buildCommand(prob),
  };
}

// ════════════════════════════════════════
// 機率浮動（每秒，只動機率）
// ════════════════════════════════════════
function fluctuateRate(prob) {
  let rangeMin, rangeMax;
  if      (prob >= 95) { rangeMin = 0.01; rangeMax = 0.05; }
  else if (prob >= 90) { rangeMin = 0.03; rangeMax = 0.08; }
  else if (prob >= 85) { rangeMin = 0.05; rangeMax = 0.12; }
  else                 { rangeMin = 0.08; rangeMax = 0.18; }

  const range     = randomBetween(rangeMin, rangeMax);
  const direction = Math.random() > 0.5 ? 1 : -1;
  const next      = prob + direction * range;
  return parseFloat(Math.max(70, Math.min(98.8, next)).toFixed(2));
}

// ════════════════════════════════════════
// 全域狀態
// ════════════════════════════════════════
let rooms       = [];
let tickTimer   = null;
let memberTimer = null;

// ════════════════════════════════════════
// DOM
// ════════════════════════════════════════
const loginScreen = document.getElementById('loginScreen');
const dashboard   = document.getElementById('dashboard');
const loginBtn    = document.getElementById('loginBtn');
const loginError  = document.getElementById('loginError');
const logoutBtn   = document.getElementById('logoutBtn');
const refreshBtn  = document.getElementById('refreshBtn');
const cardsGrid   = document.getElementById('cardsGrid');
const syncTimeEl  = document.getElementById('syncTime');
const loadValueEl = document.getElementById('loadValue');

// ════════════════════════════════════════
// 登入 / 登出
// ════════════════════════════════════════
document.getElementById('loginBtn').addEventListener('click', handleLogin);
document.getElementById('accessCode').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handleLogin();
});

function handleLogin() {
  const input = document.getElementById('accessCode');
  const code  = input.value.trim().toUpperCase();
  if (code === ACCESS_CODE) {
    loginError.textContent = '';
    document.body.classList.add('unlocked');
    localStorage.setItem('nova_core_access', '1');
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    initDashboard();
  } else {
    loginError.textContent = '⚠ 授權碼錯誤，請重新輸入';
    input.value = '';
    input.focus();
  }
}

logoutBtn.addEventListener('click', () => {
  clearInterval(tickTimer);
  clearInterval(memberTimer);
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  document.getElementById('accessCode').value = '';
  document.body.classList.remove('unlocked');
  localStorage.removeItem('nova_core_access');
  loginError.textContent = '';
  rooms = [];
});

// ════════════════════════════════════════
// 初始化儀表板
// ════════════════════════════════════════
function initDashboard() {
  spawnRooms();
  renderTicker();
  renderCards();
  updateClock();

  // 每秒：只更新機率、排序、時鐘、負載、能量線
  tickTimer = setInterval(() => {
    rooms.forEach(r => { r.prob = fluctuateRate(r.prob); });
    rooms.sort((a, b) => b.prob - a.prob);
    renderCards();
    updateClock();
  }, 1000);

  // 每 10 秒更新在線會員
  memberTimer = setInterval(updateOnlineMembers, 10000);
}

// 產生全新一批房間（房號、訊號、指令全部重抽）
function spawnRooms() {
  const nums = genUniqueNums(40, 1, 3500);
  rooms = nums.map(n => makeRoom(n));
  rooms.sort((a, b) => b.prob - a.prob);
}

// ════════════════════════════════════════
// 立即刷新：全部重新產生
// ════════════════════════════════════════
refreshBtn.addEventListener('click', () => {
  spawnRooms();
  renderCards();
  const orig = refreshBtn.textContent;
  refreshBtn.textContent = '✓ 已刷新';
  setTimeout(() => { refreshBtn.textContent = orig; }, 1400);
});

// ════════════════════════════════════════
// 時鐘 & 負載（每秒）
// ════════════════════════════════════════
function updateClock() {
  const n   = new Date();
  const pad = x => String(x).padStart(2, '0');
  syncTimeEl.textContent  = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  loadValueEl.textContent = rand(35, 39).toFixed(1) + '%';
}

// ════════════════════════════════════════
// 渲染卡片（局部更新，不閃爍）
// ════════════════════════════════════════
function renderCards() {
  const existing = cardsGrid.querySelectorAll('.card');
  if (existing.length === rooms.length) {
    rooms.forEach((r, i) => patchCard(existing[i], r));
  } else {
    cardsGrid.innerHTML = '';
    rooms.forEach(r => cardsGrid.appendChild(buildCard(r)));
  }
}

function buildCard(r) {
  const el = document.createElement('div');
  el.className = `card tier-${getTier(r.prob)}`;
  el.innerHTML = cardHTML(r);
  return el;
}

// 每秒只更新：機率、badge、tier class、能量線
// 不動：房號、訊號文字、指令
function patchCard(el, r) {
  const tier = getTier(r.prob);
  el.className = `card tier-${tier}`;

  const probEl = el.querySelector('.prob-value');
  if (probEl) { probEl.textContent = fmtProb(r.prob); probEl.className = `prob-value tier-${tier}`; }

  const badgeEl = el.querySelector('.card-tier-badge');
  if (badgeEl) { badgeEl.textContent = getBadgeLabel(r.prob); badgeEl.className = `card-tier-badge badge-${tier}`; }

  const fillEl = el.querySelector('.energy-fill');
  if (fillEl) { fillEl.style.width = energyPct(r.prob) + '%'; }

  const cmdEl = el.querySelector('.cmd-row');
  if (cmdEl) { cmdEl.className = `cmd-row${tier === 's' ? ' tier-s' : tier === 'b' ? ' tier-b' : ''}`; }
}

function energyPct(prob) {
  return ((prob - 70) / (98.8 - 70) * 100).toFixed(1);
}

function cardHTML(r) {
  const tier     = getTier(r.prob);
  const badgeCls = `badge-${tier}`;
  const cmdCls   = tier === 's' ? ' tier-s' : tier === 'b' ? ' tier-b' : '';
  const sigHTML  = r.signals.map(s => `
    <div class="signal-item">
      <span class="signal-tag tag-${s.tag.toLowerCase()}">${s.tag}級</span>
      <span>${s.text}</span>
    </div>`).join('');

  return `
    <div class="card-header">
      <span class="card-room">${r.name}</span>
      <span class="card-tier-badge ${badgeCls}">${getBadgeLabel(r.prob)}</span>
    </div>
    <div class="prob-row">
      <span class="prob-label">爆分機率</span>
      <span class="prob-value tier-${tier}">${fmtProb(r.prob)}</span>
    </div>
    <div class="signals">${sigHTML}</div>
    <div class="cmd-row${cmdCls}">${r.cmd}</div>
    <div class="energy-bar">
      <div class="energy-fill" style="width:${energyPct(r.prob)}%"></div>
    </div>`;
}
