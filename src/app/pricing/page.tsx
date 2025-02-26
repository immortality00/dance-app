import Link from 'next/link';
import { generateMetadata } from '@/components/SEO';

export const metadata = generateMetadata({
  title: 'Pricing & Plans',
  description: 'Explore our flexible pricing plans and class packages for dance lessons.',
});

const plans = [
  {
    name: 'Basic',
    price: 49,
    period: 'month',
    description: 'Perfect for beginners who want to try out different dance styles.',
    features: [
      '2 classes per week',
      'Access to basic dance styles',
      'Online class booking',
      'Basic progress tracking',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: 89,
    period: 'month',
    description: 'Ideal for dedicated dancers who want to improve their skills.',
    features: [
      'Unlimited classes',
      'Access to all dance styles',
      'Priority booking',
      'Advanced progress tracking',
      'Personal instructor feedback',
      '1 private lesson per month',
    ],
    cta: 'Go Pro',
    popular: true,
  },
  {
    name: 'Elite',
    price: 149,
    period: 'month',
    description: 'For serious dancers aiming for excellence.',
    features: [
      'Everything in Pro plan',
      '3 private lessons per month',
      'Competition preparation',
      'Performance opportunities',
      'Choreography workshops',
      'Studio rental discounts',
    ],
    cta: 'Join Elite',
    popular: false,
  },
];

const packages = [
  {
    name: 'Single Class',
    price: 25,
    description: 'Try any dance class once',
  },
  {
    name: '5 Class Pack',
    price: 110,
    description: 'Save $15 on 5 classes',
  },
  {
    name: '10 Class Pack',
    price: 200,
    description: 'Save $50 on 10 classes',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Choose the plan that best fits your dance journey.
            </p>
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-lg shadow-lg overflow-hidden ${
                  plan.popular ? 'border-2 border-indigo-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-sm">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="mt-4 text-gray-600">{plan.description}</p>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="ml-3 text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/signin"
                    className={`mt-8 block w-full text-center px-6 py-3 rounded-md text-white font-medium ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gray-800 hover:bg-gray-900'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Class Packages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Class Packages</h2>
            <p className="mt-4 text-xl text-gray-600">
              Flexible options for occasional dancers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">${pkg.price}</span>
                </div>
                <p className="mt-4 text-gray-600">{pkg.description}</p>
                <Link
                  href="/auth/signin"
                  className="mt-6 block w-full text-center px-6 py-3 rounded-md text-white font-medium bg-gray-800 hover:bg-gray-900"
                >
                  Buy Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: 'Can I switch between plans?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.',
              },
              {
                question: 'Are there any contracts or commitments?',
                answer: 'No long-term contracts. All plans are month-to-month and you can cancel anytime.',
              },
              {
                question: 'Do class packages expire?',
                answer: 'Class packages are valid for 6 months from the date of purchase.',
              },
              {
                question: 'Can I share my membership with others?',
                answer: 'Memberships are non-transferable and for individual use only.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Dance Journey?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join our community of dancers today.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
} 