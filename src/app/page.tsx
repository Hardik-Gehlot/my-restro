'use client'
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Icons } from '@/lib/icons';
import { featuresSection, whatsappLink, pricingSection, WEBSITE_DETAILS } from '@/lib/common-data';

export default function DigitalMenuLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effect for hero section
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const WebsiteIcon = WEBSITE_DETAILS.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-r from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-lg shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => scrollToSection('home')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <WebsiteIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {WEBSITE_DETAILS.name}
              </span>
            </motion.div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-orange-100 transition-colors"
            >
              {isMenuOpen ? (
                <Icons.X size={24} className="text-gray-800" />
              ) : (
                <Icons.Menu size={24} className="text-gray-800" />
              )}
            </button>

            {/* Desktop menu */}
            <div className="hidden sm:flex items-center space-x-1">
              {['Home', 'Features', 'Pricing'].map((item) => (
                <motion.button
                  key={item}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all"
                >
                  {item}
                </motion.button>
              ))}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </motion.a>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="sm:hidden py-4 space-y-2 border-t bg-white/90 backdrop-blur-lg rounded-b-2xl"
            >
              {['Home', 'Features', 'Pricing'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-all"
                >
                  {item}
                </button>
              ))}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block mx-4 py-3 text-center bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl"
              >
                Get Started
              </a>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-4 sm:px-6 min-h-[90vh] flex items-center">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-6xl mx-auto w-full">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-8"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-orange-700">Trusted by 100+ restaurants</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text text-transparent">
                Scan. Explore.
              </span>
              <br />
              <span className="text-gray-800">Order.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              Transform your restaurant with a modern digital menu. Let customers browse your offerings
              seamlessly with just a scan. No apps, no hassle—just instant access.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.a
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(249, 115, 22, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-xl transition-all"
              >
                Get Your Digital Menu
                <Icons.ChevronRight className="ml-2" size={20} />
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('features')}
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-orange-300 shadow-lg transition-all"
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { value: '100+', label: 'Restaurants' },
                { value: '50K+', label: 'Menu Views' },
                { value: '4.9★', label: 'Rating' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-orange-500 rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {featuresSection.heading}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {featuresSection.subHeading}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuresSection.items.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="group relative p-8 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                    >
                      <Icon className="text-white" size={28} />
                    </motion.div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-orange-50 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {pricingSection.heading}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {pricingSection.subHeading}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {pricingSection.plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={!plan.comingSoon ? { y: -8 } : {}}
                className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
                  plan.isPopular
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-2xl scale-105 z-10'
                    : 'bg-white shadow-xl border border-gray-100'
                } ${plan.comingSoon ? 'opacity-80' : ''}`}
              >
                {/* Popular badge */}
                {plan.isPopular && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Coming Soon badge */}
                {plan.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${plan.isPopular ? 'text-white/80' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  {!plan.comingSoon ? (
                    <div className="mb-8">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>
                          {plan.price}
                        </span>
                        {plan.originalPrice && (
                          <span className={`line-through ${plan.isPopular ? 'text-white/60' : 'text-gray-400'}`}>
                            {plan.originalPrice}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${plan.isPopular ? 'text-white/70' : 'text-gray-500'}`}>
                        One-time payment
                      </p>
                    </div>
                  ) : (
                    <div className="mb-8 h-16 flex items-center">
                      <span className="text-gray-400 text-lg font-medium">Price coming soon</span>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Icons.Check
                          className={`mt-0.5 flex-shrink-0 ${
                            plan.isPopular ? 'text-white' : 'text-green-500'
                          }`}
                          size={18}
                        />
                        <span className={plan.isPopular ? 'text-white/90' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.a
                    whileHover={!plan.comingSoon ? { scale: 1.03 } : {}}
                    whileTap={!plan.comingSoon ? { scale: 0.97 } : {}}
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-4 text-center font-bold rounded-xl transition-all ${
                      plan.isPopular
                        ? 'bg-white text-orange-600 hover:bg-orange-50 shadow-lg'
                        : plan.comingSoon
                        ? 'bg-gray-100 text-gray-500 cursor-default'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {plan.ctaText}
                    {!plan.comingSoon && <Icons.ChevronRight className="inline ml-1" size={18} />}
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <WebsiteIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">{WEBSITE_DETAILS.name}</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Bringing restaurants online with modern digital menu solutions. Simple, affordable, effective.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <button
                    onClick={() => scrollToSection('home')}
                    className="hover:text-orange-500 transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="hover:text-orange-500 transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="hover:text-orange-500 transition-colors"
                  >
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Get In Touch</h4>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold transition-all"
              >
                <Icons.Phone size={18} />
                Chat on WhatsApp
              </motion.a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>© {new Date().getFullYear()} {WEBSITE_DETAILS.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}