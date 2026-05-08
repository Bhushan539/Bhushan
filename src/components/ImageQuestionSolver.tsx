import React, { useState } from 'react';
import { Upload, FileSearch, Loader2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { findAnswersFromImage } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface ImageQuestionSolverProps {
  pdfBase64: string;
  pdfMime: string;
}

export function ImageQuestionSolver({ pdfBase64, pdfMime }: ImageQuestionSolverProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [answers, setAnswers] = useState<{ q: string; a: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("कृपया फक्त एक चित्र (Image) अपलोड करा.");
      return;
    }

    setFileName(file.name);
    setIsAnalyzing(true);
    setError(null);
    setAnswers(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const imgBase64 = (reader.result as string).split(',')[1];
        try {
          const result = await findAnswersFromImage(pdfBase64, pdfMime, imgBase64, file.type);
          setAnswers(result.questions);
        } catch (err) {
          setError("उत्तरे शोधताना अडचण आली. कृपया पुन्हा प्रयत्न करा.");
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("चित्र वाचताना त्रुटी आली.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-3xl border border-blue-100">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
            <FileSearch className="w-6 h-6 text-indigo-600" />
            चित्रातील प्रश्न सोडवा
          </h3>
          <p className="text-slate-600 mb-8">
            तुमच्याकडे प्रश्नांची प्रतिमा (Photo) असेल तर ती अपलोड करा. AI या प्रश्नांची उत्तरे तुमच्या PDF मधून शोधेल.
          </p>

          <label className={`
            relative flex flex-col items-center justify-center w-full h-40 
            bg-white border-2 border-dashed rounded-2xl cursor-pointer 
            transition-all duration-200
            ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400 hover:bg-slate-50 group'}
            ${fileName && !error ? 'border-green-400' : 'border-slate-300'}
          `}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isAnalyzing ? (
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
              ) : (
                <Upload className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors" />
              )}
              <p className="text-sm text-slate-600">
                <span className="font-semibold">{fileName || 'प्रश्नांचे चित्र निवडा'}</span>
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isAnalyzing}
            />
          </label>

          {error && (
            <div className="mt-4 p-3 bg-red-100/50 text-red-600 rounded-xl text-sm flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-slate-500 gap-4"
          >
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            </div>
            <p className="font-bold">तुमच्या प्रश्नांची उत्तरे PDF मध्ये शोधली जात आहेत...</p>
          </motion.div>
        )}

        {answers && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-slate-800 font-bold px-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              आढळलेले प्रश्न आणि उत्तरे:
            </div>
            
            {answers.map((qa, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm">
                    Q{i+1}
                  </div>
                  <div className="flex-1 space-y-4">
                    <h4 className="text-lg font-bold text-slate-900 leading-tight">
                      {qa.q}
                    </h4>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed">
                      <div className="flex gap-2 items-center text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                        <HelpCircle className="w-3 h-3" /> उत्तर:
                      </div>
                      {qa.a}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
