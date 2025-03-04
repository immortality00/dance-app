# Dance Management Application

A modern web application for managing dance classes, students, instructors, and studio rentals built with Next.js, Firebase, and TypeScript.

**Important Note:**
Trying to create the app with AI is too slow because the AI is not smart enough to process the instructions, discover bugs or fix them yet... and it takes multiple attempts to finally find the solution... and it keeps fixing parts of the errors and ignores the rest.

## 🚀 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database:** [Firebase](https://firebase.google.com/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **Form Validation:** [Zod](https://zod.dev/)
- **Analytics:** Firebase Analytics
- **Email Service:** SendGrid
- **Charts:** Chart.js with react-chartjs-2
- **AI Integration:** OpenAI GPT-3.5 for smart recommendations
- **Payment Processing:** [Nomod](https://nomod.com/) for secure payments
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/)

## 🌟 Features

### Authentication & Authorization
- Firebase Authentication with email/password
- Persistent authentication state with cookies
- Role-based access control (Admin, Teacher, Student)
- Protected routes with middleware
- Intelligent navigation handling:
  - Maintains user context on public pages
  - Smart redirection after sign-out
  - Automatic redirection for protected routes
- Real-time user profile updates
- Session management with secure token handling

### Class Management
- Class creation and scheduling
- Student enrollment with integrated payments
- Attendance tracking
- Progress monitoring with visual charts
- Email notifications for class updates
- Real-time availability checking
- Automated booking confirmation

### Payment Integration
- Secure payment processing with Nomod
- Deep linking for seamless payment flow
- Transaction history tracking
- Automatic enrollment after payment
- Payment status verification
- Failed payment handling
- Email receipts and confirmations

### Studio Rental System
- Calendar-based studio booking
- Real-time availability checking
- AI-powered booking recommendations
- Automated conflict prevention
- Email confirmations for bookings

### User Management
- User role management
- Student progress tracking
- Teacher performance analytics
- Profile management

### Analytics & Reporting
- Attendance statistics
- Class popularity metrics
- Revenue tracking
- Student engagement analytics

### Email Notifications
- Class enrollment confirmations
- Payment receipts
- Attendance updates
- Class schedule changes
- Automated reminders
- Studio booking confirmations

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dance-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure required environment variables in `.env.local`:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # OpenAI Configuration (for AI recommendations)
   OPENAI_API_KEY=your_openai_api_key

   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Email Service
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_FROM_EMAIL=your_verified_sender_email

   # Payment Processing
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication with desired providers
   - Set up Firestore database
   - Add Firebase Admin SDK credentials

6. Initialize the database with sample data:
   ```bash
   npm run seed:classes
   npm run seed:financial
   ```

7. Run the development server:
   ```bash
   npm run dev
   ```

## 📚 Documentation

### Payment Flow

1. **Booking Initiation:**
   - User selects a class and clicks "Book Now"
   - System checks availability and enrollment status
   - Generates Nomod payment deep link

2. **Payment Processing:**
   - User is redirected to Nomod payment interface
   - Secure payment processing
   - Automatic redirect back to application

3. **Booking Confirmation:**
   - System verifies payment success
   - Updates class enrollment
   - Sends confirmation email
   - Records transaction in database

4. **Error Handling:**
   - Failed payments are logged
   - User-friendly error messages
   - Automatic booking reversal if needed
   - Email notifications for issues

### Environment Variables

Required environment variables include:

- `NEXT_PUBLIC_APP_URL`: Application URL
- `NEXT_PUBLIC_FIREBASE_*`: Firebase configuration
- `OPENAI_API_KEY`: OpenAI API key for AI recommendations
- `NEXTAUTH_URL`: NextAuth.js URL
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `SENDGRID_API_KEY`: SendGrid API key
- `DATABASE_URL`: Database connection string

### Authentication Flow

1. Users can sign in using:
   - Email and password
   - (Coming soon: Google, Facebook, Apple ID)

2. Upon first sign-in:
   - User record is created in Firebase
   - Default role is assigned (student)
   - Authentication token is securely stored
   - Welcome email is sent

3. Session management:
   - Firebase token-based authentication
   - 7-day token expiration
   - Secure cookie storage
   - Automatic token refresh
   - Cross-tab synchronization

4. Sign-out behavior:
   - Intelligent redirection based on current page
   - Stays on public pages
   - Redirects to homepage from protected routes
   - Cleans up authentication state
   - Removes secure cookies

### Studio Rental System

1. Booking Process:
   - Select date and time slot
   - Real-time availability check
   - AI-powered recommendations
   - Instant booking confirmation

2. AI Recommendations:
   - Based on user's booking history
   - Considers popular time slots
   - Suggests optimal booking times
   - Uses OpenAI GPT-3.5

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email [hussain.marzooq.bh@icloud.com](mailto:hussain.marzooq.bh@icloud.com) or open an issue in the repository.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.