# Deploying MedQuest to Fly.io

This guide will help you deploy your MedQuest application to Fly.io.

## Prerequisites

1. **Install Fly.io CLI**:
   ```bash
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Sign up/Login to Fly.io**:
   ```bash
   fly auth login
   ```

## Deployment Steps

### 1. Update App Name
Edit `fly.toml` and change the app name to something unique:
```toml
app = 'your-unique-app-name'  # Change this to your preferred name
```

### 2. Create the Fly.io App
```bash
cd examples/medquest
fly apps create your-unique-app-name
```

### 3. Set Environment Variables (Secrets)
Set your Supabase credentials as secrets:

```bash
# Set your Supabase URL
fly secrets set SUPABASE_URL="https://your-project-id.supabase.co"

# Set your Supabase anon key
fly secrets set SUPABASE_ANON_KEY="your-supabase-anon-key"

# Set your Supabase JWT secret
fly secrets set SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
```

**⚠️ Important**: Get these values from your Supabase project dashboard:
- Go to **Settings > API**
- Copy the Project URL, anon/public key, and JWT Secret

### 4. Deploy the Application
```bash
fly deploy
```

### 5. Open Your Application
```bash
fly open
```

## Post-Deployment

### View Logs
```bash
fly logs
```

### Check App Status
```bash
fly status
```

### Scale Your App
```bash
# Scale to 1 machine minimum (keeps app always running)
fly scale count 1

# Or let it auto-scale (may have cold starts)
fly scale count 0
```

### Update Environment Variables
To update any secrets later:
```bash
fly secrets set VARIABLE_NAME="new-value"
```

### Redeploy
For code changes:
```bash
fly deploy
```

## Configuration Details

- **Region**: `iad` (US East) - Change in `fly.toml` if needed
- **Memory**: 1GB - Sufficient for the FastAPI app
- **Health Check**: Configured on `/api/config` endpoint
- **HTTPS**: Automatically enabled
- **Auto-scaling**: Enabled (scales to 0 when not in use)

## Troubleshooting

1. **App won't start**: Check logs with `fly logs`
2. **Environment variables**: Verify with `fly secrets list`
3. **Build errors**: Check Dockerfile and requirements.txt
4. **Database connection**: Ensure Supabase credentials are correct

## Custom Domain (Optional)

To use a custom domain:
```bash
fly certs add yourdomain.com
```

Then update your DNS to point to your Fly.io app.

## Security Notes

- Never commit secrets to git
- Environment variables are encrypted at rest on Fly.io
- The app runs with a non-root user for security
- HTTPS is enforced automatically