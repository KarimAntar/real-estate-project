# 🏠 Real Estate Listings Platform

A modern, full-stack real estate platform built with Next.js 13+, Firebase, and TypeScript. Browse properties, manage listings, and connect with trusted agents in a seamless, responsive web application.

![Real Estate Platform](https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&h=400&q=80)

## ✨ Features

### 🔐 Authentication & User Management
- **Email/Password Registration** with email verification
- **Google OAuth** integration with account linking
- **Password Reset** functionality with email recovery
- **Role-based Access Control** (User/Admin)
- **Protected Routes** with email verification requirements

### 🏡 Property Management
- **CRUD Operations** for property listings
- **Image Upload & Gallery** with multiple photo support
- **Advanced Search & Filtering** by location, type, and price
- **Responsive Property Cards** with detailed information
- **Interactive Image Carousels** for property viewing

### 👑 Admin Dashboard
- **Manage All Listings** across all users
- **User Management** and oversight
- **Administrative Controls** for content moderation

### 🎨 User Experience
- **Dark Theme** UI with modern design
- **Responsive Design** for all devices
- **Real-time Notifications** with read/unread states
- **Toast Notifications** for user feedback
- **Loading States** and error handling

## 🛠️ Tech Stack

### Frontend
- **Next.js 13+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management
- **Lucide React** for icons

### Backend
- **Firebase Authentication** for user management
- **Firestore Database** for data storage
- **Firebase Admin SDK** for server-side operations
- **Next.js API Routes** for backend logic

### Additional Libraries
- **React Toastify** for notifications
- **React Slick** for image carousels
- **UUID** for unique identifiers
- **Formidable** for file uploads

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project with Authentication and Firestore enabled
- Environment variables configured

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KarimAntar/real-estate-project.git
cd real-estate-project
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (Server-side)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

4. **Configure Firebase**
- Enable Authentication (Email/Password and Google)
- Set up Firestore Database
- Configure storage rules
- Download service account key for admin operations

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # Next.js API routes
│   │   └── listings/          # Listing CRUD operations
│   ├── auth/                  # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── dashboard/             # Protected user dashboard
│   │   ├── listings/          # Listing management
│   │   └── profile/           # User profile
│   ├── components/            # Reusable components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx
│   ├── firebase/              # Firebase configuration
│   ├── services/              # API service functions
│   └── types/                 # TypeScript type definitions
├── public/
│   └── uploads/               # Static file uploads
└── data/
    └── listings.ts            # Sample listing data
```

## 🔥 Firebase Setup

### 1. Authentication Setup
```javascript
// Enable in Firebase Console:
// - Email/Password authentication
// - Google authentication
// - Email verification
```

### 2. Firestore Database Structure
```
users/
  {userId}/
    - email: string
    - fullName: string
    - role: "user" | "admin"
    - createdAt: timestamp
    
listings/
  {listingId}/
    - title: string
    - description: string
    - price: number
    - city: string
    - type: string
    - bedrooms: number
    - bathrooms: number
    - area: number
    - images: string[]
    - ownerId: string
    - createdAt: timestamp
    - updatedAt: timestamp
```

### 3. Security Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Listings: owners can CRUD, others can read
    match /listings/{listingId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.ownerId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
    }
  }
}
```

## 🎯 Key Features Guide

### User Registration & Login
1. Users can register with email/password or Google OAuth
2. Email verification required before accessing protected features
3. Password reset functionality available
4. Persistent login with "Remember Me" option

### Property Management
1. **Add Listing**: Fill form with property details and upload images
2. **Edit Listing**: Update existing properties (owners only)
3. **Delete Listing**: Remove properties with confirmation
4. **Image Upload**: Multiple image support with preview

### Admin Features
- Access to all listings across users
- User management capabilities
- Administrative oversight and moderation

### Search & Browse
- Filter by location, property type, and price range
- Category-based browsing
- Detailed property view with image gallery

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Listings
- `GET /api/listings` - Get user listings (or all for admin)
- `POST /api/listings` - Create new listing
- `PUT /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing
- `POST /api/listings/upload` - Upload images

## 🚦 Environment Setup

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Production Deployment

**Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

**Manual Deployment**
```bash
npm run build
npm start
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run with coverage
npm run test:coverage
```

## 📱 Responsive Design

The application is fully responsive and tested on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow existing code style and conventions
- Add proper error handling and validation
- Test on multiple screen sizes
- Update documentation for new features

## 🐛 Known Issues & Roadmap

### Current Limitations
- Images stored in public folder (should migrate to Firebase Storage)
- No pagination for large listing datasets
- Limited search functionality (could add advanced filters)

### Future Enhancements
- [ ] Real-time chat between buyers and sellers
- [ ] Advanced search with map integration
- [ ] Email notifications for new listings
- [ ] Favorites/Wishlist functionality
- [ ] Property comparison feature
- [ ] Mobile app development

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- [Karim Antar](https://github.com/KarimAntar)

## 🙏 Acknowledgments

- Firebase for authentication and database services
- Next.js team for the excellent framework
- Tailwind CSS for utility-first styling
- Unsplash for placeholder images
- React community for amazing libraries

## 📞 Support

If you have any questions or need help with setup, please:
1. Check the [Issues](https://github.com/KarimAntar/real-estate-project/issues) page
2. Create a new issue with detailed description
3. Contact: karimamdou7@gmail.com

---

**⭐ If you found this project helpful, please give it a star!**