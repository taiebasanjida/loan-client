# API Configuration Guide

## 🔗 Server API URL Setup

এই project-এ Vercel-এ deployed backend server use করা হচ্ছে।

### Production API URL:
```
https://loan-link-server-ten.vercel.app
```

---

## 📝 Environment Variables Setup

### Option 1: .env File Create করুন (Recommended)

`client` folder-এ `.env` file create করুন এবং এই content add করুন:

```env
# API Base URL
VITE_API_URL=https://loan-link-server-ten.vercel.app
```

**File Location:** `client/.env`

**Note:** `.env` file `.gitignore`-এ আছে, তাই Git-এ commit হবে না (security reason)।

---

### Option 2: Automatic Configuration (Already Implemented)

`client/src/utils/axios.js` file-এ already configured করা আছে:

- **Development mode:** `http://localhost:5000` (local server)
- **Production mode:** `https://loan-link-server-ten.vercel.app` (Vercel deployment)

যদি `.env` file না থাকে, তাহলে automatically production URL use করবে।

---

## ✅ Verification

### Check API Configuration:

1. `client/src/utils/axios.js` file open করুন
2. `API_BASE_URL` variable check করুন
3. Production build-এ `https://loan-link-server-ten.vercel.app` দেখতে হবে

### Test API Connection:

Browser console-এ check করুন:
```javascript
// Check current API base URL
console.log(import.meta.env.VITE_API_URL || 'https://loan-link-server-ten.vercel.app');
```

---

## 🔄 Development vs Production

### Development (Local):
- API URL: `http://localhost:5000`
- Vite proxy use করবে (`vite.config.js`-এ configured)

### Production (Deployed):
- API URL: `https://loan-link-server-ten.vercel.app`
- Direct API calls

---

## 📋 API Endpoints

সব API endpoints automatically `baseURL` use করবে:

- **Auth:** `/api/auth/register`, `/api/auth/login`, etc.
- **Loans:** `/api/loans`
- **Applications:** `/api/applications`
- **Payments:** `/api/payments`
- **Users:** `/api/users`

**Example:**
```javascript
// This will call: https://loan-link-server-ten.vercel.app/api/auth/login
axios.post('/api/auth/login', { email, password });
```

---

## 🚀 Deployment

Frontend deploy করার সময়:

1. **Netlify/Vercel-এ Environment Variables add করুন:**
   - Key: `VITE_API_URL`
   - Value: `https://loan-link-server-ten.vercel.app`

2. **Rebuild করুন** environment variables load করার জন্য

---

## ✅ Current Configuration Status

✅ `axios.js` updated - Production URL configured  
✅ Automatic fallback to production URL  
✅ Development mode support (localhost)  

**Ready to use!** 🎉

