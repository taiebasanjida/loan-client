# Client Setup Guide

## Firebase Configuration

To fix the "Firebase: Error (auth/invalid-api-key)" error, you need to:

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project" or select an existing project
   - Follow the setup wizard

2. **Get Your Firebase Config:**
   - In Firebase Console, go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click the Web icon (`</>`) to add a web app
   - Copy the Firebase configuration values

3. **Create .env file:**
   - Copy `.env.example` to `.env` in the client folder
   - Replace the placeholder values with your actual Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSyC...your_actual_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

4. **Enable Authentication:**
   - In Firebase Console, go to Authentication
   - Click "Get Started"
   - Enable "Email/Password" sign-in method
   - Enable "Google" sign-in provider (optional but recommended)

5. **Add Authorized Domains:**
   - In Authentication > Settings > Authorized domains
   - Add `localhost` for local development
   - Add your production domain (e.g., `your-app.netlify.app`)

6. **Restart Dev Server:**
   - Stop the current dev server (Ctrl+C)
   - Run `npm run dev` again

## Stripe Configuration (Optional for now)

If you want to test payments:
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your publishable key from the dashboard
3. Add it to your `.env` file

## Troubleshooting

- **Error persists after adding .env:** Make sure to restart the dev server
- **Environment variables not loading:** Ensure variable names start with `VITE_`
- **Still seeing errors:** Check browser console for more details

