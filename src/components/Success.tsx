import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Home, ArrowRight } from 'lucide-react';

export function Success() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Projet envoyé ! ✅
        </h1>
        <p className="text-lg text-slate-600 mb-12">
          Merci ! Nous avons bien reçu vos informations. Nous étudierons votre brief et reviendrons vers vous sous 48h.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Imprimer mon brief
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
