# Chaldea Database (FGO Servant Tracker)

A responsive React web application that serves as a database for the mobile game *Fate/Grand Order*. It fetches real-time data for both NA and JP servers, providing English translations for Japanese-only content.

**🔗 Live Demo:** [View Live Site](https://SensXation.github.io/Fgo-Servants/)

---

## 🚀 Features

* **Global Servant Search:** Browse and filter servants by Name and Class.
* **Hybrid Data Engine:**
    * Prioritizes **NA Data** for official English translations.
    * Falls back to **JP Data** for new servants not yet released globally.
* **Auto-Translation System:** Automatically translates Japanese skill descriptions into English using a custom backend service.
* **Data Cleaning:** formatting raw API data to remove placeholder variables (e.g., `{{val}}`) and unwrap complex objects for Append Skills.
* **Detailed Views:** Displays active skills, passive skills, append skills, and Noble Phantasms with correct icons.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* CSS3 (Custom responsive styling)
* GitHub Pages (Hosting)

**Backend:**
* Node.js & Express
* Axios (Data fetching)
* Google Translate API (Unofficial helper for translations)
* Vercel (Serverless Hosting)

**API:**
* [Atlas Academy API](https://api.atlasacademy.io/) (The source of FGO game data)

---

## 🧩 How It Works

This project  Translate certain servant in FGO JP data. Since the Japanese version is 2 years ahead of the Global version, many new servants lack English descriptions.

1.  **The Frontend** sends a request to the Vercel Backend.
2.  **The Backend** first checks the **NA Database**.
3.  If the servant is missing (JP exclusive), it fetches the **JP Database**.
4.  It passes the Japanese text through a translation service.
5.  It cleans up raw code variables (e.g., `{{1:Value:m}}%` → `?%`).
6.  The clean, English data is sent back to the React App for display.

---

## 📦 Installation & Setup

If you want to run this project locally:

### 1. Clone the repository
```bash
git clone [https://github.com/SensXation/Fgo-Servants.git](https://github.com/SensXation/Fgo-Servants.git)
cd Fgo-Servants



```

🤝 Credits

Data provided by Atlas Academy.

Game assets property of Lasengle / TYPE-MOON.
