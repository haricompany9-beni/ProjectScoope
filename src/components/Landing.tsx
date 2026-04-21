import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Globe, Smartphone, ArrowRight } from 'lucide-react';

export function Landing() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <span className="inline-block py-1 px-3 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold mb-4">
          Nouveau projet
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Décrivez votre projet <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 font-black">
            en 5 minutes.
          </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Prêt à lancer votre idée ? Répondez à quelques questions clés et recevez un brief professionnel instantanément.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card 
          to="/step/website" 
          icon={<Globe className="w-10 h-10" />}
          title="Site Web"
          description="Vitrines, E-commerce, SaaS ou Blogs. On s'occupe de votre présence en ligne."
          color="bg-blue-500"
        />
        <Card 
          to="/step/mobile" 
          icon={<Smartphone className="w-10 h-10" />}
          title="Application Mobile"
          description="iOS, Android ou les deux. Transformez vos idées en apps addictives."
          color="bg-violet-600"
        />
      </div>
    </div>
  );
}

function Card({ to, icon, title, description, color }: any) {
  return (
    <Link to={to} className="group">
      <motion.div 
        whileHover={{ y: -5 }}
        className="h-full p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 relative overflow-hidden"
      >
        <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center gap-2 font-bold text-violet-600">
          Commencer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-600/5 blur-3xl rounded-full" />
      </motion.div>
    </Link>
  );
}
