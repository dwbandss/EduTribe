# MongoDB Models Refactoring - EduTribe Platform

## Overview

This document outlines the refactored MongoDB models for the EduTribe platform, transitioning from a decentralized authentication system to a centralized User model with role-specific profiles.

## Architecture Change

### Before (Old Structure)
```
User Model (with auth fields)
Student Model (with duplicated auth fields)
School Model (with duplicated auth fields)
Donor Model (with duplicated auth fields)
Admin Model (with duplicated auth fields)
```

### After (New Structure)
```
User Model (centralized authentication)
├── Student (role-specific data)
├── Volunteer (role-specific data)
├── School (role-specific data)
├── NGO (role-specific data)
├── Donor (role-specific data)
└── Admin (role-specific data)
```

## Benefits

1. **Cleaner Authentication**: Single source of truth for user credentials
2. **Better Security**: No password duplication across models
3. **Easier RBAC**: Role-based access control centralized
4. **AI Integration**: Enhanced data structure for AI matching
5. **Scalability**: Better performance with optimized indexes
6. **Analytics**: Unified user data for comprehensive analytics

## Model Details

### User Model (`models/refactored/User.ts`)

**Purpose**: Centralized authentication and identity management

**Key Fields**:
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password (never returned in JSON)
- `role`: User role (volunteer, ngo, donor, student, admin, school)
- `phone`: Optional phone number
- `isVerified`: Account verification status
- `createdAt`, `updatedAt`: Timestamps

**Indexes**:
- Unique index on `email`
- Index on `role`
- Index on `isVerified`

**Methods**:
- `comparePassword()`: Compare candidate password with hash
- `getJWT()`: Generate JWT token
- `findByEmail()`: Static method to find by email
- `findByRole()`: Static method to find by role

### Student Model (`models/refactored/Student.ts`)

**Purpose**: Student-specific data for AI scholarship recommendations and education guidance

**Key Fields**:
- `userId`: Reference to User (unique)
- `schoolId`: Reference to School
- `class`: Current class/grade
- `tribeCategory`: Scheduled, tribal, or other
- `state`, `district`: Location data
- `interests`: Array of interests
- `scholarshipsApplied`: References to scholarships
- `academicPerformance`: Grades, attendance, subjects
- `familyBackground`: Family income, parents' occupation, etc.
- `aiRecommendations`: AI-generated recommendations

**Indexes**:
- Unique index on `userId`
- Index on `schoolId`, `state`, `district`, `tribeCategory`
- Index on `interests` and `academicPerformance.attendance`

**AI Features**:
- Scholarship matching based on family background and performance
- Career guidance based on interests and academic data
- Educational resource recommendations

### School Model (`models/refactored/School.ts`)

**Purpose**: School information with geospatial data for location-based queries

**Key Fields**:
- `userId`: Reference to User (unique)
- `schoolName`, `schoolCode`: School identification
- `district`, `state`: Location
- `locationCoordinates`: GeoPoint for location queries
- `studentsCount`, `teachersCount`: School size
- `facilities`: Available facilities (hostel, sports, lab, etc.)
- `needs`: School needs (volunteers, books, computers, etc.)
- `verificationStatus`: Pending, verified, rejected, suspended
- `affiliation`: Board, establishment year, type
- `academicDetails`: Classes, medium, pass rates
- `infrastructure`: Building details, utilities

**Indexes**:
- Unique index on `userId`, `schoolCode`
- Geospatial index on `locationCoordinates`
- Index on `state`, `district`, `verificationStatus`
- Index on `studentsCount`, `facilities`, `needs`

**Geospatial Features**:
- Find schools within radius
- Location-based volunteer matching
- Regional analytics

### Volunteer Model (`models/refactored/Volunteer.ts`)

**Purpose**: Volunteer data for AI matching and placement

