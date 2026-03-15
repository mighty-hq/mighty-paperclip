import React, { ReactNode } from 'react';
import { Link } from '../utils/useNavigation';
import { Command, Github } from 'lucide-react';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Navigation */}
      <nav className="border-white/10 border-b bg-black/20 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-semibold text-white text-xl">
              <Command className="h-6 w-6" />
              Mighty Shortcut
            </Link>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <Link
                to="/dashboard"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-20 border-white/10 border-t bg-black/20 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="text-center text-gray-400 text-sm">
            © 2025 Mighty Shortcut. Built with React, TypeScript & FastAPI.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
