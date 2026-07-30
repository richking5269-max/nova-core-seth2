# NOVA CORE Cloudflare 設定

## 使用的雲端資源

- Cloudflare Pages 專案：`novacore`
- 正式網址：`https://novacore-dzb.pages.dev`
- D1 binding 名稱：`DB`
- 建議 D1 名稱：`nova-core-licenses`
- 後台網址：`https://novacore-dzb.pages.dev/admin/`

## 安全設定

正式環境需要兩個加密 Secrets：

- `ADMIN_PASSWORD`：管理員登入密碼
- `ADMIN_SESSION_SECRET`：至少 32 字元的隨機字串

不要把這兩個值寫入 GitHub、JavaScript、HTML、`wrangler.toml` 或任何截圖。

## 建立 D1

```powershell
npx wrangler login
npx wrangler d1 create nova-core-licenses
```

將輸出的 `database_id` 填入由 `wrangler.toml.example` 複製出的
`wrangler.toml`，然後執行：

```powershell
npx wrangler d1 migrations apply nova-core-licenses --remote
```

## 設定正式環境 Secrets

在 Cloudflare Dashboard 開啟 `novacore`：

1. Settings
2. Variables and Secrets
3. 新增 `ADMIN_PASSWORD`，選擇 Encrypt
4. 新增 `ADMIN_SESSION_SECRET`，選擇 Encrypt

或透過 Wrangler 設定 Pages Secrets。

## 部署

```powershell
npm install
npm run deploy
```

正式建置會先把前台、後台與已打包的 `_worker.js` 放入 `dist`，再由
Wrangler 上傳到既有的 `novacore` Pages 專案。請保留 `--no-bundle`
流程，避免 Wrangler 再次處理已完成的 Worker bundle。

這個 Pages 專案目前是 **Direct Upload**，沒有連接 GitHub。推送 GitHub
只會備份程式碼，不會自動更新正式網站；網站更新仍需執行 `npm run deploy`。

## GitHub 安全推送

本機的 `wrangler.toml`、`.dev.vars`、`.wrangler/`、`dist/` 與
`node_modules/` 都已列入 `.gitignore`，請勿強制加入。

若要推送到既有 GitHub 儲存庫，最安全的方式是先把儲存庫 clone 到新資料夾，
再將本專案檔案複製進去、檢查 `git status` 後提交。不要使用 force push。
