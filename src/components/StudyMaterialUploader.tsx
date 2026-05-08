import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface StudyMaterialUploaderProps {
  onFileProcessed: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

export function StudyMaterialUploader({ onFileProcessed, isLoading }: StudyMaterialUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    
    // Increased limit to 50MB
    if (file.size > 50 * 1024 * 1024) {
      setError("फाईल खूप मोठी आहे. कृपया ५० एमबी पेक्षा लहान फाईल निवडा.");
      return;
    }

    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (!isPDF && !isImage) {
      setError("कृपया फक्त PDF किंवा प्रतिमा (Image) फाईल अपलोड करा.");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        onFileProcessed(base64, file.type);
      };
      reader.onerror = () => {
        setError("फाईल वाचताना त्रुटी आली.");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">अभ्यास साहित्य अपलोड करा</h2>
        <p className="text-slate-500">तुमची PDF किंवा प्रतिमा (Image) निवडा जेणेकरून AI विश्लेषण करू शकेल.</p>
      </div>

      <label 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full h-56 
          border-2 border-dashed rounded-xl cursor-pointer 
          transition-all duration-200
          ${isLoading ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'hover:bg-slate-50 hover:border-blue-400 group'}
          ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300'}
          ${fileName && !error ? 'border-green-400 bg-green-50' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isLoading ? (
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          ) : fileName && !error ? (
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
          ) : (
            <Upload className="w-12 h-12 text-slate-400 group-hover:text-blue-500 mb-4 transition-colors" />
          )}
          
          <p className="mb-2 text-sm text-slate-700">
            <span className="font-semibold">{fileName || 'फाईल निवडा'}</span>
          </p>
          <p className="text-xs text-slate-500">PDF किंवा Image फाईल (Max 50MB)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="application/pdf,image/*"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
