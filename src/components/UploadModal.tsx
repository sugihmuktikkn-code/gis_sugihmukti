import React, { useState } from 'react';
import { UploadCloud, X, Link as LinkIcon, CheckCircle2, Loader2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadUrl(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
      const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary credentials are not set in .env');
      }

      // 1. Generate Signature
      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      const signatureString = `timestamp=${timestamp}${apiSecret}`;
      
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      // 3. Upload Request
      // Using 'auto' resource type to handle both images and videos
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      const dataRes = await response.json();

      if (!response.ok) {
        throw new Error(dataRes.error?.message || 'Gagal mengunggah file.');
      }

      setUploadUrl(dataRes.secure_url);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengunggah.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (uploadUrl) {
      navigator.clipboard.writeText(uploadUrl);
      alert('URL berhasil disalin!');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-black/50 relative">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <UploadCloud className="text-amber-500" />
            Upload Media
          </h2>
          <p className="text-xs text-gray-400">Unggah foto atau video ke Cloudinary</p>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
            <input 
              type="file" 
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          {uploadUrl && (
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex flex-col gap-3 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                <CheckCircle2 size={16} /> Berhasil Diunggah!
              </div>
              <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg border border-white/5">
                <LinkIcon size={14} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-300 truncate">{uploadUrl}</span>
              </div>
              <button 
                onClick={copyToClipboard}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Salin URL
              </button>
            </div>
          )}

          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]
              ${!file || isUploading 
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' 
                : 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-95'
              }`}
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Mengunggah...
              </>
            ) : (
              'Upload ke Cloudinary'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
