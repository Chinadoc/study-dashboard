---
description: Rules for adding new synced data types to EuroKeys
---

# Adding Synced Data to EuroKeys

## Quick Reference

When adding any feature that stores user data in localStorage, follow these rules:

## Option 1: Use the Unified Sync Factory (Preferred)

For new data types that need cloud sync, use `createSyncHook`:

```typescript
// In lib/sync/hooks.ts or a new file
import { createSyncHook } from './createSyncHook';

interface MyNewDataType extends SyncableRecord {
    id: string;
    // ... your fields
}

export const useMyNewDataSynced = createSyncHook<MyNewDataType>({
    storageKey: 'eurokeys_my_data',      // Base key (auto-scoped by user)
    apiEndpoint: '/api/user/my-data',    // GET endpoint
    syncEndpoint: '/api/user/my-data/sync', // POST endpoint (optional)
    schemaVersion: 1,
    mergeStrategy: 'latest-wins',
});
```

**Benefits:**
- ✅ Automatic user-scoped localStorage
- ✅ Visibility/focus listeners built-in
- ✅ Correct auth token handling
- ✅ Delta sync support
- ✅ Conflict detection

## Option 2: Manual localStorage (If Not Using Factory)

If you must use localStorage directly, ALWAYS use `getUserScopedKey`:

```typescript
import { getUserScopedKey } from '@/lib/sync/syncUtils';

const STORAGE_KEY = 'eurokeys_my_feature';

// ❌ WRONG - data leaks between accounts
localStorage.getItem(STORAGE_KEY);

// ✅ CORRECT - data isolated per user
localStorage.getItem(getUserScopedKey(STORAGE_KEY));
```

## Checklist for New Features

- [ ] Does this feature store user data in localStorage?
  - If yes, use `getUserScopedKey()` for ALL access
- [ ] Does this feature need cloud sync?
  - If yes, prefer `createSyncHook` factory
- [ ] Add the new storage key to AuthContext logout cleanup list
- [ ] Test: Log in as User A, create data, log out, log in as User B - data should NOT be visible

## Files to Update

1. **New synced hook**: Add to `lib/sync/hooks.ts`
2. **Logout cleanup**: Add key to `contexts/AuthContext.tsx` line ~168
3. **Force sync**: Add sync function to `lib/forceSync.ts` if needed

## Storage Keys Reference

Current user-scoped keys (all prefixed with user ID):
- `eurokeys_job_logs` - Job history
- `eurokeys_pipeline_leads` - Sales pipeline
- `eurokeys_invoices` - Invoices
- `eurokeys_inventory` - Key inventory
- `eurokeys_technicians` - Technician roster
- `eurokeys_fleet_customers` - Fleet accounts
- `eurokeys_licenses` - User licenses
- `eurokeys_business_profile` - Business settings
- `eurokeys_sync_state` - Sync metadata
- `eurokeys_sync_queue` - Pending sync items