**Key Fields**:
- `userId`: Reference to User (unique)
- `skills`: Teaching, mentoring, sports, arts, etc.
- `subjects`: Subjects they can teach
- `languages`: Languages they speak
- `educationLevel`: Highest education level
- `experienceYears`: Years of experience
- `availability`: Time availability and schedule
- `preferredRegions`: Where they want to volunteer
- `rating`: Performance rating (1-5)
- `volunteerHours`: Total hours contributed
- `verified`: Background check status
- `backgroundCheck`: Verification details
- `certifications`: Professional certifications
- `aiMatchScore`: AI-calculated matching score

**Indexes**:
- Unique index on `userId`
- Index on `skills`, `subjects`, `languages`
- Index on `educationLevel`, `experienceYears`, `rating`
- Index on `verified`, `preferredRegions`
- Index on `aiMatchScore`

**AI Matching**:
- Skill-based school matching
- Location preference matching
- Rating and experience weighting
- Availability scheduling

### NGO Model (`models/refactored/NGO.ts`)

**Purpose**: NGO data for partnership and impact tracking

**Key Fields**:
- `userId`: Reference to User (unique)
- `organizationName`, `registrationNumber`: Legal identification
- `focusAreas`: Education, digital literacy, girls education, etc.
- `operatingRegions`: States and districts of operation
- `projectsCompleted`, `studentsSupported`, `schoolsSupported`: Impact metrics
- `verificationStatus`: Verification status
- `financialDetails`: Budget, funding sources, audit info
- `teamDetails`: Employees, volunteers, board members
- `impactMetrics`: Detailed impact tracking
- `partnerships`: Partner organizations

**Indexes**:
- Unique index on `userId`, `registrationNumber`
- Index on `focusAreas`, `operatingRegions.state`
- Index on `verificationStatus`, `projectsCompleted`
- Index on `studentsSupported`, `financialDetails.annualBudget`

**Analytics Features**:
- Impact tracking by focus area
- Regional impact analysis
- Partnership network analysis

### Donor Model (`models/refactored/Donor.ts`)

**Purpose**: Donor data for fundraising and impact tracking

**Key Fields**:
- `userId`: Reference to User (unique)
- `donorType`: Individual, Corporate, Foundation
- `organizationName`: For corporate/foundation donors
- `donationHistory`: All donation records
- `totalDonated`: Lifetime total
- `recurringDonations`: Monthly/quarterly/annual donations
- `preferences`: Communication preferences, interests
- `impactMetrics`: Students/schools supported
- `verificationStatus`: Account verification
- `taxInfo`: PAN number, tax receipts, 80G address

**Indexes**:
- Unique index on `userId`
- Index on `donorType`, `verificationStatus`
- Index on `totalDonated`, `donationHistory.date`
- Index on `donationHistory.purpose`

**Features**:
- Tax receipt generation
- Impact tracking
- Recurring donation management
- Communication preferences

### Admin Model (`models/refactored/Admin.ts`)

**Purpose**: Admin data for platform management and security

**Key Fields**:
- `userId`: Reference to User (unique)
- `permissions`: Specific permissions (verifySchools, manageUsers, etc.)
- `role`: Super admin, regional, content, support, etc.
- `department`: Organizational department
- `accessLevel`: Full, regional, limited, readonly
- `lastLogin`: Last login timestamp
- `loginHistory`: Login attempts and history
- `auditLogs`: Action audit trail
- `isActive`: Account status

**Indexes**:
- Unique index on `userId`
- Index on `role`, `permissions`, `accessLevel`
- Index on `isActive`, `lastLogin`
- Index on `loginHistory.timestamp`, `auditLogs.timestamp`

**Security Features**:
- Comprehensive audit logging
- Permission-based access control
- Login tracking and security monitoring
- Action audit trails

## Relationships

### One-to-One Relationships
- User ↔ Student (via userId)
- User ↔ Volunteer (via userId)
- User ↔ School (via userId)
- User ↔ NGO (via userId)
- User ↔ Donor (via userId)
- User ↔ Admin (via userId)

### One-to-Many Relationships
- School → Students (via schoolId)
- User → AuditLogs (in Admin model)
- Donor → DonationHistory
- NGO → Partnerships

