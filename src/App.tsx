import React, { useState } from 'react';
import { StudyMaterialUploader } from './components/StudyMaterialUploader';
import { StudyDashboard } from './components/StudyDashboard';
import { StudyData, analyzeMarathiContent } from './services/geminiService';
import { GraduationCap, Sparkles, RefreshCcw, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [studyData, setStudyData] = useState<StudyData | null>(null);
  const [pdfMeta, setPdfMeta] = useState<{ base64: string, mimeType: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileProcessed = async (base64: string, mimeType: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeMarathiContent(base64, mimeType);
      setStudyData(data);
      setPdfMeta({ base64, mimeType });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setStudyData(null);
    setPdfMeta(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 py-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                मराठी अभ्यास AI
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Exam Prep Assistant</p>
            </div>
          </div>
          
          {studyData && (
            <button 
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              दुसरी फाईल निवडा
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-12">
        <AnimatePresence mode="wait">
          {!studyData ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              {!isAnalyzing ? (
                <>
                  <div className="text-center mb-12 max-w-xl">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                      तुमचा अभ्यास सोपा करा
                    </h2>
                    <p className="text-lg text-slate-500">
                      तुमची PDF किंवा प्रतिमा (Photo) अपलोड करा आणि AI द्वारे महत्त्वाचे मुद्दे आणि परीक्षेचे विषय समजून घ्या.
                    </p>
                  </div>
                  <StudyMaterialUploader onFileProcessed={handleFileProcessed} isLoading={isAnalyzing} />
                  
                  <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
                    {[
                      { icon: <Sparkles className="w-5 h-5 text-amber-500" />, title: "सविस्तर सारांश", desc: "कठीण धडे सोप्या मराठीत समजून घ्या" },
                      { icon: <GraduationCap className="w-5 h-5 text-blue-500" />, title: "परीक्षा तयारी", desc: "महत्त्वाचे प्रश्न आणि उत्तरांची सविस्तर मांडणी" },
                      { icon: <ImageIcon className="w-5 h-5 text-indigo-500" />, title: "चित्र रूप स्पष्टीकरण", desc: "विजुअल लॅर्निंगद्वारे लवकर समजा" }
                    ].map((feature, i) => (
                      <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="p-3 bg-slate-50 rounded-xl mb-4">{feature.icon}</div>
                        <h4 className="font-bold text-slate-800 mb-1">{feature.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800">माहितीचे विश्लेषण सुरू आहे...</h3>
                    <p className="text-slate-500">AI तुमच्यासाठी महत्त्वाचे मुद्दे आणि प्रश्न तयार करत आहे.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center text-center gap-2 max-w-md">
                  <div className="p-2 bg-red-100 text-red-600 rounded-full">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                  <button 
                    onClick={handleReset}
                    className="mt-2 text-sm font-bold text-red-600 hover:underline"
                  >
                    पुन्हा प्रयत्न करा
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {studyData && pdfMeta && (
                <StudyDashboard 
                  data={studyData} 
                  pdfBase64={pdfMeta.base64} 
                  pdfMime={pdfMeta.mimeType} 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating help or small info */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-6 flex justify-center pointer-events-none">
        <div className="bg-slate-900 text-white text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full opacity-60 pointer-events-auto">
          Powered by Gemini AI • 2026
        </div>
      </footer>
    </div>
  );
}
