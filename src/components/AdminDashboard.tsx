import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Search, 
  Filter, 
  Trash2, 
  ExternalLink, 
  Download, 
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // MVP simple password check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Replace with env variable in production
      setIsAuthenticated(true);
    } else {
      alert('Mot de passe incorrect');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
      setLoading(loading && false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const updateStatus = async (projectId: string, newStatus: string) => {
    await updateDoc(doc(db, 'projects', projectId), { status: newStatus });
  };

  const deleteProject = async (projectId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      await deleteDoc(doc(db, 'projects', projectId));
      setSelectedProject(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Nom Projet', 'Type', 'Email', 'Téléphone', 'Budget', 'Date'];
    const rows = projects.map(p => [
      p.projectName,
      p.type,
      p.contact.email,
      p.contact.phone,
      p.budget,
      p.createdAt?.toDate().toLocaleDateString()
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `projects_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200"
        >
          <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-6">Accès Administration</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Mot de passe (admin123)" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-600 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all">
              Se connecter
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Admin</h1>
          <p className="text-slate-500">Gérez vos demandes de projets entrants.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un projet ou client..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="new">Nouveau</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Traité</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Nom du Projet</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800">{project.projectName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-medium">{project.contact.name}</span>
                      <span className="text-slate-500 text-xs">{project.contact.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest",
                      project.type === 'website' ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"
                    )}>
                      {project.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {project.createdAt?.toDate ? format(project.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : '...'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedProject(project)}
                      className="p-2 text-slate-400 hover:text-violet-600 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Aucun projet ne correspond à vos critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  {selectedProject.projectName}
                  <StatusBadge status={selectedProject.status} />
                </h2>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Info Client */}
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Contact Client</h3>
                    <div className="space-y-4 bg-slate-50 p-6 rounded-2xl">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Nom</p>
                        <p className="font-bold">{selectedProject.contact.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Email</p>
                        <p className="font-bold">{selectedProject.contact.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Téléphone</p>
                        <p className="font-bold">{selectedProject.contact.phone}</p>
                      </div>
                    </div>
                  </section>

                  {/* Info Projet */}
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Détails Projet</h3>
                    <div className="space-y-6">
                      <Detail label="Budget estimé" value={selectedProject.budget} />
                      <Detail label="Délai souhaité" value={selectedProject.deadline} />
                      <Detail label="Description" value={selectedProject.description} />
                      <Detail label="Objectifs" value={selectedProject.goals} />
                      <Detail label="Site/App de ref" value={selectedProject.references} />
                    </div>
                  </section>
                </div>

                <hr className="my-8 border-slate-100" />

                <div className="grid md:grid-cols-3 gap-8">
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Pages/Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(selectedProject.pagesOrFeatures) ? (
                        selectedProject.pagesOrFeatures.map(item => (
                          <span key={item} className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">{item}</span>
                        ))
                      ) : (
                        <p className="text-sm">{selectedProject.pagesOrFeatures || 'Non spécifié'}</p>
                      )}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Besoins Spécifiques</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(selectedProject.specificNeeds) ? (
                        selectedProject.specificNeeds.map(item => (
                          <span key={item} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{item}</span>
                        ))
                      ) : (
                        <p className="text-sm">{selectedProject.specificNeeds || 'Non spécifié'}</p>
                      )}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Design/Branding</h3>
                    <p className="text-sm font-medium">{selectedProject.brandingStatus}</p>
                  </section>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatus(selectedProject.id!, 'new')}
                    className={cn("px-4 py-2 rounded-xl text-sm font-bold", selectedProject.status === 'new' ? "bg-red-600 text-white" : "bg-white border border-slate-200 text-slate-600")}
                  >
                    Nouveau
                  </button>
                  <button 
                    onClick={() => updateStatus(selectedProject.id!, 'in_progress')}
                    className={cn("px-4 py-2 rounded-xl text-sm font-bold", selectedProject.status === 'in_progress' ? "bg-yellow-500 text-white" : "bg-white border border-slate-200 text-slate-600")}
                  >
                    En cours
                  </button>
                  <button 
                    onClick={() => updateStatus(selectedProject.id!, 'completed')}
                    className={cn("px-4 py-2 rounded-xl text-sm font-bold", selectedProject.status === 'completed' ? "bg-green-600 text-white" : "bg-white border border-slate-200 text-slate-600")}
                  >
                    Traité
                  </button>
                </div>
                <button 
                  onClick={() => deleteProject(selectedProject.id!)}
                  className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'new': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold uppercase"><AlertCircle className="w-3 h-3" /> Nouveau</span>;
    case 'in_progress': return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold uppercase"><Clock className="w-3 h-3" /> En cours</span>;
    case 'completed': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold uppercase"><CheckCircle className="w-3 h-3" /> Traité</span>;
    default: return null;
  }
}

function Detail({ label, value }: { label: string, value: any }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-1">{label}</p>
      <p className="text-slate-700 font-medium whitespace-pre-wrap">{value || 'Non spécifié'}</p>
    </div>
  );
}
