# Dance Management Application

A modern web application for managing dance classes, students, and instructors built with Next.js, Firebase, and TypeScript.

## 🚀 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Authentication & Database:** [Firebase](https://firebase.google.com/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **Environment Variables:** [Zod](https://zod.dev/) for runtime validation
- **Analytics:** Firebase Analytics
- **Payment Processing:** Stripe/PayPal (Coming soon)
- **Email Service:** SendGrid (Coming soon)
- **SMS Notifications:** Twilio (Coming soon)

## 🏗️ Project Structure

```
dance-app/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.ts       # Environment variables with Zod validation
│   │   └── firebase.ts  # Firebase initialization
│   ├── components/      # React components
│   ├── pages/          # Next.js pages
│   └── styles/         # Global styles
├── public/            # Static files
├── scripts/          # Utility scripts
└── .env.example     # Environment variables template
```

## 🔧 Environment Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```
4. Update the environment variables in `.env.local`
5. Run the development server:
   ```bash
   npm run dev
   ```

## 🔑 Environment Variables

The project uses different environment files for different stages:
- `.env.local` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Required environment variables include:
- Firebase configuration
- Database URLs
- API keys for various services

## 📝 Changelog

### [0.1.0] - 2024-02-19
#### Added
- Initial project setup with Next.js and TypeScript
- Firebase integration with environment configuration
- Environment variable validation using Zod
- Project structure and documentation

## 🚀 Deployment

The application can be deployed to Vercel with environment variables configured in the Vercel dashboard.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email [your-email@example.com](mailto:your-email@example.com) or open an issue in the repository.
