import React, { useState, useRef } from 'react';
import { Paperclip, FileText, X, CheckCircle, Loader2 } from 'lucide-react';

export default function FileUpload({ onUploadComplete, disabled }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      simulateScan(file);
    }
  };

  const simulateScan = (file) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onUploadComplete(file.name);
      setSelectedFile(null); // Clear selected file after simulator triggers message
    }, 2000);
  };

  const handleTriggerUpload = () => {
    if (!disabled && !isScanning) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        disabled={disabled || isScanning}
      />
      
      {isScanning ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
          <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
          <span>Scanning medical report for details...</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleTriggerUpload}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800/80 text-slate-400 hover:text-white text-xs font-semibold transition duration-200 disabled:opacity-50"
          title="Attach MRI, X-ray or notes"
        >
          <Paperclip className="h-3.5 w-3.5" />
          <span>Upload Report</span>
        </button>
      )}
    </div>
  );
}
