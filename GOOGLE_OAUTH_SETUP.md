# Google OAuth Setup Guide

## Current Status
✅ **Google OAuth is OPTIONAL** - the authentication system works perfectly without it using email/password.

The application currently shows a notice that "Google Sign-In not configured for development" and users can authenticate using email and password.

## To Enable Google OAuth (Optional)

### 1. Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select Project**: Create a new project or select an existing one
3. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sign-In API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "LeetSpace Frontend"
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (React dev server)
     - `http://localhost:5173` (Vite dev server)
     - Add your production domain when deploying
   - **Authorized redirect URIs**: Leave empty for now
   - Click "Create"

### 2. Copy Client ID

1. Copy the generated **Client ID** (ends with `.apps.googleusercontent.com`)
2. **DO NOT** copy the Client Secret (not needed for frontend OAuth)

### 3. Update Frontend Environment

Update `/workspace/frontend/leetspace-frontend/.env`:

```env
# Replace this line:
VITE_GOOGLE_CLIENT_ID=development-placeholder.apps.googleusercontent.com

# With your actual Client ID:
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

### 4. Restart Frontend Server

```bash
cd /workspace/frontend/leetspace-frontend
npm run dev
```

## What Happens When Google OAuth is Enabled

✅ **With Google OAuth configured**:
- Users see "Continue with Google" button
- Clicking opens Google Sign-In popup
- Users can sign in with their Google account
- Account is automatically created/linked in the system

✅ **Without Google OAuth configured** (current state):
- Users see a subtle development notice
- Only email/password authentication is available
- All authentication features work normally

## Security Notes

- ✅ **Client ID is safe to expose**: It's designed to be public
- ❌ **Never expose Client Secret**: Only needed for server-to-server auth
- ✅ **Domain restrictions**: Only your authorized domains can use the Client ID

## Testing Google OAuth

Once configured, test by:
1. Click "Continue with Google"
2. Select/sign in with Google account
3. Account should be created automatically
4. User should be logged in and redirected

## Troubleshooting

**Error: "This app isn't verified"**
- Normal for development
- Click "Advanced" > "Go to [App] (unsafe)" for testing
- For production, submit app for verification

**Error: "redirect_uri_mismatch"**
- Add your domain to authorized origins in Google Cloud Console

**Button doesn't appear**
- Check that Client ID is properly set in `.env`
- Restart the frontend server
- Check browser console for errors