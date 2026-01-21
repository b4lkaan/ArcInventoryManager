# ARC Raiders Inventory Manager ⚡

[![Aesthetics](https://img.shields.io/badge/Aesthetics-Premium-gold?style=for-the-badge)](https://github.com/b4lkaan/ArcInventoryManager)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Deployment](https://img.shields.io/badge/Vercel-Deploys-black?style=for-the-badge&logo=vercel)](https://vercel.com)

A high-performance, aesthetically-driven companion app for **ARC Raiders** survivors. This tool provides real-time strategic intelligence on whether to **Keep**, **Sell**, or **Recycle** loot based on your current hideout progression, active quests, and economic ROI.

---

## ✨ Features

- **🎯 Intelligent Recommendations**: Context-aware verdict engine that prioritizes quest items and hideout upgrades over short-term profit.
- **🔍 Instant Search**: Ultra-fast search system with debouncing and keyboard navigation support.
- **🌍 Global Localization**: Fully localized experience supporting English and other game languages.
- **📊 Financial Analytics**: Real-time ROI calculations comparing selling price versus recycling yield based on component market values.
- **🛠️ Progression Tracker**: Unified interface to track Quests, Hideout Upgrades, and Expedition Projects. Marking an upgrade as complete dynamically updates recommendations across the app.
- **🌙 Premium UI**: Sleek, high-contrast dark mode design with glassmorphism effects and smooth micro-animations.
- **🔄 Live Data Pipeline**: Automated serverless data ingestion from community sources via Vercel Blob storage.

---

## 🧠 Strategic Decision Engine

The app doesn't just look at prices; it understands your journey:

1.  **💎 Critical Components**: Hard-coded recognition of essential base materials that should never be liquidated.
2.  **⛔ Quest-Locked**: Items currently tracked for active scavenger quests are flagged as "DO NOT SELL".
3.  **🛠️ Hideout Priority**: Materials required for your next hideout level or expedition project are highlighted.
4.  **♻️ ROI Optimization**: Automated math to determine if an item is worth more as raw components or credits.
5.  **⭐ Rarity Awareness**: Special handling for Rare/Elite items that provide high-value recycling yields.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) with Concurrent Mode.
- **Routing**: [React Router 7](https://reactrouter.com/) for deep linking and history management.
- **Styling**: Modern **Vanilla CSS** with HSL color tokens, CSS Variables, and Flexbox/Grid layouts.
- **Data Layer**: React Context API (`DataContext`, `UserProgressContext`, `LanguageContext`) for efficient state propagation.
- **Backend / CI**: Vercel Serverless Functions + Cron Jobs for daily data refreshes.
- **Storage**: `@vercel/blob` for high-availability JSON data hosting.

---

## 📦 Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/b4lkaan/ArcInventoryManager.git

# Enter directory
cd ArcInventoryManager

# Install dependencies
npm install
```

### Development

```bash
# Run the development server
npm run dev

# Lint the codebase
npm run lint
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🙏 Credits & Acknowledgments

This project is powered by the incredible data compiled by the ARC Raiders community.

- **Data Source**: A massive thank you to [RaidTheory](https://github.com/RaidTheory) for the [arcraiders-data](https://github.com/RaidTheory/arcraiders-data) repository. This application uses their JSON datasets for items, quests, and hideout progression.
- **Community**: Built for the survivors of the ARC.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Created with ❤️ for the ARC Raiders community.*