### Virtual Populations
All role-specific models have virtual `user` population for easy access to user data.

## AI Integration Features

### Student Model
- Scholarship recommendations based on family background and performance
- Career guidance based on interests and academic data
- Educational resource matching

### Volunteer Model
- AI match score for school-volunteer compatibility
- Skill-based matching algorithm
- Location and availability optimization

### School Model
- Geospatial queries for nearby volunteers
- Needs-based volunteer matching
- Infrastructure analysis for resource allocation

### NGO Model
- Partnership opportunity matching
- Impact prediction based on focus areas
- Resource optimization recommendations

## Security Considerations

### Password Security
- Passwords only stored in User model
- Automatic hashing with bcrypt
- Passwords never returned in JSON responses

### Data Access
- Role-based access control through Admin permissions
- Audit logging for all admin actions
- Sensitive data protection in public APIs

### Verification Status
- Multi-level verification for schools and NGOs
- Background checks for volunteers
- Document verification for organizations

## Performance Optimizations

### Indexes
- Strategic indexes for common queries
- Compound indexes for complex queries
- Geospatial indexes for location queries

### Query Optimization
- Efficient population of related data
- Aggregation pipelines for analytics
- Pagination for large datasets

## Migration Strategy

### Migration Script (`scripts/migration.ts`)
- Automated migration from old to new structure
- Data validation and integrity checks
- Rollback capability for testing
- Comprehensive error logging

### Migration Steps
1. Create User records from existing role models
2. Create role-specific profiles linked to User records
3. Migrate relationships and data
4. Validate data integrity
5. Update application code to use new structure

## Usage Examples

### Creating a New User with Role Profile
```typescript
// Create user
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'volunteer',
  phone: '+1234567890'
});

// Create role profile
const volunteer = await Volunteer.create({
  userId: user._id,
  skills: ['teaching', 'mathematics'],
  subjects: ['Math', 'Science'],
  languages: ['English', 'Hindi'],
  educationLevel: 'bachelors',
  experienceYears: 2,
  availability: {
    weekdays: true,
    weekends: false,
    mornings: true,
    afternoons: true,
    evenings: false,
    hoursPerWeek: 20,
    preferredSchedule: 'Weekday mornings'
  },
  preferredRegions: [{
    state: 'Maharashtra',
    district: 'Mumbai',
    priority: 'high'
  }]
});
```

### AI-Powered Volunteer Matching
```typescript
// Find volunteers for a specific school
const volunteers = await Volunteer.findForAI(
  ['teaching', 'mathematics'], // required skills
  'Maharashtra' // region
);

// Update AI match score
await volunteer.updateAIMatchScore(0.85);
```

### Geospatial School Queries
```typescript
// Find schools within 10km of coordinates
const nearbySchools = await School.findNearby(
  72.8777, // longitude
  19.0760, // latitude
  10000 // distance in meters
);
```

### Impact Analytics
```typescript
// Get comprehensive analytics
const studentAnalytics = await ModelOperations.getRoleAnalytics('student');
const volunteerAnalytics = await ModelOperations.getRoleAnalytics('volunteer');
```

## Testing

### Model Validation
- Zod schemas for input validation
- Type safety with TypeScript interfaces
- Comprehensive error handling

### Migration Testing
- Validation scripts for data integrity
- Rollback capabilities
- Performance benchmarking

## Future Enhancements

### AI Features
- Machine learning models for better matching
- Predictive analytics for student success
- Automated impact assessment

### Scalability
- Sharding strategies for large datasets
- Caching layers for frequently accessed data
- Real-time analytics with change streams

### Integration
- API versioning for backward compatibility
- Webhook support for real-time updates
- Third-party integrations for expanded functionality

## Conclusion

The refactored model structure provides a solid foundation for the EduTribe platform's growth, with enhanced security, better performance, and comprehensive AI integration capabilities. The centralized authentication system and role-specific profiles enable scalable development while maintaining data integrity and security.
