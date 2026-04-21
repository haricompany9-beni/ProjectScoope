import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket } from 'lucide-react';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#F8F7FF] text-slate-900 selection:bg-violet-200">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Project<span className="text-violet-600">Scope</span>
            </span>
          </Link>
          <div className="flex gap-4">
            <Link 
              to="/admin" 
              className="text-sm font-medium text-slate-500 hover:text-violet-600 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16 min-h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} ProjectScope. Développé pour les créatifs.
        </div>
      </footer>
    </div>
  );
}
