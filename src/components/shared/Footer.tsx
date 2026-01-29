import { Icons } from "@/lib/icons";
import { WEBSITE_DETAILS } from "@/lib/common-data";

export default function Footer() {
  return (
      <footer className="bg-white/30 backdrop-blur-md border-t border-white/60 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center gap-2 text-center">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 text-2xl font-semibold text-gray-800">
            <Icons.Store className="text-3xl text-orange-500" />
            <span>{WEBSITE_DETAILS.name}</span>
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent my-1" />

          {/* Copyright */}
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} {WEBSITE_DETAILS.name}. All rights reserved.
          </p>

          {/* Contact Developer */}
          <button
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors hover:scale-105"
            onClick={() => window.location.href = "mailto:developer@dineonline.com"}
          >
            Contact Developer
          </button>
        </div>
      </footer>
  );
}