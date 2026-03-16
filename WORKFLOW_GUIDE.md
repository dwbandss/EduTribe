# 🎯 EduTribe Volunteer Workflow System

## 📋 Overview

This system implements a comprehensive volunteer management workflow supporting both **NGO Volunteers** and **Independent Volunteers** with complete dashboard integration.

## 🔄 Workflow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NGO Admin   │    │     Admin      │    │    Schools     │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ NGO        │ │    │ │ Independent  │ │    │ │ Both Types   │ │
│ │ Volunteers  │ │◄──►│ │ Volunteers  │ │◄──►│ │ of Volunteers│ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 👥 Volunteer Types

### 1. NGO Volunteers
- **Login**: Requires NGO UID + Volunteer UID + Password
- **Verification**: Verified by NGO organization
- **Profile**: Managed by NGO
- **Assignment**: NGO assigns to schools

### 2. Independent Volunteers
- **Registration**: Aadhaar Number + Name + Email + Password
- **Verification**: Verified by Admin
- **Profile**: Self-completed after registration
- **Assignment**: Available to all schools based on needs

## 🚀 API Endpoints

### Authentication
```
POST /api/auth/volunteer-login     # Login for both types
POST /api/auth/volunteer-register  # Register independent volunteers
```

### Volunteer Management
```
GET  /api/volunteer/complete-profile  # Get volunteer profile
POST /api/volunteer/complete-profile  # Complete/update profile
```

### Admin Verification
```
GET  /api/admin/verify-volunteer     # Get pending volunteers
POST /api/admin/verify-volunteer     # Verify/reject volunteers
```

### NGO Management
```
GET  /api/ngo/volunteers           # Get NGO volunteers
POST /api/ngo/volunteers           # NGO volunteer actions
GET  /api/ngo/schools              # Get NGO schools
POST /api/ngo/schools              # School management
GET  /api/ngo/requests             # Get volunteer requests
POST /api/ngo/requests             # Request management
GET  /api/ngo/stats                # NGO statistics
GET  /api/ngo/impact              # Impact analytics
```

## 🗄️ Database Schema

### Volunteer Model (VolunteerNew.ts)
```typescript
interface IVolunteer {
  // Common Fields
  uid: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  volunteerType: 'ngo' | 'independent';
  
  // NGO Volunteer Fields
  ngoUid?: string;           // Link to NGO
  
  // Independent Volunteer Fields
  aadhaarNumber?: string;    // Aadhaar verification
  adminVerified?: boolean;    // Admin verification status
  
  // Profile Data
  degree?: string;
  location?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  
  // Professional Data
  skills: string[];
  preferredSubjects: string[];
  preferredClasses: string[];
  preferredDistrict: string;
  experience: string;
  bio: string;
  availability: Array<{
    day: string;
    timeSlots: string[];
  }>;
  
  // Status Fields
  verificationStatus: 'pending' | 'verified' | 'rejected';
  profileCompleted: boolean;
  isActive: boolean;
  
  // Performance Metrics
  assignedSchoolUid?: string;
  assignedRequests: string[];
  totalSessions: number;
  totalHours: number;
  studentsTaught: number;
  ratingAverage: number;
}
```

## 🔄 Complete Workflow

### Step 1: NGO Volunteer Workflow
```
1. NGO logs in → /api/auth/login
2. NGO creates volunteer → Internal system
3. Volunteer receives credentials
4. Volunteer logs in → /api/auth/volunteer-login
   - Payload: { ngoUid, volunteerUid, password, loginType: 'ngo' }
5. NGO manages volunteer → /api/ngo/volunteers
6. NGO assigns to schools → /api/ngo/assign-volunteer
```

### Step 2: Independent Volunteer Workflow
```
1. Volunteer registers → /api/auth/volunteer-register
   - Payload: { aadhaarNumber, name, email, phone, password }
2. Volunteer completes profile → /api/volunteer/complete-profile
   - Payload: { degree, location, skills, preferredSubjects, ... }
3. Admin reviews → /api/admin/verify-volunteer
4. Admin verifies/rejects → /api/admin/verify-volunteer
   - Payload: { volunteerUid, action: 'verify' | 'reject' }
5. Volunteer becomes available to schools
```

### Step 3: School Integration
```
1. School views available volunteers
   - NGO volunteers: From partnered NGOs
   - Independent volunteers: From verified pool
2. School requests volunteers → /api/volunteer-requests
3. Smart matching algorithm suggests best matches
4. School accepts/assigns volunteers
5. Sessions tracked → /api/sessions
```

## 🧪 Testing

### Run Workflow Tests
```bash
# Install dependencies
npm install axios

# Run complete workflow test
npm run test:workflow

# Or run individual tests
node tests/volunteer-workflow.test.js
```

### Test Coverage
- ✅ NGO Volunteer registration and login
- ✅ Independent volunteer registration and profile completion
- ✅ Admin verification of independent volunteers
- ✅ School volunteer visibility and matching
- ✅ Dashboard API integration
- ✅ Cross-dashboard data flow

## 🎯 Key Features

### 🔐 Security
- JWT-based authentication
- Role-based access control
- Aadhaar verification for independents
- NGO verification for NGO volunteers

### 📊 Analytics
- Real-time volunteer statistics
- Impact tracking across all types
- Performance metrics
- District coverage analysis

### 🔄 Smart Matching
- Subject-based matching
- District preference matching
- Class compatibility
- Availability scheduling
- Rating-based prioritization

### 📱 Dashboard Integration
- NGO Dashboard: Manage NGO volunteers
- Volunteer Dashboard: Profile and assignments
- School Dashboard: View and request volunteers
- Admin Dashboard: Verify independent volunteers

## 🚀 Getting Started

### 1. Setup Environment
```bash
# Copy environment variables
cp .env.example .env.local

# Configure database and JWT
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Test Workflow
```bash
npm run test:workflow
```

## 📝 Configuration

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/edutribe
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### Volunteer Types Configuration
```typescript
// In VolunteerNew.ts
volunteerType: 'ngo' | 'independent'

// NGO Volunteer: Requires ngoUid
// Independent Volunteer: Requires aadhaarNumber + adminVerified
```

## 🔧 Troubleshooting

### Common Issues
1. **Volunteer not found**: Check UID format and NGO assignment
2. **Aadhaar already exists**: Use unique Aadhaar number
3. **Admin verification failed**: Ensure volunteer profile is completed
4. **School can't see volunteers**: Check verification status

### Debug Logs
All APIs include comprehensive debug logging:
```javascript
console.log('=== DEBUG: [API_NAME] ===', data);
```

## 📈 Next Steps

### Phase 1: Core Workflow ✅
- [x] Dual volunteer system
- [x] Authentication for both types
- [x] Admin verification
- [x] Profile management
- [x] Dashboard integration

### Phase 2: Advanced Features
- [ ] Real-time notifications
- [ ] Mobile app integration
- [ ] Advanced analytics
- [ ] Automated matching

### Phase 3: Scaling
- [ ] Multi-region support
- [ ] Load balancing
- [ ] Caching optimization
- [ ] Performance monitoring

---

## 🎉 Summary

This workflow system provides:
- **Complete volunteer lifecycle management**
- **Dual pathway support (NGO + Independent)**
- **Secure authentication and verification**
- **Seamless dashboard integration**
- **Comprehensive testing coverage**
- **Production-ready APIs**

The system is now ready for production deployment with full workflow support! 🚀
