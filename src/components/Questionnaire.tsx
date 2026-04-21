import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Send, Check } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { ProjectType, Question } from '../types';

const WEB_QUESTIONS: Question[] = [
  { id: '1', text: 'Quel est le nom de votre entreprise ou projet ?', type: 'text', field: 'projectName' },
  { id: '2', text: 'Décrivez votre activité en quelques mots', type: 'textarea', field: 'description' },
  { id: '3', text: 'Quel est l\'objectif principal du site ?', type: 'select', options: ['Vitrine', 'E-commerce', 'Blog', 'Portfolio', 'SaaS', 'Autre'], field: 'goals' },
  { id: '4', text: 'Avez-vous déjà un site existant ? (URL si oui)', type: 'text', field: 'existingSolution' },
  { id: '5', text: 'Qui est votre cible ?', type: 'radio', options: ['Particuliers (B2C)', 'Entreprises (B2B)', 'Les deux'], field: 'targetAudience' },
  { id: '6', text: 'Quelles pages souhaitez-vous ?', type: 'multiselect', options: ['Accueil', 'À propos', 'Services', 'Blog', 'Contact', 'Boutique', 'Espace client'], field: 'pagesOrFeatures' },
  { id: '7', text: 'Avez-vous un logo et une charte graphique ?', type: 'radio', options: ['Oui', 'Non', 'À créer'], field: 'brandingStatus' },
  { id: '8', text: 'Avez-vous des sites de référence qui vous inspirent ?', type: 'textarea', field: 'references' },
  { id: '9', text: 'Quelles fonctionnalités souhaitez-vous ?', type: 'multiselect', options: ['Formulaire de contact', 'Chat en direct', 'Paiement en ligne', 'Réservation', 'Espace membre', 'Multilingue'], field: 'specificNeeds' },
  { id: '10', text: 'Quel est votre budget estimé ?', type: 'select', options: ['< 500$', '500–1500$', '1500–5000$', '+5000$', 'À discuter'], field: 'budget' },
  { id: '11', text: 'Quel est votre délai souhaité ?', type: 'text', field: 'deadline' },
  { id: '12', text: 'Informations de contact (Nom)', type: 'text', field: 'contact', subField: 'name' },
  { id: '13', text: 'Informations de contact (Email)', type: 'text', field: 'contact', subField: 'email' },
  { id: '14', text: 'Informations de contact (Téléphone)', type: 'text', field: 'contact', subField: 'phone' },
];

const MOBILE_QUESTIONS: Question[] = [
  { id: '1', text: 'Quel est le nom de votre projet ou startup ?', type: 'text', field: 'projectName' },
  { id: '2', text: 'Décrivez l\'idée de votre application en quelques mots', type: 'textarea', field: 'description' },
  { id: '3', text: 'Quel problème votre app résout-elle ?', type: 'textarea', field: 'goals' },
  { id: '4', text: 'Sur quelle plateforme souhaitez-vous lancer ?', type: 'radio', options: ['iOS', 'Android', 'Les deux'], field: 'platform' },
  { id: '5', text: 'Avez-vous déjà une app existante ? (Lien si oui)', type: 'text', field: 'existingSolution' },
  { id: '6', text: 'Qui sont vos utilisateurs cibles ?', type: 'textarea', field: 'targetAudience' },
  { id: '7', text: 'Citez les fonctionnalités principales indispensables', type: 'textarea', field: 'pagesOrFeatures' },
  { id: '8', text: 'Aurez-vous besoin d\'un backend/API ?', type: 'radio', options: ['Oui', 'Non', 'Je ne sais pas'], field: 'specificNeeds' },
  { id: '9', text: 'Faut-il des notifications push ?', type: 'radio', options: ['Oui', 'Non'], field: 'brandingStatus' }, // recycled field for brevity
  { id: '10', text: 'Avez-vous des applications de référence ?', type: 'textarea', field: 'references' },
  { id: '11', text: 'Quel est votre budget estimé ?', type: 'select', options: ['< 1000$', '1000–5000$', '5000–15000$', '+15000$', 'À discuter'], field: 'budget' },
  { id: '12', text: 'Quel est votre délai souhaité ?', type: 'text', field: 'deadline' },
  { id: '13', text: 'Informations de contact (Nom)', type: 'text', field: 'contact', subField: 'name' },
  { id: '14', text: 'Informations de contact (Email)', type: 'text', field: 'contact', subField: 'email' },
  { id: '15', text: 'Informations de contact (Téléphone)', type: 'text', field: 'contact', subField: 'phone' },
];

