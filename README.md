# ⚔️ **ZORO MD** ⚔️

**A Powerful Multi-Device WhatsApp Bot**  
Made with ❤️ by **@darksayan**

![Zoro MD Banner](https://via.placeholder.com/800x200/0A0A0A/FF4500?text=ZORO+MD+-+WhatsApp+Bot)  
*(Replace with your actual banner if available)*

---

## ✨ **Features**

- ✅ **Multi-Device Support** (No QR scan every time with Session ID)
- ✅ **Fast & Lightweight** (Built on Baileys)
- ✅ **Auto-React, Auto-Reply & AI Features**
- ✅ **Group Management Tools** (Promote, Demote, Kick, Mute, etc.)
- ✅ **Media Downloader** (Instagram, TikTok, YouTube, Facebook, etc.)
- ✅ **Sticker Maker, Image Editor & Fun Commands**
- ✅ **Owner Commands** + **Plugin Support**
- ✅ **24/7 Uptime** on Free/Paid Hosting

---

## 🚀 **Quick One-Click Setup (Recommended)**

Just run this command on **any VPS/Terminal**:

```bash
curl -s "https://raw.githubusercontent.com/darksayan/zoro-md/refs/heads/main/setup.js" | node
```

This will automatically:
- Install all dependencies
- Guide you through configuration
- Generate session (if needed)
- Start the bot

---

## 📋 **Manual Installation**

### **Prerequisites**
- Node.js v18+ 
- Git
- FFmpeg, ImageMagick, libwebp (for stickers/media)

### **Step-by-Step**

```bash
git clone https://github.com/darksayan/zoro-md.git
cd zoro-md
npm install
```

Then run the setup:

```bash
node setup.js
```

Or directly start:

```bash
npm start
```

---

## 🔧 **Configuration**

After running `setup.js`, edit `config.js` or `.env` file:

- `OWNER_NUMBER` → Your WhatsApp number (e.g., `919876543210`)
- `SESSION_ID` → Your pairing code / session string
- Other options like bot name, prefix, etc.

---

## 🌐 **Easy Deployment Guides**

### **1. Replit (Free & Easy)**

1. Go to [replit.com](https://replit.com)
2. Create New Repl → **Import from GitHub**
3. Paste: `https://github.com/darksayan/zoro-md`
4. In **Secrets** (🔒) add:
   - `SESSION_ID` → your session
   - `OWNER_NUMBER` → your number
5. Click **Run** ✅

### **2. Render (Free Tier Available)**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/darksayan/zoro-md)

1. Click the button above
2. Connect your GitHub
3. Add Environment Variables (`SESSION_ID`, `OWNER_NUMBER`)
4. Deploy → Your bot will be live 24/7

### **3. Koyeb (Free & Fast)**

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?repository=https://github.com/darksayan/zoro-md)

1. Click the button
2. Sign in with GitHub
3. Set Environment Variables
4. Deploy instantly

### **4. VPS / Server (Recommended for 24/7)**

```bash
# Update system
sudo apt update && sudo apt upgrade -y
sudo apt install git curl nodejs npm ffmpeg -y

# Clone & Setup
git clone https://github.com/darksayan/zoro-md.git
cd zoro-md
npm install

# Run with PM2 (for auto-restart)
npm install -g pm2
pm2 start index.js --name "zoro-md"
pm2 save
pm2 startup
```

Use the **one-click setup** for faster VPS deployment:

```bash
curl -s "https://raw.githubusercontent.com/darksayan/zoro-md/refs/heads/main/setup.js" | node
```

---

## 📜 **Available Commands**

Send `.menu` or `.list` in WhatsApp to see full command list.

### **Main Categories:**

- **👑 Owner** — `.restart`, `.update`, `.shutdown`, etc.
- **👥 Group** — `.promote`, `.demote`, `.kick`, `.tagall`, `.mute`, `.unmute`
- **📥 Downloader** — `.ig`, `.tt`, `.yt`, `.fb`, `.play`, `.song`
- **🎨 Fun & Media** — `.sticker`, `.toimg`, `.attp`, `.qc`
- **🔍 Search** — `.google`, `.wiki`, `.weather`
- **🛠️ Tools** — `.calc`, `.ss`, `.shorturl`
- **🎮 Games** — `.tictactoe`, `.truth`, `.dare`

**Prefix:** `.` (default) — Can be changed in config.

---

## 📸 **Screenshots**

*(Add your bot menu screenshots here)*

![Menu](https://via.placeholder.com/600x400/1E1E1E/00FF00?text=Bot+Menu+Screenshot)  
![Features](https://via.placeholder.com/600x400/1E1E1E/FF4500?text=Features+Showcase)

---

## ⚠️ **Disclaimer**

- This bot is for **educational & fun purposes** only.
- Do not misuse for spam or illegal activities.
- We are not responsible for any WhatsApp ban.
- Respect WhatsApp Terms of Service.

---

## ⭐ **Support & Credits**

- **Developer:** [darksayan](https://github.com/darksayan)
- Give a ⭐ if you like the bot!
- Report issues or suggest features in [Issues](https://github.com/darksayan/zoro-md/issues)

---

**Made with Baileys + Node.js**  
**Enjoy your Zoro MD Bot!** ⚔️

---

*Fork → Star → Deploy → Have Fun!*
```

**How to use this README:**

1. Copy the entire markdown above.
2. Go to your repo → `README.md` file → Edit → Paste.
3. Replace placeholder images with real screenshots of your bot menu/commands.
4. Add your actual banner at the top.
5. Commit & push.

This README looks **super clean, modern, and professional** with emojis, clear sections, one-click deploy buttons (for Render & Koyeb), and your exact VPS command highlighted.

If you want any changes (more commands, different style, or add specific features), just tell me! 🚀