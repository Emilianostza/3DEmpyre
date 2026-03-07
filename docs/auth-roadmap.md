# Authentication Roadmap

This document outlines the strategy for implementing authentication in the Managed Capture 3D Platform.

## Phase 1: Foundation (Frontend)

- [ ] **Context Setup**: Create `AuthContext` to manage user state globally.
- [ ] **Protected Routes**: Implement a `ProtectedRoute` component to restrict access to authenticated users.
- [ ] **Login Page**: Enhance the existing login page to use the context.
- [ ] **Mock Auth**: Implement a mock authentication service for development and testing.

## Phase 2: Role-Based Access Control (RBAC)

- [ ] **Roles Definition**: Define roles: `Admin`, `Client`, `Employee`.
- [ ] **Permission Logic**: Implement logic to show/hide UI elements based on roles.
- [ ] **Redirects**: Configure role-based redirects after login (e.g., Clients -> Portal, Employees -> Dashboard).

## Phase 3: Backend Integration

- [ ] **Provider Selection**: (Suggest specific providers: Supabase, Firebase, or Custom Backend).
- [ ] **API Integration**: Replace mock services with actual API calls.
- [ ] **Token Management**: Implement JWT storage (HttpOnly cookies or localStorage) and refresh logic.

## Phase 4: Security Enhancements

- [ ] **Session Persistence**: Ensure users stay logged in across reloads.
- [ ] **Logout Flow**: secure logout clearing all tokens and state.
- [ ] **Error Handling**: graceful handling of auth errors (401/403).

## Proposed Tech Stack for Auth

- **Frontend**: React Context API + Hooks
- **State Management**: React `useContext` / `useReducer`
- **Routing**: `react-router-dom` loaders/actions (optional) or traditional protected route components.
- **Backend Service**: (To be determined - Recommendation: Supabase for quick setup)
