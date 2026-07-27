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
        <div className="flex items-center gap-2 px-3 py-2 neu-pressed text-theme-primary text-xs font-bold">
          <Loader2 className="h-3.5 w-3.5 text-theme-primary animate-spin" />
          <span>Scanning medical report for details...</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleTriggerUpload}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3.5 py-2 neu-button text-theme-muted hover:text-theme-primary text-xs font-bold transition duration-200 disabled:opacity-50 cursor-pointer"
          title="Attach MRI, X-ray or notes"
        >
          <Paperclip className="h-3.5 w-3.5 text-theme-primary" />
          <span>Upload Report</span>
        </button>
      )}
    </div>
  );
}
