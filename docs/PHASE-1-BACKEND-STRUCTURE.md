# PHASE 1: Remove Mock System & Introduce Real Backend Structure

**Status**: ✅ Complete
**Date**: February 2026
**Deliverable**: API service layer with fallback to mock data

---

## Executive Summary

PHASE 1 removes the single-layer mock data system and introduces a **production-ready API service architecture**. Components now route through a centralized data provider that can transparently switch between real backend and mock data during development.

### Key Changes

1. **New API Service Layer** (`services/api/`)
   - HTTP client with auth token support
   - Projects API service
   - Assets API service
   - Structured error handling

2. **Data Provider with Fallback** (`services/dataProvider.ts`)
   - Abstracts choice between real API and mock data
   - Allows gradual migration (during PHASE 1 testing)
   - Transparent error fallback

3. **Updated AuthContext**
   - Supports both mock auth (PHASE 1) and JWT-based auth (PHASE 2+)
   - Feature flag: `VITE_USE_MOCK_DATA`
   - Token storage prepared for real auth

4. **Component Refactoring**
   - Portal.tsx → uses ProjectsProvider, AssetsProvider
   - ModelEditor.tsx → uses AssetsProvider
   - RestaurantMenu.tsx → uses ProjectsProvider

5. **Environment Configuration**
   - `VITE_API_BASE_URL` - Backend URL
   - `VITE_STORAGE_BUCKET` - S3 bucket URL
   - `VITE_AUTH_PROVIDER_URL` - Auth provider (future)
   - `VITE_USE_MOCK_DATA` - Feature flag

---

## Architecture

### Old Architecture (Prototype)

```
Component
    ↓
mockData.ts (in-memory store)
    ↓
Session-only persistence (lost on refresh)
```

### New Architecture (PHASE 1)

```
Component
    ↓
DataProvider (ProjectsProvider, AssetsProvider)
    ↓
    ├→ Real API (if available)
    └→ Mock Data (fallback, feature-flag controlled)
    ↓
Session + localStorage (depending on auth mode)
```

### Production Architecture (PHASE 2+)

```
Component
    ↓
DataProvider/API Service
    ↓
Backend API (required, no fallback)
    ↓
Postgres Database
S3 Storage
```

---

## File Structure

```
services/
├── mockData.ts                  # (Unchanged) Mock data, used as fallback
├── dataProvider.ts              # NEW: Fallback logic, provider interface
└── api/
    ├── client.ts               # NEW: HTTP client with auth
    ├── projects.ts             # NEW: Projects API endpoints
    ├── assets.ts               # NEW: Assets API endpoints
    └── index.ts                # NEW: Export index

contexts/
├── AuthContext.tsx             # UPDATED: Supports JWT + mock auth

pages/
├── Portal.tsx                  # UPDATED: Uses DataProvider
├── editor/
│   └── ModelEditor.tsx         # UPDATED: Uses AssetsProvider
└── templates/
    └── RestaurantMenu.tsx      # UPDATED: Uses ProjectsProvider
```

---

## Implementation Details

### 1. API Client (`services/api/client.ts`)

Core HTTP client with:

- JWT token management (`setToken()`, `getToken()`)
- Request/response handling
- Error parsing (structured ApiError)
- Timeout handling
- Bearer token injection

**Usage**:

```typescript
import { apiClient } from '@/services/api';

// Automatic token injection
apiClient.setToken(jwtToken);

// All request types
const projects = await apiClient.get('/projects');
const newProject = await apiClient.post('/projects', data);
await apiClient.patch(`/projects/${id}`, updates);
await apiClient.delete(`/projects/${id}`);
```

### 2. API Services

**ProjectsAPI** (`services/api/projects.ts`):

- `fetchProjects()` - List all visible projects
- `fetchProject(id)` - Get single project
- `createProject(data)` - Create new project
- `updateProject(id, data)` - Update project
- `deleteProject(id)` - Archive/delete
- `assignProject(projectId, technicianId)` - Assign to tech
- `updateProjectStatus(id, status)` - Change status

**AssetsAPI** (`services/api/assets.ts`):

- `fetchAssets(projectId?)` - List assets
- `fetchAsset(id)` - Get single asset
- `createAsset(data)` - Create asset record
- `updateAsset(id, data)` - Update asset
- `deleteAsset(id)` - Delete asset
- `getUploadUrl(request)` - Get signed S3 URL
- `getAssetAccessUrl(assetId)` - Get download URL

### 3. Data Provider (`services/dataProvider.ts`)

**Pattern**: Wrapper with fallback logic