export function Questionnaire() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = type === 'website' ? WEB_QUESTIONS : MOBILE_QUESTIONS;
  const progress = ((currentStep + 1) / (questions.length + 1)) * 100;

  const handleNext = () => {
    if (currentStep <= questions.length) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    } else {
      navigate('/');
    }
  };

  const updateField = (field: string, value: any, subField?: string) => {
    setFormData((prev: any) => {
      if (subField) {
        return {
          ...prev,
          [field]: { ...prev[field], [subField]: value }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'projects'), {
        ...formData,
        type,
        status: 'new',
        createdAt: serverTimestamp()
      });
      navigate('/success');
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Une erreur est survenue lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const isLastReview = currentStep === questions.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-24">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full mb-12 overflow-hidden">
        <motion.div 
          className="h-full bg-violet-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100"
        >
          {!isLastReview ? (
            <div className="space-y-8">
              <span className="text-violet-600 font-bold uppercase tracking-wider text-sm">
                Question {currentStep + 1} sur {questions.length}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                {currentQuestion.text}
              </h2>

              <div className="space-y-4">
                {currentQuestion.type === 'text' && (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Tapez votre réponse ici..."
                    className="w-full text-xl py-4 border-b-2 border-slate-200 focus:border-violet-600 outline-none transition-colors"
                    value={currentQuestion.subField ? (formData[currentQuestion.field]?.[currentQuestion.subField] || '') : (formData[currentQuestion.field] || '')}
                    onChange={(e) => updateField(currentQuestion.field, e.target.value, currentQuestion.subField)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  />
                )}

                {currentQuestion.type === 'textarea' && (
                  <textarea
                    autoFocus
                    rows={4}
                    placeholder="Dites-nous en plus..."
                    className="w-full text-xl py-4 border-b-2 border-slate-200 focus:border-violet-600 outline-none transition-colors resize-none"
                    value={formData[currentQuestion.field] || ''}
                    onChange={(e) => updateField(currentQuestion.field, e.target.value)}
                  />
                )}

                {(currentQuestion.type === 'select' || currentQuestion.type === 'radio') && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {currentQuestion.options?.map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          updateField(currentQuestion.field, option);
                          setTimeout(handleNext, 300);
                        }}
                        className={cn(
                          "p-4 text-left rounded-2xl border-2 transition-all font-medium",
                          formData[currentQuestion.field] === option 
                            ? "border-violet-600 bg-violet-50 text-violet-700" 
                            : "border-slate-100 hover:border-slate-200 text-slate-600"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {(currentQuestion.type === 'multiselect' || currentQuestion.type === 'checkbox') && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {currentQuestion.options?.map(option => {
                      const selected = formData[currentQuestion.field] || [];
                      const isSelected = selected.includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            const next = isSelected 
                              ? selected.filter((s: string) => s !== option)
                              : [...selected, option];
                            updateField(currentQuestion.field, next);
                          }}
                          className={cn(
                            "p-4 text-left rounded-2xl border-2 transition-all font-medium flex justify-between items-center",
                            isSelected 
                              ? "border-violet-600 bg-violet-50 text-violet-700" 
                              : "border-slate-100 hover:border-slate-200 text-slate-600"
                          )}
                        >
                          {option}
                          {isSelected && <Check className="w-5 h-5" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-8">
                <button 
                  onClick={handleBack}
                  className="px-6 py-3 text-slate-500 font-bold flex items-center gap-2 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" /> Retour
                </button>
                <button 
                  onClick={handleNext}
                  className="px-10 py-4 bg-violet-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20"
                >
                  Suivant <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-slate-900">Récapitulatif de votre projet</h2>
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {questions.map(q => {
                  const val = q.subField ? formData[q.field]?.[q.subField] : formData[q.field];
                  return (
                    <div key={q.id} className="border-b border-slate-100 pb-4">
                      <p className="text-sm font-semibold text-slate-400 mb-1">{q.text}</p>
                      <p className="text-lg text-slate-800 font-medium whitespace-pre-wrap">
                        {Array.isArray(val) ? val.join(', ') : (val || 'Non renseigné')}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button 
                  onClick={() => setCurrentStep(0)}
                  className="flex-1 px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Modifier
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] px-8 py-4 bg-violet-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Envoyer mon projet <Send className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
