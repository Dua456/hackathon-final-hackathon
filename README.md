# Hackathon Dashboard

A comprehensive dashboard for hackathon participants to volunteer, report issues, and manage lost & found items, with a dedicated admin panel for management.

## Features

- **Authentication**: Google and email/password authentication
- **Volunteer Registration**: Sign up to volunteer with skills and availability
- **Issue Reporting**: Submit complaints about facilities (electricity, water, internet, etc.) with optional image URLs
- **Lost & Found**: Report lost items or items you've found (with optional image URLs)
- **Dashboard Overview**: View statistics and recent activity
- **Admin Dashboard**: Comprehensive admin panel for managing users, events, and complaints

## Admin Dashboard

The admin dashboard includes:

- **Dashboard Overview**: Statistics and quick insights
- **User Management**: Manage all users in the system
- **Event Management**: Create, update, and manage hackathons and events
- **Complaint Management**: Handle and resolve complaints from users

### Admin Access

To access the admin dashboard:
1. Register or log in with an account
2. Accounts with 'admin' in the email address will automatically have admin privileges
3. Navigate to `/admin` to access the admin panel

### Available Routes

- `/` - Landing page
- `/login` - Regular user login
- `/signup` - User registration
- `/admin-login` - Admin login (same as regular login for demo)
- `/dashboard` - User dashboard
- `/admin` - Admin dashboard (requires admin privileges)
- `/admin/users` - Admin user management
- `/admin/events` - Admin event management
- `/admin/complaints` - Admin complaint management

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Firebase (Authentication, Firestore, Storage)
- React Router DOM
- Lucide React (icons)
- Sonner (notifications)
- Framer Motion (animations)

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Firebase Configuration

The app uses the following Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAZm0KFtIfp82G6ZUnf4TC_5q_2S0Acb-g",
  authDomain: "hackathon-dashboard-e5d9c.firebaseapp.com",
  projectId: "hackathon-dashboard-e5d9c",
  storageBucket: "hackathon-dashboard-e5d9c.firebasestorage.app",
  messagingSenderId: "431732155787",
  appId: "1:431732155787:web:0cfc3cca310b1c3bdc3b8e",
  measurementId: "G-R8X0037D2L"
};
```

## Folder Structure

```
src/
├── components/         # Reusable UI components
├── context/           # Authentication context
├── firebase.js       # Firebase configuration
├── pages/            # Page components
├── App.jsx          # Main application router
└── main.jsx         # Entry point
```

## Image Handling

The application now supports URL-based image inputs instead of file uploads:
- Forms accept image URLs in the format `https://example.com/image.jpg`
- Images are displayed directly from the provided URLs
- No file upload or storage functionality is required

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build