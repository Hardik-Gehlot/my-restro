import Link from 'next/link';
import { FiAward } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                <FiAward className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">MyRestro</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your gateway to amazing dining experiences.
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
              <li><Link href="/#features" className="hover:text-orange-400 transition-colors">Features</Link></li>
              <li><Link href="/#contact" className="hover:text-orange-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-4">For Business</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/admin/login" className="hover:text-orange-400 transition-colors">Restaurant Login</Link></li>
              <li><Link href="/#advertise" className="hover:text-orange-400 transition-colors">Advertise</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-4">Legal</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 MyRestro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}