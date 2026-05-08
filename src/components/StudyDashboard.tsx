import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Sparkles, Image as ImageIcon, CheckCircle, Copy, Check, Download, Loader2, ArrowRight, FileSearch } from 'lucide-react';
import { StudyData, generateTopicImage } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { ImageQuestionSolver } from './ImageQuestionSolver';

interface StudyDashboardProps {
  data: StudyData;
  pdfBase64: string;
  pdfMime: string;
}

export function StudyDashboard({ data, pdfBase64, pdfMime }: StudyDashboardProps) {
  const [activeTab, setActiveTab] = useState<'points' | 'exam' | 'image-qa'>('points');
  const [topicImages, setTopicImages] = useState<Record<number, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${data.studyPoints.summary}\n\nमुद्दे:\n${data.studyPoints.importantPoints.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateImage = async (index: number, prompt: string) => {
    setLoadingImages(prev => ({ ...prev, [index]: true }));
    try {
      const url = await generateTopicImage(prompt);
      setTopicImages(prev => ({ ...prev, [index]: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingImages(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 p-1 bg-slate-100 rounded-xl w-fit mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('points')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'points' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          महत्त्वाचे मुद्दे
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'exam' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          परीक्षा तयारी
        </button>
        <button
          onClick={() => setActiveTab('image-qa')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'image-qa' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          प्रतिमा प्रश्न-उत्तर
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'points' ? (
          <motion.div
            key="points"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Summary Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative group">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  थोडक्यात सारांश
                </h3>
                <button 
                  onClick={handleCopy}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                {data.studyPoints.summary}
              </p>
            </div>

            {/* List of Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.studyPoints.importantPoints.map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-5 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-blue-200 transition-colors"
                >
                  <div className="mt-1 flex-shrink-0 w-6 h-6 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <p className="text-slate-700 font-medium">{point}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : activeTab === 'image-qa' ? (
          <motion.div
            key="image-qa"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ImageQuestionSolver pdfBase64={pdfBase64} pdfMime={pdfMime} />
          </motion.div>
        ) : (
          <motion.div
            key="exam"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-8">
              {data.examTopics.map((topic, idx) => (
                <div key={idx} className="bg-white overflow-hidden rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row">
                  <div className="p-8 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-amber-100 italic">
                        {topic.importance}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{topic.title}</h3>
                    </div>
                    
                    <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <h4 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        संभाव्य प्रश्न:
                      </h4>
                      <p className="text-blue-800 font-medium italic">"{topic.question}"</p>
                    </div>

                    <div className="markdown-body prose-sm">
                      <h4 className="text-slate-800 font-black mb-3">संपूर्ण स्पष्टीकरण (सविस्तर उत्तर):</h4>
                      <ReactMarkdown>{topic.explanation}</ReactMarkdown>
                    </div>

                    {!topicImages[idx] && !loadingImages[idx] && (
                      <button
                        onClick={() => handleGenerateImage(idx, topic.visualPrompt)}
                        className="mt-6 flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium text-sm"
                      >
                        <ImageIcon className="w-4 h-4" />
                        चित्राद्वारे स्पष्टीकरण पहा
                      </button>
                    )}
                  </div>

                  <div className="w-full md:w-80 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 flex items-center justify-center min-h-[300px]">
                    {loadingImages[idx] ? (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-xs">चित्र तयार होत आहे...</span>
                      </div>
                    ) : topicImages[idx] ? (
                      <img 
                        src={topicImages[idx]} 
                        alt={topic.title} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-300 p-8 text-center">
                        <ImageIcon className="w-12 h-12 opacity-20" />
                        <p className="text-xs">चित्र पाहण्यासाठी बटण दाबा</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
