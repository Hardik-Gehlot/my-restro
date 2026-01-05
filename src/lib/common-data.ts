import { Clock, Globe, Store,Wifi } from 'lucide-react';

export const featuresSection = {
  heading: 'Why Choose MenuDigital?',
  subHeading: 'Everything you need to take your restaurant online',
  items: [
    {
      title: 'Quick Setup',
      description: 'Get online in minutes with our easy setup process',
      icon: Clock,
    },
    {
      title: 'QR Code Access',
      description: 'Contactless menu viewing for modern dining',
      icon: Globe,
    },
    {
      title: 'Easy Management',
      description: 'Update your menu anytime, anywhere',
      icon: Store,
    },
    {
      title: 'NFC Integration',
      description:
        'Allow customers to access your digital menu instantly with a simple NFC tap',
      icon: Wifi,
    },
  ],
};

export const pricingSection = {
  heading: 'Simple, Affordable Pricing',
  subHeading: 'Everything you need to digitize your restaurant',

  plans: [
    {
      id: 'complete',
      name: 'Complete Package',
      price: '₹1,999/yr',
      originalPrice: '₹2,999/yr',
      badge: 'Most Popular',
      description: 'Best value for growing restaurants',
      features: [
        'Unlimited products and menu items',
        'Management dashboard with analytics',
        'Personal website portfolio',
        'Digital menu with QR code',
        'Mobile-responsive design',
        'Real-time menu updates',
        'Free setup and training',
      ],
      ctaText: 'Get Started Now',
    }
  ],
};


  const whatsappNumber = "919096706395";
  const whatsappMessage = "Hi! I'm interested in getting a digital menu for my restaurant.";
 export const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;