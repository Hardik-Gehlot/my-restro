import { Icons } from './icons';

export const WEBSITE_DETAILS = {
  name: 'Parivesha',
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
      id: 'menu',
      name: 'Menu',
      price: '₹1,899/yr',
      originalPrice: '₹2,999/yr',
      badge: 'Most Popular',
      description: 'Perfect for restaurants getting started with digital menus',
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
      isPopular: true,
      comingSoon: false,
    },
    {
      id: 'order',
      name: 'Order',
      price: '',
      originalPrice: '',
      badge: 'Coming Soon',
      description: 'Enable customers to order directly via WhatsApp',
      features: [
        'Everything in Menu plan',
        'WhatsApp ordering integration',
        'Order notifications on WhatsApp',
        'Customer messaging support',
        'Order history tracking',
        'Direct customer communication',
      ],
      ctaText: 'Contact Us',
      isPopular: false,
      comingSoon: true,
    },
    {
      id: 'grow',
      name: 'Grow',
      price: '',
      originalPrice: '',
      badge: 'Coming Soon',
      description: 'Grow your business with coupons & loyalty programs',
      features: [
        'Everything in Order plan',
        'Create discount coupons for customers',
        'Customer loyalty program tools',
        'Advanced analytics dashboard',
        'Priority customer support',
        'Social media integration',
      ],
      ctaText: 'Contact Us',
      isPopular: false,
      comingSoon: true,
    },
  ],
};


const whatsappNumber = "919096706395";
const whatsappMessage = "Hi! I'm interested in getting a digital menu for my restaurant.";
export const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

export const RESTAURANT_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
export const JWT_EXPIRY = 24 * 60 * 60 * 1000; //one day

