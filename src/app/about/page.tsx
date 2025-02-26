import { generateMetadata } from '@/components/SEO';
import Image from 'next/image';

export const metadata = generateMetadata({
  title: 'About Us',
  description: 'Learn about our dance studio, our mission, and our passionate team of instructors.',
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              About Our Studio
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              We're passionate about bringing the joy of dance to everyone, fostering creativity,
              and building a supportive community of dancers.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                Our mission is to create an inclusive environment where dancers of all levels can
                explore their passion, develop their skills, and express themselves through movement.
              </p>
              <p className="text-lg text-gray-600">
                We believe that dance is not just about learning steps; it's about building
                confidence, fostering creativity, and creating lasting connections within our
                community.
              </p>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-indigo-600/20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Excellence',
                description: 'We strive for excellence in everything we do, from instruction to student support.',
              },
              {
                title: 'Inclusivity',
                description: 'We welcome dancers of all backgrounds, ages, and skill levels.',
              },
              {
                title: 'Community',
                description: 'We foster a supportive environment where dancers can grow together.',
              },
            ].map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Team</h2>
            <p className="mt-4 text-xl text-gray-600">
              Meet our passionate instructors who bring years of experience and dedication.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Ballet Instructor',
                experience: '15+ years of experience',
              },
              {
                name: 'Michael Chen',
                role: 'Hip Hop Instructor',
                experience: '10+ years of experience',
              },
              {
                name: 'Elena Rodriguez',
                role: 'Contemporary Dance Instructor',
                experience: '12+ years of experience',
              },
            ].map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                <p className="text-indigo-600 mb-2">{member.role}</p>
                <p className="text-gray-600">{member.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600/20"></div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our History</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2010, our studio has grown from a small community dance space
                to a premier dance education center. Over the years, we've helped thousands
                of students discover their passion for dance.
              </p>
              <p className="text-lg text-gray-600">
                Today, we continue to expand our programs and embrace new dance styles
                while maintaining our commitment to quality instruction and personal attention
                to each student.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 