```typescript
// ProjectsProvider
const projects = await ProjectsProvider.list();
const project = await ProjectsProvider.get(id);
const newProject = await ProjectsProvider.create(data);

// AssetsProvider
const assets = await AssetsProvider.list(projectId?);
const asset = await AssetsProvider.get(id);
const newAsset = await AssetsProvider.create(data);
```

**Fallback Logic**:

```
1. Try API call
2. If fails AND VITE_USE_MOCK_DATA=true:
   - Log warning
   - Use mock data
3. If both fail:
   - Throw error to component
```

### 4. Authentication Context Updates

**Feature Flag**: `VITE_USE_MOCK_DATA` (defaults to `true` for dev)

**PHASE 1 (Mock Mode)**:

```typescript
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
// → Uses hardcoded MOCK_USERS
// → Stores user object in localStorage['mock_auth_user']
```

**PHASE 2+ (Real Mode)**:

```typescript
const USE_MOCK_AUTH = false;
// → Calls real backend /auth/login
// → Stores JWT in localStorage['managed_capture_auth_token']
// → apiClient.setToken(token) for all requests
```

---

## Backend API Contract

Prepared for implementation (no changes needed until backend exists):

### Projects Endpoints

```
GET    /api/projects              - List projects (role-filtered)
POST   /api/projects              - Create project
GET    /api/projects/:id          - Get single project
PATCH  /api/projects/:id          - Update project
DELETE /api/projects/:id          - Delete/archive project
POST   /api/projects/:id/assign   - Assign to technician
```

### Assets Endpoints

```
GET    /api/assets                - List assets
GET    /api/assets/:id            - Get asset metadata
POST   /api/assets                - Create asset record
PATCH  /api/assets/:id            - Update asset
DELETE /api/assets/:id            - Delete asset
POST   /api/assets/upload-url     - Get signed upload URL
POST   /api/assets/:id/access-url - Get signed download URL
```

### Authentication Endpoints (PHASE 2)

```
POST   /api/auth/login            - Login with credentials
POST   /api/auth/logout           - Logout
GET    /api/auth/me               - Get current user
POST   /api/auth/refresh          - Refresh JWT
```

---

## Environment Configuration

### Development (.env.local or .env)

```bash
# Backend service URL
VITE_API_BASE_URL=http://localhost:3001/api

# Object storage
VITE_STORAGE_BUCKET=https://s3.example.com/managed-capture

# Auth provider (future)
VITE_AUTH_PROVIDER_URL=https://auth.example.com

# Feature flag: use mock data if real API fails
VITE_USE_MOCK_DATA=true
```

### Production (Netlify env vars)

```bash
# Real backend URL
VITE_API_BASE_URL=https://api.managedcapture.com/api

# Real S3 bucket
VITE_STORAGE_BUCKET=https://s3.amazonaws.com/managed-capture-prod

# Real auth provider
VITE_AUTH_PROVIDER_URL=https://auth.company.com

# Disable mock fallback in production
VITE_USE_MOCK_DATA=false
```

---

## Migration Path: From Mock to Real Backend

**PHASE 1 (Current)**:

- ✅ API services ready (awaiting backend)
- ✅ Components use DataProvider
- ✅ Falls back to mock if backend unavailable
- ✅ AuthContext prepared for JWT

**PHASE 2**:

- Implement backend endpoints (Postgres + storage)
- Implement `/auth/login`, `/auth/me`
- Set `VITE_USE_MOCK_DATA=false` in production
- Remove MOCK_USERS array from AuthContext

**PHASE 3+**:

- Remove fallback logic (no longer needed)
- API calls required, failures propagate immediately
- Full database-backed operations

---

## Error Handling

### API Errors

Structured error format:

```typescript
interface ApiError {
  status: number;        // HTTP status code
  message: string;       // Error message
  code?: string;         // Error code (e.g., 'NETWORK_ERROR')
  details?: Record<...>; // Additional context
}
```

### Component Error Handling

Components should handle API failures gracefully:

```typescript
try {
  const projects = await ProjectsProvider.list();
  setProjects(projects);
} catch (error) {
  console.error('Failed to load projects', error);
  showErrorToast('Unable to load projects. Try again later.');
  // Render error state or retry UI
}
```

---

## Security Improvements (Compared to Mock)

| Aspect               | Before               | After                  |
| -------------------- | -------------------- | ---------------------- |
| **Authentication**   | Fake (no validation) | JWT tokens (prepared)  |
| **Data Validation**  | Client-only          | Will be server-side    |
| **Role Enforcement** | Client-only          | Will be server-side    |
| **Data Encryption**  | Plain localStorage   | Will be HTTPS + tokens |
| **Audit Trail**      | None                 | Will be stored in DB   |

