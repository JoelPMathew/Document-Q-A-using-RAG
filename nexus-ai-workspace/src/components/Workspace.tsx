import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Folder, File, X, ChevronRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import SplitText from './bits/SplitText';

interface WorkspaceProps {
  onAnalysisComplete: () => void;
}

export default function Workspace({ onAnalysisComplete }: WorkspaceProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      // webkitRelativePath is available when selecting a folder
      const path = (file as any).webkitRelativePath || file.name;
      formData.append('files', file, path);
    });

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Analysis simulation delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        onAnalysisComplete();
      } else {
        console.error('Upload failed');
        alert('Failed to upload files. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 max-w-5xl mx-auto">
      <div className="mb-12">
        <SplitText
          text="Neural Workspace"
          className="text-4xl font-bold text-white mb-4"
          delay={50}
        />
        <p className="text-zinc-500 max-w-2xl">
          Upload your organization's documents to train the neural engine.
          We support folders, PDF, Markdown, and Text files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Upload Area */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative flex-1 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center p-12 text-center group ${dragActive
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40'
              }`}
          >
            <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload className={dragActive ? "text-emerald-500" : "text-zinc-500"} size={32} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {dragActive ? "Drop to upload" : "Drag & drop files or folders"}
            </h3>
            <p className="text-zinc-500 mb-8 max-w-xs">
              Your files will be analyzed and indexed for the Knowledge Base.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => folderInputRef.current?.click()}
                className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-all flex items-center gap-2"
              >
                <Folder size={18} /> Select Folder
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                <File size={18} /> Select Files
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={folderInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </div>
        </div>

        {/* File List */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-6 border-bottom border-zinc-800 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Queue ({files.length})</h4>
            {files.length > 0 && (
              <button
                onClick={() => setFiles([])}
                className="text-[10px] text-zinc-500 hover:text-red-500 transition-colors uppercase font-bold"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-8">
                  <File size={32} className="mb-4" />
                  <p className="text-xs">No files selected</p>
                </div>
              ) : (
                files.map((file, i) => (
                  <motion.div
                    key={`${file.name}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0">
                      <File size={14} className="text-zinc-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate font-medium">{file.name}</p>
                      <p className="text-[10px] text-zinc-600 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-zinc-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-zinc-900/50 border-t border-zinc-800">
            <button
              disabled={files.length === 0 || uploading}
              onClick={handleAnalyze}
              className="w-full py-4 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing Neural Patterns...
                </>
              ) : (
                <>
                  Analyze Workspace <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
