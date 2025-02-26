'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();

  const danceStyles = [
    'Ballet',
    'Contemporary',
    'Hip Hop',
    'Jazz',
    'Ballroom',
    'Salsa',
    'Tap',
    'Breakdancing',
  ];

  const features = [
    {
      title: 'Expert Instructors',
      description: 'Learn from professional dancers with years of experience.',
      icon: '👨‍🏫',
    },
    {
      title: 'Diverse Classes',
      description: 'Choose from a wide range of dance styles and skill levels.',
      icon: '💃',
    },
    {
      title: 'Flexible Schedule',
      description: 'Find classes that fit your busy lifestyle.',
      icon: '📅',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-20 text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            Dance Your Way to Excellence
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-2xl mx-auto">
            Join our vibrant dance community and learn from expert instructors in a supportive environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/classes"
              className="inline-block bg-white text-indigo-600 text-lg px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              Explore Classes
            </Link>
            {!user && (
              <Link
                href="/auth/signin"
                className="inline-block border-2 border-white text-white text-lg px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Studio?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of professional instruction, community, and passion for dance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dance Styles Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Popular Dance Styles
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover your perfect dance style from our diverse selection of classes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {danceStyles.map((style, index) => (
              <Link
                key={index}
                href={`/classes?style=${style.toLowerCase()}`}
                className="group relative h-64 overflow-hidden rounded-lg bg-gray-200"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-xl font-semibold text-white">{style}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              Ready to Start Your Dance Journey?
            </h2>
            <Link
              href="/auth/signin"
              className="inline-block bg-white text-indigo-600 text-lg px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              Join Now
            </Link>
          </div>
        </section>
      )}
    </div>
  );
} 