---

## Scalability Impact

### Before (Mock)

- Single-user in-memory store
- No concurrency handling
- Session data lost on refresh
- No audit trail
- Cannot handle multiple customers

### After (PHASE 1, with Real Backend)

- Multi-tenant database
- Proper concurrency (DB locks, transactions)
- Persistent across sessions
- Server-side audit logging
- Per-customer data isolation

---

## Testing During PHASE 1

With `VITE_USE_MOCK_DATA=true` (default):

- UI components work immediately (no backend needed)
- API calls are logged as warnings
- Mock data provides consistent test data
- Can develop/test portal without backend

To switch to real backend:

1. Set `VITE_API_BASE_URL=https://your-api.com`
2. Set `VITE_USE_MOCK_DATA=false`
3. Backend must be running and match API contract

---

## Checklist: What's Complete

- ✅ API Client (`services/api/client.ts`)
- ✅ ProjectsAPI service (`services/api/projects.ts`)
- ✅ AssetsAPI service (`services/api/assets.ts`)
- ✅ DataProvider with fallback (`services/dataProvider.ts`)
- ✅ AuthContext updated for JWT support
- ✅ Portal.tsx refactored to use DataProvider
- ✅ ModelEditor.tsx refactored
- ✅ RestaurantMenu.tsx refactored
- ✅ Environment variables configured
- ✅ This documentation

---

## Checklist: What's Next (PHASE 2)

- [ ] Implement real authentication backend
- [ ] Implement `/auth/login` endpoint
- [ ] Implement `/auth/me` endpoint
- [ ] Implement `/api/projects/*` endpoints
- [ ] Implement `/api/assets/*` endpoints
- [ ] Implement Postgres schema
- [ ] Implement S3 integration
- [ ] Implement role-based access control
- [ ] Add request validation middleware
- [ ] Add audit logging

---

## Why This Matters (Scalability & Security)

1. **Multi-tenant Support**: Backend filters data by user role/customer
2. **Audit Trail**: Every change logged with timestamp, user, changes
3. **Stateless API**: Can scale horizontally (multiple servers)
4. **Database Transactions**: Ensures data consistency
5. **JWT Tokens**: Standard auth (no localStorage secrets)
6. **Signed URLs**: S3 uploads without exposing credentials
7. **Rate Limiting**: Prepared for upstream API rate limit handling
8. **Error Recovery**: Fallback pattern allows graceful degradation

---

## Developer Notes

### For Backend Engineers

- API contract is in `services/api/projects.ts` and `services/api/assets.ts`
- All responses must be JSON
- Errors must follow `{ status, message, code?, details? }` format
- JWT tokens go in `Authorization: Bearer <token>` header
- Server must validate roles server-side (don't trust client)

### For Frontend Engineers

- Use `ProjectsProvider` and `AssetsProvider`, not API directly
- Components don't need to know if data is real or mock
- Errors should be caught and shown to user
- Token is set automatically in `AuthContext.login()`

### For DevOps/Deployment

- Set environment variables in Netlify dashboard
- In dev: `VITE_USE_MOCK_DATA=true` (can test without backend)
- In prod: `VITE_USE_MOCK_DATA=false` (requires backend)
- Backend URL should be HTTPS-only in production

---

## Files Changed

### New Files

- `services/api/client.ts`
- `services/api/projects.ts`
- `services/api/assets.ts`
- `services/api/index.ts`
- `services/dataProvider.ts`
- `docs/PHASE-1-BACKEND-STRUCTURE.md`

### Modified Files

- `.env.example` - Added backend configuration
- `contexts/AuthContext.tsx` - JWT support, feature flag
- `pages/Portal.tsx` - Uses DataProvider
- `pages/editor/ModelEditor.tsx` - Uses AssetsProvider
- `pages/templates/RestaurantMenu.tsx` - Uses ProjectsProvider

### Unchanged Files

- `services/mockData.ts` - Still available as fallback
- No UI changes
- No styling changes

---

## Summary

PHASE 1 establishes the foundation for a production-grade backend. All data flows through a centralized service layer that abstracts the actual source (API vs. mock). This allows:

1. **Development without backend** (mock fallback)
2. **Testing with real data** (switch backend URL)
3. **Zero breaking changes** to UI components
4. **Clear API contract** for backend team
5. **Horizontal scalability** (stateless services)

The system is now **architecture-ready for PHASE 2 (real auth) and PHASE 3+ (project lifecycle, storage, tiers)**.

---

**Next Phase**: PHASE 2 — Authentication & Role Enforcement
