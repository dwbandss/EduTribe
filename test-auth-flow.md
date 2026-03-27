# NGO Authentication Flow Test

## Test Steps to Verify NGO Authentication

### 1. Login Test
- **URL**: `/login` 
- **Credentials**: Use NGO credentials (EDU-NGO-961933 / 1234567890)
- **Expected**: Should set HTTP-only cookie and redirect to `/ngo/dashboard`

### 2. Dashboard Load Test
- **URL**: `/ngo/dashboard`
- **Expected**: Should load without authentication errors
- **Check**: Network tab for failed API calls

### 3. Profile Access Test
- **URL**: `/ngo/profile`
- **Expected**: Should load NGO profile details
- **Check**: Network tab for authentication errors

### 4. API Endpoint Tests

#### NGO Profile API (`/api/ngo/profile/route.ts`)
```typescript
// Should accept Authorization header
// Should return: { success: true, profile: {...} }
```

#### NGO Stats API (`/api/ngo/stats/route.ts`)
```typescript
// Should accept Authorization header
// Should return: { success: true, stats: {...} }
```

#### NGO Volunteers API (`/api/ngo/volunteers/route.ts`)
```typescript
// Should accept Authorization header
// Should return: { success: true, volunteers: [...] }
```

### 5. Cookie Verification
```javascript
// Check in browser console:
document.cookie
// Should show: token=...; HttpOnly; ...
```

### 6. JWT Token Verification
```javascript
// Decode token to verify payload:
const token = getCookie('token');
const decoded = jwt.decode(token);
console.log('JWT Payload:', decoded);
// Should show: { role: 'ngo', uid: 'EDU-NGO-961933', ... }
```

## Common Issues to Check

### Authentication Errors:
- "No token provided" → Cookie not being sent/read properly
- "Invalid token" → JWT verification failing
- "NGO not found" → User in wrong model or database issue

### Database Connection Issues:
- "connectDB not defined" → Wrong import path
- MongoDB connection timeouts

### Flow Verification:
1. Login → Cookie set → Dashboard loads → Profile loads → APIs work
2. All API calls should use consistent patterns
3. Client-side should use cookies, not localStorage

## Files to Check if Issues Persist:

1. **d:\EduTribe\models\NGO.ts** - Ensure NGO model has correct fields
2. **d:\EduTribe\models\User.ts** - Ensure User model doesn't conflict with NGO
3. **d:\EduTribe\.env.local** - Ensure JWT_SECRET is set
4. **MongoDB Connection** - Verify database is accessible

## Test Commands:
```bash
# Check MongoDB connection
node -e "console.log(require('./lib/dbConnect')())"

# Check JWT_SECRET
echo $JWT_SECRET

# Restart development server
npm run dev
```

This test file helps verify that all authentication components are working correctly and provides debugging steps if issues persist.
