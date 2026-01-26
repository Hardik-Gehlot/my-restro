import { Icons } from './icons';

export const WEBSITE_DETAILS = {
  name: 'MenuDigital',
  icon: Icons.Store
};

export const featuresSection = {
  heading: `Why Choose ${WEBSITE_DETAILS.name}?`,
  subHeading: 'Everything you need to take your restaurant online',
  items: [
    {
      title: 'Quick Setup',
      description: 'Get online in minutes with our easy setup process',
      icon: Icons.Clock,
    },
    {
      title: 'QR Code Access',
      description: 'Contactless menu viewing for modern dining',
      icon: Icons.Globe,
    },
    {
      title: 'Easy Management',
      description: 'Update your menu anytime, anywhere',
      icon: Icons.Store,
    },
    {
      title: 'NFC Integration',
      description:
        'Allow customers to access your digital menu instantly with a simple NFC tap',
      icon: Icons.Wifi,
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

export const RESTAURANT_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
export const JWT_EXPIRY = 24 * 60 * 60 * 1000; //one day
 
