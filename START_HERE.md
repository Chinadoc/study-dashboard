# ✅ Cloudflare Setup Checklist - START HERE

## 🎯 TODAY'S MISSION

Secure your Cloudflare API token and set it up for immediate use.

**Time estimate: 30 minutes**

---

## Phase 1: Revoke & Secure (10 min)

### ✅ Step 1: Revoke Exposed Token
- [ ] Go to https://dash.cloudflare.com/profile/api-tokens
- [ ] Find token starting with `b4GKKmwYlCGlSCSsQLC7safqIgYo4sj7cddBttwQ`
- [ ] Click trash icon to delete
- [ ] **Confirm deletion** (important!)

### ✅ Step 2: Create New Token (5 min)
- [ ] Still at https://dash.cloudflare.com/profile/api-tokens
- [ ] Click **"Create Token"** (top right)
- [ ] Select **"Custom token"**
- [ ] Set name: `eurokeys-worker-api`
- [ ] Scroll to **Permissions** section:
  - Account Resources: **Account > Workers Namespace > Edit**
  - Account Resources: **Account > Workers KV > Edit**
  - ❌ Don't select zone-level permissions
  - ❌ Don't select DNS/SSL/TLS permissions
- [ ] Click **"Continue to summary"**
- [ ] Click **"Create Token"**
- [ ] **COPY the token immediately** (you won't see it again!)

### ✅ Step 3: Store Token Safely (5 min)
```bash
# In terminal:
cd /Users/jeremysamuels/Documents/study-dashboard

# Update .env.local with your new token
cat >> .env.local << 'EOF'
CLOUDFLARE_API_TOKEN=YOUR_ACTUAL_TOKEN_HERE_NO_QUOTES
EOF

# Replace YOUR_ACTUAL_TOKEN_HERE_NO_QUOTES with your real token
# Example:
# CLOUDFLARE_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Verify it was saved
cat .env.local
```

**⚠️ IMPORTANT**: 
- ❌ Never share `.env.local` 
- ❌ Never commit it to git
- ❌ Never paste token in chat again
- ✅ It's already in `.gitignore`

---

## Phase 2: Verify Token Works (5 min)

```bash
# Load environment variables
export $(cat .env.local | xargs)

# Verify token is valid
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify
```

### Expected Response:
```json
{
  "success": true,
  "result": {
    "id": "abc123...",
    "status": "active",
    "name": "eurokeys-worker-api",
    ...
  },
  "errors": [],
  "messages": []
}
```

### If it fails:
1. Check token is correct (no extra spaces)
2. Check you're using `Bearer` not `Basic`
3. Verify token shows "active" in dashboard
4. Try again

---

## Phase 3: Install Wrangler (10 min)

```bash
# Check if you have Node.js
node --version    # Should be v16+ (if not, install it)

# Install Wrangler globally
npm install -g @cloudflare/wrangler

# Verify installation
wrangler --version
```

---

## ✅ Done!

You now have:
- ✅ New secure token with minimal permissions
- ✅ Token stored safely in `.env.local`
- ✅ Token verified and working
- ✅ Wrangler CLI ready
- ✅ Account ID configured

---

## 🚀 Next Steps (When Ready)

Once you've completed the above, you're ready for:

1. **Phase 2**: Create Wrangler Worker project (20 min)
2. **Phase 3**: Create KV namespace (10 min)
3. **Phase 4**: Run CSV → KV migration (30 min)
4. **Phase 5**: Deploy Worker (5 min)
5. **Phase 6**: Update frontend (15 min)

---

## 📚 Documentation Files

After completing this checklist:

1. **Next**: Read `CLOUDFLARE_KV_QUICK_REF.md` (5 min overview)
2. **Then**: Read `IMPLEMENTATION_ROADMAP.md` (full step-by-step)
3. **Details**: Refer to `DATABASE_SCHEMA.md` for data structure
4. **Architecture**: See `ARCHITECTURE.md` for system design

---

## 🆘 Troubleshooting

### "Token verification failed"
- ❌ Token not copied correctly?
- ❌ Using wrong authorization format?
- ❌ Token doesn't have Workers KV scope?

**Fix**: Create a new token, double-check scopes.

### ".env.local file permission denied"
```bash
chmod 600 .env.local
cat .env.local
```

### "Wrangler not found"
```bash
# Reinstall
npm install -g @cloudflare/wrangler@latest
wrangler --version
```

### "CLOUDFLARE_ACCOUNT_ID is already set"
That's fine! Your account ID is already in `.env.local`.

---

## ⏱️ Time Checklist

- [ ] Revoke exposed token (2 min)
- [ ] Create new token (5 min)
- [ ] Store in .env.local (2 min)
- [ ] Verify with curl (2 min)
- [ ] Install Wrangler (10 min)
- [ ] Verify Wrangler works (1 min)

**Total: ~25 min** ✅

---

## Summary

You've just:
1. ✅ Revoked the exposed token (good security practice)
2. ✅ Created a new token with minimal permissions (principle of least privilege)
3. ✅ Stored it securely (not in git, not in chat)
4. ✅ Verified it works (confirmed connectivity)
5. ✅ Installed the CLI tool needed to deploy

**You're now ready to build the Cloudflare backend!**

---

## What's Next?

Tell me when you've completed this checklist, and I'll help you:

1. Create a Cloudflare Worker project
2. Set up a KV namespace
3. Write a migration script to move your CSVs to KV
4. Deploy the API
5. Update the frontend to use it

Ready? Let's go! 🚀

