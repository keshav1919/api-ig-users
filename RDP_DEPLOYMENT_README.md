# RDP Deployment & Quickstart Guide

This package contains the complete unified **Instagram Shared API Suite**:
1. `shared-backend/`: High-performance FastAPI backend (Port 8000) with 40-worker parallel verification, public/admin settings API, SSRF avatar proxy, and profile scraping.
2. `indo-chk/`: Telegram Bot with real-time streaming, space-separated username extraction, dual `.txt` export, and owner unlimited mode.
3. `blue-tick/`: Production React web app with full-screen Admin Dashboard (`/admin`).

---

## 🚀 How to Run on Windows RDP (3 Steps)

### Step 1: Install Dependencies
Double-click:
```
install_requirements.bat
```
*(This automatically runs `pip install -r requirements.txt` to install FastAPI, uvicorn, python-telegram-bot, instagrapi, etc.)*

### Step 2: Start Both Services
Double-click:
```
start_all.bat
```
*(This opens two separate command prompt windows: one for the Shared Backend on port 8000, and one for the Telegram Bot with 40x concurrency).*

### Step 3: Verify Everything is Running
- **Backend API**: Open your browser on the RDP to `http://localhost:8000/health`
- **Telegram Bot**: Send any username or batch to your bot on Telegram.
- **Admin Dashboard**: Open `http://localhost:5173/admin` or your Netlify URL `/admin`.

---

## 🔐 Admin Dashboard Credentials
- **URL**: `/admin`
- **Admin Password**: `xd`
- **Features**:
  - Update subscription price (₹30)
  - Change recipient UPI ID (`paytm.s1x87m2@pty`)
  - Live interactive UPI QR Code tester
  - View backend status and server sync

---

## 🌐 Connecting Netlify Website to RDP Backend
When deploying the `blue-tick` folder to Netlify:
1. If using a tunnel on your RDP (like `cloudflared` or `ngrok`), expose port `8000`:
   ```cmd
   cloudflared tunnel --url http://localhost:8000
   ```
2. In your **Netlify Site Dashboard** > **Site Configuration** > **Environment Variables**, add:
   ```
   VITE_API_BASE_URL = https://your-tunnel-subdomain.trycloudflare.com
   ```
3. Trigger a deploy on Netlify. Your website will now seamlessly communicate with your RDP backend!
