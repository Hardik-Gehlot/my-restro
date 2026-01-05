'use client'
import { useState } from 'react';
import { Menu, X, ChevronRight, Check } from 'lucide-react';
import { featuresSection,whatsappLink,pricingSection } from '@/lib/common-data';
export default function DigitalMenuLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl sm:text-2xl font-bold text-orange-600 cursor-pointer" onClick={() => scrollToSection('home')}>
              DineOnline
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2"
            >
              {isMenuOpen ? <X size={24} className='text-black' /> : <Menu size={24} className='text-black' />}
            </button>

            {/* Desktop menu */}
            <div className="hidden sm:flex space-x-8">
              <button
                onClick={() => scrollToSection('home')}
                className="text-gray-700 hover:text-orange-600 transition"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-orange-600 transition"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-gray-700 hover:text-orange-600 transition"
              >
                Pricing
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="sm:hidden py-4 space-y-3 border-t">
              <button
                onClick={() => scrollToSection('home')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50"
              >
                Pricing
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="pt-40 pb-16 px-4 sm:px-6 bg-linear-to-b from-orange-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Scan, Explore, Order.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 px-4">
              Transform your restaurant with a modern digital menu. Let customers browse your offerings seamlessly with just a scan. No apps, no hassle—just instant access to your complete menu.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition shadow-lg hover:shadow-xl"
            >
              Get Your Digital Menu
              <ChevronRight className="ml-2" size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {featuresSection.heading}
          </h2>
          <p className="text-lg text-gray-600">
            {featuresSection.subHeading}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresSection.items.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="text-center p-6 bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-orange-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {pricingSection.heading}
          </h2>
          <p className="text-lg text-gray-600">
            {pricingSection.subHeading}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {pricingSection.plans.map((plan) => (
            <div
              key={plan.id}
              className= 'bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-orange-300 scale-105'
            >
              <div
                className='px-8 py-6 bg-orange-200 text-black'
              >
                <span className="text-sm font-semibold uppercase">
                  {plan.badge}
                </span>
                <h3 className="text-2xl font-bold mt-2">{plan.name}</h3>
                <p className="mt-1 text-sm opacity-80">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="line-through opacity-70">
                    {plan.originalPrice}
                  </span>
                </div>
                <p className="mt-2 text-sm opacity-80">
                  One-time payment
                </p>
              </div>

              <div className="px-8 py-8">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check
                        className="text-green-500 mr-3 mt-1 flex-shrink-0"
                        size={20}
                      />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='mt-8 w-full flex items-center justify-center px-6 py-4 font-semibold rounded-lg transition shadow-lg hover:shadow-xl bg-orange-600 text-white hover:bg-orange-700'
                >
                  {plan.ctaText}
                  <ChevronRight className="ml-2" size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-orange-500 mb-4">DineOnline</h3>
              <p className="text-gray-400">
                Bringing restaurants online with modern digital menu solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => scrollToSection('home')} className="hover:text-orange-500 transition">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-orange-500 transition">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="hover:text-orange-500 transition">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-gray-400 hover:text-orange-500 transition"
              >
                WhatsApp
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} DineDigital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}