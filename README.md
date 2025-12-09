<h1>🛡️ DigiVault – AI-Powered Secure Document Vault (MERN)</h1>

A smart digital fort to store, analyze, share and talk to your documents — built using MERN + RAG AI.

✨ Overview

Most people have an “Important Docs” folder that is messy, insecure, and forgotten until something expires.
So I built DigiVault — a production-ready AI-powered document management system.

This isn’t just file storage.
This is Smart SaaS Architecture + Automation + AI Understanding.

🔥 Key Highlights

✔️ Chat with your PDFs — Ask “What is the premium on this policy?” using Google Gemini + RAG
✔️ Smart OCR expiry detection — Upload a passport, insurance card, etc. and the system extracts expiry dates automatically
✔️ Automated Email Alerts — Cron jobs monitor expiration and notify you proactively
✔️ Military-grade security —
➡️ Two-Factor Authentication (Google Authenticator)
➡️ Password-protected sharing
➡️ Auto-expiring public links
➡️ Audit logs with IP tracking

🚀 Live Demo & Code



📌 GitHub Repo: https://github.com/ADITYA-user18/DigiVault-MERNFullStackProject

🏗️ Tech Stack
Frontend

React.js (Vite)

Tailwind CSS

Axios

Framer Motion

Lucide Icons

React Router DOM

Backend

Node.js

Express.js

MongoDB (Mongoose)

Cloudinary (File Storage)

Tesseract.js (OCR)

pdf-parse (PDF processing)

Google Gemini (AI answer engine)

Speakeasy (2FA)

Node-Cron (automation)

Nodemailer (email alerts)

🔐 Core Features
🔒 Authentication & Security

✔️ JWT Authentication with HTTP-Only Cookies
✔️ Google Authenticator based TOTP (2FA)
✔️ Email OTP fallback recovery flow
✔️ Password hashing using bcryptjs

🧠 Intelligence Layer

✔️ OCR based expiry detection using tesseract.js + regex scoring algorithm
✔️ Chat with Documents — RAG pipeline using:

PDF Text → Chunking → Gemini Answering

🔗 Smart File Sharing

✔️ Public links with UUID token
✔️ Auto expiration (1hr / 24hr / 7 days)
✔️ PIN protected access
✔️ Access logging (IP + user agent tracking)
✔️ Force revoke shared links

⏰ Safety Automations

✔️ Daily cron job checks for expiring documents
✔️ Automated email reminders before expiry

📌 Architecture Overview
Client → Express API → MongoDB
 |         |              |
React UI   AI Engine      Vault Storage
OCR        RAG Chat       Cloudinary


Designed using modular services & SaaS-ready structure.

📂 Database Design
🧑‍💻 Users

Stores identity, auth data, 2FA secrets

📁 Files Collection (Vault documents)

filename

category

expiryDate

isAutoDetected

🔗 Share Links

UUID token

expiry timestamp

passwordHash

📜 Access Logs

IP

user agent

timestamp

💡 Engineering Problems I Solved
1. OCR inconsistencies

👉 Dates were extracted wrong due to formatting
✔️ Solution — Regex scoring logic + future date validation

2. Secure File Sharing

👉 Preventing unauthorized link access
✔️ Solution — multi-layer validation: token + expiry + hash


4. RAG context limits

👉 Large PDFs exceed LLM token limit
✔️ Solution — text truncation + fallback sanitization

📸 Screenshots (Add these later)
✔️ Dashboard View
✔️ Smart OCR detection UI
✔️ AI Chat interface
✔️ Google Authenticator screen
✔️ Secure sharing modal


<img width="1920" height="1020" alt="Screenshot 2025-12-08 222717" src="https://github.com/user-attachments/assets/105db6f1-147c-47fd-b564-a0871ef69eeb" />


⚙️ Installation Guide
Backend Setup
cd backend
npm install
cp .env.example .env
npm run dev

Frontend Setup
cd frontend
npm install
cp .env.example .env
npm run dev

🔮 Future Roadmap

User storage limits & subscription tiers

Shared folders / team collaboration

Mobile App (React Native)

PWA Support & offline mode

🤝 Contributions

PRs Welcome!
Feel free to fork, open issues, or suggest improvements.

✍️ Author

👤 Aditya G Wandakar
Full Stack Developer | MERN + AI Automation

⭐ Support

If you like this project, give it a ⭐ on GitHub — it helps visibility! 💛<img width="1920" height="1020" alt="Screenshot 2025-12-08 222742" src="https://github.com/user-attachments/assets/b836f586-8f3b-4f68-a871-62209a2c7f9d" />
<img width="1920" height="1020" alt="Screenshot 2025-12-08 222751" src="https://github.com/user-attachments/assets/551c7c48-ffe2-4426-96b4-d0d8182d947b" />
<img width="1920" height="1020" alt="Screenshot 2025-12-08 222757" src="https://github.com/user-attachments/assets/ad22c962-f32b-475f-860b-be0b06cbc523" />
<img width="1920" height="1020" alt="Screenshot 2025-12-08 222834" src="https://github.com/user-attachments/assets/de40b29c-fd74-4297-a2ea-6d19b5b73244" />
<img width="1920" height="1020" alt="Screenshot 2025-12-08 222842" src="https://github.com/user-attachments/assets/a445df2b-8c22-44bf-8315-b44904393bf3" />
