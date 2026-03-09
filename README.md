# EduTribe Platform

A Next.js platform connecting tribal schools, volunteers, NGOs, donors and students for quality education access in remote communities.

## 🚀 Features

- **UID-based Authentication**: Secure login system using unique identifiers (EDU-XXXXX format)
- **Role-based Access**: Support for Volunteers, NGOs, Schools, Donors, Students, and Admins
- **Modern UI/UX**: Beautiful interface with Framer Motion animations and Tailwind CSS
- **Responsive Design**: Mobile-first approach with seamless tablet and desktop experiences
- **Security First**: bcrypt password hashing, JWT tokens, rate limiting, and input validation
- **Real-time Components**: Interactive circular gallery, scroll velocity sections, and animated testimonials

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Node.js, Express-style API routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens, bcrypt password hashing
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Validation**: Zod schema validation
- **UI Components**: shadcn/ui structure

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd edutribe
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure your environment variables in `.env.local`:
```
MONGO_URI=mongodb://localhost:27017/edutribe
JWT_SECRET=your_strong_secret_key_here
NEXT_PUBLIC_SITE_TITLE=EduTribe
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Project Structure

```
EduTribe/
│
├─ app/
│   ├─ page.jsx                 # Landing page
│   ├─ login/page.jsx            # Login page
│   ├─ signup/page.jsx           # Signup page
│   ├─ layout.jsx                # Root layout
│   ├─ globals.css               # Global styles
│   └─ api/
│        └─ auth/
│             ├─ register/route.js    # Registration API
│             ├─ login/route.js       # Login API
│             └─ forgot-password/route.js # Password reset API
│
├─ components/
│   └─ ui/
│        ├─ circular-gallery.jsx      # 3D rotating gallery
│        ├─ scroll-velocity.jsx       # Parallax scroll section
│        ├─ bento-grid.jsx            # Feature grid
│        ├─ slide-tabs.jsx            # Navigation tabs
│        ├─ testimonials-columns.jsx  # Testimonials carousel
│        ├─ minimal-auth-page.jsx     # Authentication UI
│        ├─ particles.jsx             # Particle background
│        ├─ button.jsx                # Button component
│        ├─ card.jsx                  # Card component
│        └─ input.jsx                 # Input component
│
├─ data/
│   └─ images.js                # Unsplash image URLs
│
├─ lib/
│   ├─ mongodb.js               # Database connection
│   ├─ generateUID.js           # UID generator
│   └─ utils.js                 # Utility functions
│
├─ models/
│   ├─ User.js                  # User schema
│   ├─ School.js                # School schema
│   ├─ Donor.js                 # Donor schema
│   ├─ Student.js               # Student schema
│   └─ Admin.js                 # Admin schema
│
├─ scripts/
│   └─ seed.js                  # Database seed script
│
└─ public/                     # Static assets
```

## 🔐 Authentication System

### UID-Based Login
- Users register with email and password
- System generates unique UID (EDU-XXXXX format)
- Users login using UID and password
- UID is displayed prominently after registration

### Role System
- **Volunteer/NGO**: Can apply for teaching opportunities
- **School**: Can post requirements and manage school profile
- **Donor**: Can contribute to schools and programs
- **Student**: Can access learning resources
- **Admin**: Can manage the entire platform

### Security Features
- **Password Hashing**: bcrypt with salt rounds of 12
- **JWT Tokens**: Secure session management with HTTP-only cookies
- **Rate Limiting**: Prevents brute force attacks (5 attempts per minute)
- **Input Validation**: Zod schema validation for all inputs
- **CSRF Protection**: Built-in Next.js CSRF middleware
- **Secure Headers**: Helmet.js for security headers

## 🎨 UI Components

### Circular Gallery
- 3D rotating card gallery
- Auto-rotation with manual navigation
- Hover effects and smooth transitions
- Central floating text display

### Scroll Velocity
- Parallax scrolling effects
- Image cards with hover overlays
- Floating animation elements
- Responsive grid layout

### Bento Grid
- Interactive feature cards
- Hover animations and scaling
- Icon-based visual hierarchy
- Statistics display section

### Testimonials Columns
- Infinite vertical scroll animation
- Column-based layout
- Avatar and role display
- Smooth transitions

### Minimal Auth Page
- Particle background effect
- Role selection grid
- Password visibility toggle
- Social login options (UI only)

## 📱 Responsive Design

- **Mobile**: 320px and up
- **Tablet**: 768px and up
- **Desktop**: 1024px and up
- **Large Desktop**: 1280px and up

## 🌐 Environment Variables

Create a `.env.local` file with the following variables:

```env
MONGO_URI=mongodb://localhost:27017/edutribe
JWT_SECRET=your_strong_secret_key_here
NEXT_PUBLIC_SITE_TITLE=EduTribe
```

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  uid: String (unique),
  role: String (volunteer|ngo|donor|student|admin),
  organizationName: String (optional),
  phone: String,
  createdAt: Date
}
```

### School Model
```javascript
{
  schoolName: String,
  schoolCode: String,
  email: String,
  password: String (hashed),
  uid: String (unique),
  district: String,
  state: String,
  studentsCount: Number,
  teachersCount: Number,
  needs: [String],
  verificationStatus: String,
  createdAt: Date
}
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### Response Format
```javascript
{
  success: boolean,
  message: string,
  data?: object,
  errors?: array
}
```

## 🎯 Color Palette

- **Primary**: Terracotta (#C65D3B)
- **Secondary**: Forest Green (#2F6F4E)
- **Accent**: Warm Sand (#E6C79C)
- **Background**: Cream (#F9F7F3)
- **Text**: Dark Gray (#2B2B2B)

## 📝 Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npm run seed         # Seed database with sample data
```

## 🔧 Development

### Adding New Components
1. Create component in `/components/ui/`
2. Follow shadcn/ui structure
3. Use TypeScript interfaces for props
4. Include responsive design

### API Development
1. Create route in `/app/api/`
2. Use Zod for validation
3. Implement error handling
4. Add rate limiting for auth routes

### Styling
- Use Tailwind CSS classes
- Follow design system colors
- Implement dark mode support
- Ensure accessibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please contact:
- Email: support@edutribe.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

## 🌟 Acknowledgments

- [Unsplash](https://unsplash.com) for beautiful stock images
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons
