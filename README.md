# ARC Raiders Item Analyzer ⚡

A modern web application designed for ARC Raiders players to strategically manage their inventory. This tool helps players decide whether to **Keep**, **Sell**, or **Recycle** items based on real-time game data, quest requirements, and workshop upgrade needs.

## 🚀 Features

- **Smart Search**: Quickly find items in the database with instant results.
- **Dynamic Recommendations**: Automatic "Keep" advice for quest-essential materials and workshop upgrades.
- **Upgrade Tracker**: Track your workshop progress and mark upgrades as complete to dynamically update item recommendations.
- **Profit Analysis**: Financial breakdown comparing selling price vs. recycling ROI.
- **Visual Clarity**: Color-coded banners and intuitive icons for at-a-glance decision making.
- **Core Component Flags**: Special identification for essential crafting base materials.

## 🧠 Decision Logic

The application uses a priority-based recommendation engine (`dataService.js`):

1.  **💎 Core Components**: Essential base materials (always marked as CRITICAL).
2.  **⛔ Quest Priority**: Items required for active quests (marked as DO NOT SELL).
3.  **🛠️ Upgrade Priority**: Materials needed for uncompleted workshop levels.
4.  **♻️ Strategic Donors**: Items with high-value recycling yields or "Recycle Priority" flags.
5.  **💰 Financial ROI**: Automatic calculation based on `sell_price` vs `recycle_value`.
    - **PROFIT**: Recycling value exceeds selling price.
    - **LIQUIDATE**: Selling price exceeds recycling value.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Vanilla CSS (Global variables, modern layout)
- **Database**: JSON-based local data repository
- **State Management**: React Hooks (useState, useEffect, useCallback)

## 📦 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Development
Start the development server:
```bash
npm run dev
```

### Build
Generate a production-ready bundle:
```bash
npm run build
```

---
*Created for ARC Raiders Survivors.*
