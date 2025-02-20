# Dance Management Application

A modern web application for managing dance classes, students, and instructors built with Next.js, Firebase, and TypeScript.

## 🚀 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) with multiple providers
- **Database:** [Firebase](https://firebase.google.com/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **Form Validation:** [Zod](https://zod.dev/)
- **Analytics:** Firebase Analytics
- **Email Service:** SendGrid
- **Charts:** Chart.js with react-chartjs-2

## 🌟 Features

### Authentication & Authorization
- Multi-provider authentication (Google, Facebook, Apple)
- Role-based access control (Admin, Teacher, Student)
- Protected routes and role-based components
- Session management and persistence

### Class Management
- Class creation and scheduling
- Student enrollment system
- Attendance tracking
- Progress monitoring with visual charts
- Email notifications for class updates

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
- Attendance updates
- Class schedule changes
- Automated reminders

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

4. Configure authentication providers:
   - Set up projects in Google Cloud Console
   - Configure Facebook Developer App
   - Set up Apple Developer Account

5. Update environment variables with your credentials

6. Run the development server:
   ```bash
   npm run dev
   ```

## 📚 Documentation

### Environment Variables

Required environment variables include:

- `NEXT_PUBLIC_APP_URL`: Application URL
- `NEXT_PUBLIC_FIREBASE_*`: Firebase configuration
- `NEXTAUTH_URL`: NextAuth.js URL
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `SENDGRID_API_KEY`: SendGrid API key
- `DATABASE_URL`: Database connection string

### Authentication Flow

1. Users can sign in using:
   - Google account
   - Facebook account
   - Apple ID

2. Upon first sign-in:
   - User record is created
   - Default role is assigned
   - Welcome email is sent

3. Session management:
   - JWT-based authentication
   - 30-day session duration
   - Automatic token refresh

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
