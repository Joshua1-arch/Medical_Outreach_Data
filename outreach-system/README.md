# MedOutreach - Medical Outreach Management System

A comprehensive platform for managing medical outreach events with a strict hierarchical permission system ("Verify then Trust").

## 🚀 Features

- **Strict Permission System**: Users cannot log in until approved by Super Admin
- **Event Approval Workflow**: User-created events require admin approval before data collection
- **Dynamic Form Builder**: Create custom data collection forms for each event
- **Role-Based Access**: Super Admin and User (Sub-Admin) roles
- **Real-time Dashboard**: Track pending approvals and system statistics

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v5
- **Forms**: React Hook Form + Zod
- **UI Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud like MongoDB Atlas)
- npm or yarn package manager

## 🔧 Installation

1. **Clone or navigate to the project**:
   ```bash
   cd outreach-system
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   Update `.env.local` with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/outreach-system
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/outreach-system
   
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-super-secret-key-change-this
   ```

   Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

4. **Seed the Super Admin account**:
   ```bash
   npm run seed-admin
   ```
   
   This creates:
   - Email: `admin@example.com`
   - Password: `securepassword`
   - Role: `admin`
   - Status: `active`

   **⚠️ Change these credentials after first login!**

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   ```
   http://localhost:3000
   ```

## 🎯 User Flows

### For Super Admin (You)

1. **Login** with seeded credentials: `admin@example.com` / `securepassword`
2. Navigate to `/admin` to access:
   - **Dashboard**: View system stats and pending actions
   - **Users**: Approve/Reject pending user registrations
   - **Events**: Approve events created by users
3. **Create Events**: Events you create are auto-approved

### For Users (Sub-Admins)

1. **Sign Up** at `/signup`
2. **Wait for Admin Approval** (you'll see a pending message)
3. Once approved, **Login** at `/login`
4. Access `/dashboard` to:
   - **Create Event**: Define event details and custom form fields
   - **View My Events**: See all your events and their approval status
   - **Enter Data**: For approved events, fill out patient data forms

### Data Collection Workflow

1. User creates an event with custom fields (e.g., "Blood Pressure", "Weight", "Age")
2. Event status is set to `pending`
3. Super Admin reviews and approves the event
4. Once approved, user can access the data entry page
5. User fills out the dynamic form for each patient
6. Records are saved to the database

## 📁 Project Structure

```
outreach-system/
├── app/
│   ├── admin/              # Super Admin portal
│   │   ├── users/          # User management
│   │   ├── events/         # Event approval
│   │   ├── actions.ts      # Server actions
│   │   └── page.tsx        # Dashboard
│   ├── dashboard/          # User portal
│   │   ├── create-event/   # Event creation
│   │   ├── my-events/      # Event listing
│   │   └── actions.ts      # Server actions
│   ├── events/
│   │   └── [id]/enter-data/  # Dynamic data entry
│   ├── api/auth/
│   │   ├── [...nextauth]/  # NextAuth routes
│   │   └── register/       # Signup API
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── page.tsx            # Landing page
├── lib/
│   └── db.ts               # MongoDB connection
├── models/
│   ├── User.ts             # User schema
│   ├── Event.ts            # Event schema
│   └── Record.ts           # Record schema
├── scripts/
│   └── seed-admin.ts       # Admin seeding script
├── types/
│   └── next-auth.d.ts      # NextAuth type definitions
├── auth.ts                 # NextAuth config
├── auth.config.ts          # Auth Edge config
├── middleware.ts           # Route protection
├── .env.local              # Environment variables
```

## 🖼️ Cloudinary Setup (For Image Uploads)

1. **Create Account**: Sign up at [Cloudinary](https://cloudinary.com).
2. **Get Cloud Name**: Found on your Dashboard (e.g., `ddx8s...` or `demo`).
3. **Enable Unsigned Uploads**:
   - Go to **Settings > Upload**.
   - Scroll to **Upload presets**.
   - Add new preset named: `med_outreach_unsigned`.
   - Set **Signing Mode** to **Unsigned**.
   - Save.
4. **Environment Variable**:
   - Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name` to `.env.local`.
   - **Restart your server** after adding this.

## 🔑 Key Concepts

### Verify then Trust Philosophy

1. **User Registration**: Anyone can sign up, but `accountStatus` defaults to `pending`
2. **Login Gate**: The `authorize` function checks if `accountStatus === 'active'`
3. **Event Approval**: User-created events have `status: 'pending'` until admin approves
4. **Auto-Approval**: Admin-created events are automatically `status: 'approved'`

### Database Models

**User**:
- `name`, `email`, `password` (hashed)
- `role`: 'admin' | 'user'
- `accountStatus`: 'pending' | 'active' | 'rejected'

**Event**:
- `title`, `description`, `date`, `location`
- `createdBy`: Reference to User
- `status`: 'pending' | 'approved'
- `formFields`: Array of dynamic field definitions

**Record**:
- `eventId`: Reference to Event
- `data`: Object (key-value pairs of collected data)
- `recordedBy`: Reference to User

## 🧪 Testing the Flow

1. **Seed the admin** (if not done):
   ```bash
   npm run seed-admin
   ```

2. **Login as admin**:
   - Go to `/login`
   - Use: `admin@example.com` / `securepassword`

3. **Create a test user**:
   - Open incognito window
   - Go to `/signup`
   - Register: John Doe / johndoe@example.com / password123

4. **Approve the user**:
   - Back in admin window, go to `/admin/users`
   - Click the green ✓ button next to John Doe

5. **Login as user**:
   - In incognito, go to `/login`
   - Use: johndoe@example.com / password123

6. **Create an event**:
   - Click "Create Event"
   - Fill in event details
   - Add custom fields (e.g., "Patient Name", "Blood Pressure", "Weight")
   - Submit

7. **Approve the event**:
   - Admin window, go to `/admin/events`
   - Click "Approve Event"

8. **Enter data**:
   - In user window, go to "My Events"
   - Click "Enter Data"
   - Fill out the form multiple times for different patients

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project on Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
4. Deploy!

### Other Platforms

Ensure your platform supports:
- Node.js 18+
- Environment variables
- MongoDB connection

## 🔒 Security Notes

- Always change the default admin credentials after setup
- Use a strong `NEXTAUTH_SECRET` in production
- Enable MongoDB authentication in production
- Consider adding rate limiting for API routes
- Implement HTTPS in production

## 📝 License

This project is for educational purposes.

## 🤝 Support

For issues or questions, refer to the documentation or create an issue in the repository.

---

**Built with ❤️ for healthcare professionals**
