Project Spec: Algorithm Canvas (Visualizer)
1. Project Overview
這是一個基於 React + TypeScript 的演算法視覺化平台。目標是將抽象的邏輯（如資料結構、地理空間索引等）轉化為具備互動性、易於理解且具備美感的動態展示，作為技術文章的輔助教材。

Core Value
可視化 (Visual)：清晰呈現演算法的內部狀態變化。

互動性 (Interactive)：使用者可以手動輸入資料或調整參數。

一致性 (Consistent)：風格統一，易於整合至 Medium 文章。

2. Tech Stack
Framework: React 18+ (Vite)

Language: TypeScript

Routing: React Router v6

Styling: Tailwind CSS + Headless UI

Animation: Framer Motion (用於流暢的狀態轉換)

Icons: Lucide React

Deployment: GitHub Actions + GitHub Pages

3. UI/UX Guidelines (Style: Bright, Relaxed, Cute, Line-art)
視覺設計需符合「明亮、輕鬆、可愛」的調性，模仿手繪感或高品質的技術插圖風格：

Color Palette:

背景：暖白色 (#FAFAFA) 或極淡的米色。

主色調：粉嫩色系（粉藍、草綠、暖橙），用於區分不同的演算法區塊。

線條：深灰色或深藍色（非正黑），建議粗細一致（如 2px），並帶有圓角（rounded-xl）。

Typography: 選用圓潤的無襯線字體。

Components:

所有的卡片與容器必須有明顯的線條外框（Border）與柔和的投影（Soft Shadow）。

使用 framer-motion 處理進入動畫（Spring physics 為主，避免生硬的線性動畫）。

圖示需統一使用線條感強的風格。

4. Architecture & Routing
系統採用 Registry Pattern 設計，方便未來新增演算法：

Directory Structure
Plaintext
/src
  /components
    /layout       # Sidebar, Navbar, PageWrapper
    /shared       # Button, Card, Slider, ControlPanel (共通元件)
  /algorithms     # 演算法邏輯與視覺化呈現
    /quadtree
      - QuadTreeVisualizer.tsx
      - logic.ts
    /geohash
      - GeoHashVisualizer.tsx
      - logic.ts
  /registry.ts    # 註冊所有演算法的 metadata (路徑、名稱、描述、圖示)
  /pages
    - LandingPage.tsx
    - DemoPage.tsx
URL Routes
/: 導向 LandingPage，展示所有演算法的卡片入口。

/demo/:algoId: 導向對應的演算法展示頁（例如 /demo/quadtree）。

5. Deployment (CI/CD)
使用 GitHub Actions 實現全自動部署。

GitHub Actions Workflow (.github/workflows/deploy.yml)
Trigger: 每次 push 到 main 分支時。

Steps:

Checkout code.

Install dependencies (pnpm/npm).

Build project (Vite build).

Deploy to gh-pages branch using JamesIves/github-pages-deploy-action.

Vite Config: base 路徑需設定為 /repo-name/ 以符合 GitHub Pages 規範。

6. Initial Implementation: QuadTree & GeoHash
Algorithm 1: QuadTree
Visualization: 在一個 2D 畫布上，隨著點的增加，自動分割區域。

Interaction:

點擊畫布新增點。

顯示當前滑鼠位置所在的節點範圍。

設定 Capacity 參數調整分割門檻。

Visual Style: 使用細線框出矩形範圍，點使用可愛的小圓圈。

Algorithm 2: GeoHash
Visualization: 地圖/格網系統。

Interaction:

輸入經緯度或在地圖點擊，轉換成 GeoHash 字串。

展示 Base32 的編碼過程。

顯示鄰居搜尋（Neighbors）的覆蓋範圍。

Visual Style: 網格線條帶有淡淡的色彩填充，當前選中的區域加粗線條。

7. Claude Code Instructions (Development Prompt)
請先初始化 Vite + React + TS 環境。

安裝必要套件：react-router-dom, framer-motion, lucide-react, tailwindcss。

根據 UI/UX Guidelines 設定 Tailwind 設定檔（顏色、圓角）。

建立 registry.ts 架構，確保未來只需新增一個資料夾並在註冊表登記即可自動生成路由與 Landing Page 卡片。

優先實作 LandingPage，需具備響應式 Grid 佈局。

實作 QuadTree 展示頁，確保其邏輯層 (logic.ts) 與 UI 層分離，方便測試。

設定 GitHub Actions 檔案，並提醒我設定 GitHub Repository 的 Secrets (若有需要)。