import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, ChevronDown, Clock, ClipboardList, Send, Loader2, RefreshCw, Bookmark, Trash2, Archive, Calendar } from 'lucide-react';
import { generateActivity, ActivityResult } from './services/geminiService';

interface SavedActivity extends ActivityResult {
  id: string;
  module: string;
  concept: string;
  timestamp: number;
}

const MODULES = [
  "Planeación estratégica y prospectiva C-8",
  "Innovación en el modelo de negocio C-9",
  "Economía sostenible C-8",
  "Diseño de plan de negocios C-9",
  "Gestión de proyectos C-9",
  "Proyecto de innovación sostenible C-9"
];

export default function App() {
  const [module, setModule] = useState(MODULES[0]);
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActivityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedActivities, setSavedActivities] = useState<SavedActivity[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);

  // Load saved activities from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('edu-activities');
    if (stored) {
      try {
        setSavedActivities(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved activities", e);
      }
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('edu-activities', JSON.stringify(savedActivities));
  }, [savedActivities]);

  const handleSave = () => {
    if (!result) return;
    
    // Avoid duplicates by title/concept combo
    const isDuplicate = savedActivities.some(a => a.titulo === result.titulo && a.concept === concept);
    if (isDuplicate) return;

    const newActivity: SavedActivity = {
      ...result,
      id: crypto.randomUUID(),
      module,
      concept,
      timestamp: Date.now()
    };
    setSavedActivities([newActivity, ...savedActivities]);
  };

  const removeActivity = (id: string) => {
    setSavedActivities(savedActivities.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setLoading(true);
    setResult(null); // Clear previous result
    setError(null);
    try {
      const activity = await generateActivity(module, concept);
      setResult(activity);
    } catch (err) {
      console.error(err);
      setError("Hubo un error al generar la actividad. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 font-sans selection:bg-black selection:text-white">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-16 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-balance">
              EduInnovate
            </h1>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Innovación y Emprendimiento
            </p>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-neutral-600 max-w-md mx-auto"
          >
            Diseña experiencias de aprendizaje dinámicas y efectivas para tus clases universitarias en segundos.
          </motion.p>
        </header>

        {/* Search / Input Section */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setShowLibrary(!showLibrary)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
          >
            <Archive size={16} /> 
            {showLibrary ? 'Ocultar Biblioteca' : `Mi Biblioteca (${savedActivities.length})`}
          </button>
        </div>

        <AnimatePresence>
          {showLibrary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100 space-y-4">
                {savedActivities.length === 0 ? (
                  <p className="text-center py-8 text-neutral-400 text-sm italic">No tienes actividades guardadas aún.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedActivities.map((act) => (
                      <motion.div 
                        key={act.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm group relative"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter truncate max-w-[150px]">
                            {act.module}
                          </span>
                          <button 
                            onClick={() => removeActivity(act.id)}
                            className="text-neutral-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h4 className="font-serif text-lg text-neutral-900 leading-tight mb-2 line-clamp-2">{act.titulo}</h4>
                        <div className="flex items-center gap-3 mt-4 text-[10px] font-bold text-neutral-400 uppercase">
                           <div className="flex items-center gap-1"><Calendar size={10} /> {new Date(act.timestamp).toLocaleDateString()}</div>
                           <button 
                            onClick={() => {
                              setResult(act);
                              setModule(act.module);
                              setConcept(act.concept);
                              setShowLibrary(false);
                              window.scrollTo({ top: 500, behavior: 'smooth' });
                            }}
                            className="ml-auto text-black hover:underline"
                           >
                             Ver Detalle
                           </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="module" className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <BookOpen size={14} /> Selecciona el Módulo
              </label>
              <div className="relative group">
                <select
                  id="module"
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 pr-10 focus:outline-hidden focus:ring-2 focus:ring-black/5 transition-all cursor-pointer font-medium text-neutral-800"
                >
                  {MODULES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="concept" className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Sparkles size={14} /> Concepto o Problema
              </label>
              <textarea
                id="concept"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="¿Qué concepto específico quieres que los alumnos aprendan hoy o qué problema van a resolver?"
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 min-h-[120px] focus:outline-hidden focus:ring-2 focus:ring-black/5 transition-all text-neutral-800 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !concept.trim()}
              className="w-full bg-[#1A1A1A] text-white rounded-xl py-4 flex items-center justify-center gap-2 font-semibold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? "Procesando..." : "Generar Actividad"}
            </button>
          </form>
        </motion.div>

        {/* Loading / Thinking View */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-12 flex flex-col items-center justify-center space-y-8 py-12"
            >
              <div className="relative flex items-center justify-center h-24 w-24">
                {/* Abstract "Thinking" animation */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 border-2 border-dashed border-neutral-200 rounded-full"
                    animate={{
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  />
                ))}
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-black text-white p-4 rounded-2xl shadow-xl z-20"
                >
                  <BookOpen size={32} />
                </motion.div>
                
                {/* Floating ideas */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-white p-2 rounded-lg shadow-md border border-neutral-100"
                  animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Sparkles size={16} className="text-amber-400" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-6 bg-white p-2 rounded-lg shadow-md border border-neutral-100"
                  animate={{ y: [0, 20, 0], x: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <ClipboardList size={16} className="text-blue-400" />
                </motion.div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">Curando ideas brillantes</p>
                <p className="text-xs text-neutral-500 animate-pulse">Estructurando la dinámica pedagógica...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm"
            >
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 group"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Resultado Generado</h2>
                <button 
                  onClick={() => setResult(null)} 
                  className="text-xs text-neutral-400 hover:text-neutral-900 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw size={12} /> Limpiar
                </button>
              </div>
              
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 relative overflow-hidden group">
                {/* Save button floating */}
                <button 
                  onClick={handleSave}
                  disabled={savedActivities.some(a => a.titulo === result.titulo)}
                  className={`absolute top-6 right-6 p-3 rounded-full transition-all z-30 ${
                    savedActivities.some(a => a.titulo === result.titulo) 
                    ? 'bg-neutral-100 text-neutral-400' 
                    : 'bg-neutral-50 text-neutral-500 hover:bg-black hover:text-white shadow-sm'
                  }`}
                  title="Guardar en biblioteca"
                >
                  <Bookmark size={20} fill={savedActivities.some(a => a.titulo === result.titulo) ? "currentColor" : "none"} />
                </button>

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
                
                <div className="relative">
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-serif text-3xl md:text-4xl pr-12 text-neutral-900 leading-tight"
                  >
                    {result.titulo}
                  </motion.h3>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 flex items-center gap-2 text-sm text-neutral-500 font-medium bg-neutral-50 w-fit px-3 py-1.5 rounded-full"
                  >
                    <Clock size={14} className="text-neutral-400" />
                    <span>Duración sugerida: {result.duracion}</span>
                  </motion.div>

                  <div className="mt-10 space-y-8">
                    <section className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                        <ClipboardList size={14} /> Instrucciones paso a paso
                      </h4>
                      <ul className="space-y-4">
                        {result.instrucciones.map((inst, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            className="flex gap-4 group/item"
                          >
                            <span className="flex-none w-6 h-6 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-400 group-hover/item:border-neutral-900 group-hover/item:text-neutral-900 transition-colors">
                              {idx + 1}
                            </span>
                            <p className="text-neutral-700 leading-relaxed pt-0.5">{inst}</p>
                          </motion.li>
                        ))}
                      </ul>
                    </section>

                    <motion.section 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="pt-8 border-t border-neutral-100 space-y-3"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                        <Send size={14} /> Entregable del alumno
                      </h4>
                      <div className="p-4 bg-black text-white rounded-2xl">
                        <p className="text-sm font-medium leading-relaxed opacity-90">{result.entregable}</p>
                      </div>
                    </motion.section>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-neutral-100 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">
            EduInnovate &copy; 2026 &middot; Herramienta de Apoyo Docente
          </p>
        </footer>
      </div>
    </div>
  );
}

