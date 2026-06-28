<p align="center">
  <img src="https://raw.githubusercontent.com/harshgupta9129/WageGuard/main/banner.png" alt="WageGuard Banner" width="100%">
</p>

# 🛡️ WageGuard - Worker Wage Protection & Verification Portal

WageGuard is a transparent, secure digital platform designed to verify workers' daily work hours through employer approvals, creating verifiable records that prevent wage theft, ensure fair compensation, and eliminate payment disputes.

---

## ✨ Features

- **💡 Dual Mode Interface**: A premium, human-designed design system supporting seamless **Light Mode** (default) and **Dark Mode** toggles.
- **⚡ Interactive Autocomplete**: Workers can search and select employers by name via a smart autocomplete search with fallback history matching.
- **🕒 Daily Logs**: Workers can quickly record daily hours worked and submit them to specific employer phone numbers.
- **💼 Approval Dashboard**: Employers get a dedicated control panel to approve, reject, or track worker log histories dynamically.
- **🔒 Secure Verification**: Uses JSON Web Tokens (JWT) for protected authentication and Bcrypt hashing for password security.
- **📱 Fully Responsive**: Custom CSS glassmorphism styling and Tailwind CSS v4 layout optimized for both desktop and mobile screens.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS v4 & Custom CSS Variables (Glassmorphism)
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: Node.js & Express
- **Database**: MongoDB (Mongoose ODM)
- **Security**: JWT & Bcryptjs
- **Reloading**: Nodemon (Development)

---

## 📁 Directory Structure

```text
WageGuard/
├── backend/
│   ├── config/          # Database connection settings
│   ├── controllers/     # Express route handlers
│   ├── middleware/      # JWT authentication protection
│   ├── models/          # Mongoose Database models
│   ├── routes/          # REST API endpoints
│   ├── server.js        # Main server entrypoint
│   └── package.json     # Node script configuration
└── frontend/
    ├── src/
    │   ├── api/         # Axios instance & request interceptors
    │   ├── context/     # Auth & Theme states providers
    │   ├── pages/       # Login, Signup, and Dashboards
    │   └── main.jsx     # Root renderer
    ├── index.html       # Google Fonts links & main HTML template
    ├── vercel.json      # Single Page App rewrite configurations
    └── package.json     # Vite client build details
```

---

## ⚙️ Environment Configurations

For local development or deployment, you must create `.env` files in both directories.

### 🔌 Backend Environment Setup
Create a `.env` file in `/backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signing_token_secret
```

### 💻 Frontend Environment Setup
Create a `.env` file in `/frontend` folder:
```env
VITE_API_URL=http://localhost:5000
```
*(When deploying the frontend to Vercel, change `VITE_API_URL` to point to your hosted backend URL, e.g. `https://wageguard-backend.onrender.com`)*

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/harshgupta9129/WageGuard.git
cd WageGuard
```

### 2. Set Up the Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Set Up the Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to run the application.

---

## 🌐 Deployment Guidelines

### 🎨 Frontend to Vercel
1. Upload your project repository to GitHub.
2. Link the repository to your Vercel Dashboard.
3. Set the **Root Directory** as `frontend` during creation.
4. Add the **Environment Variable**: `VITE_API_URL` pointing to your backend URL.
5. Click **Deploy**. SPA route rewrites are pre-configured in `vercel.json`!

### ⚙️ Backend to Render
1. Create a new **Web Service** on Render.
2. Select your repository.
3. Configure the following settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add **Environment Variables** in the Render settings:
   - `MONGO_URI`
   - `JWT_SECRET`
5. Click **Deploy**.
