import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../services/axios";
import { 
  FileText, 
  Image as ImageIcon, 
  File, 
  Download, 
  Eye, 
  ShieldCheck, 
  Loader2, 
  AlertTriangle,
  Lock,
  ArrowRight
} from "lucide-react";

const SharedFileView = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null); 
  
  // NEW: Lock State
  const [isLocked, setIsLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // Fetch logic handles both initial load AND password attempts
  const fetchSharedFile = async (pwd = null) => {
    try {
      if(!pwd) setLoading(true); // Only show full loader on first load
      setError(null);
      
      // Send password in header if provided
      const headers = pwd ? { 'x-share-password': pwd } : {};

      const response = await axios.get(`/api/share/view/${token}`, { headers });
      
      if (response.data.success) {
        setData(response.data);
        setIsLocked(false); // Unlock success
      }
    } catch (err) {
      console.error("Link Error:", err);
      const status = err.response?.status;

      if (status === 401) {
          // Password Required
          setIsLocked(true);
      } else if (status === 403) {
          // Wrong Password
          setIsLocked(true);
          setError("Incorrect password. Please try again.");
      } else if (status === 410) {
          setError("This secure link has expired.");
      } else {
          setError("Invalid link or file deleted.");
      }
    } finally {
      setLoading(false);
      setUnlocking(false);
    }
  };

  useEffect(() => {
    fetchSharedFile();
  }, [token]);

  const handleUnlock = (e) => {
      e.preventDefault();
      setUnlocking(true);
      fetchSharedFile(passwordInput);
  };

  const renderIcon = (mimeType) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-16 h-16 text-purple-500" />;
    if (mimeType.includes("pdf")) return <FileText className="w-16 h-16 text-red-500" />;
    return <File className="w-16 h-16 text-blue-500" />;
  };

  // --- 1. LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Verifying secure token...</h2>
      </div>
    );
  }

  // --- 2. LOCKED STATE (Password Required) ---
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-gray-50 to-white"></div>
        
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-gray-100 animate-scale-up">
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Secured Document</h2>
          <p className="text-sm text-gray-500 mb-6">This file is password protected by the owner.</p>
          
          <form onSubmit={handleUnlock}>
              <input 
                type="password" 
                placeholder="Enter Password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none mb-4 text-gray-800 font-semibold tracking-widest"
                autoFocus
              />
              {error && <p className="text-xs text-red-500 mb-3 font-medium bg-red-50 py-1 rounded">{error}</p>}
              
              <button 
                type="submit" 
                disabled={unlocking || !passwordInput}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {unlocking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Unlock File"}
              </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 3. ERROR STATE ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  // --- 4. SUCCESS STATE ---
  const { file, permissions } = data;

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-gray-50 to-white"></div>
      
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden animate-scale-up">
        
        <div className="bg-gray-50/80 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wide">SECURE SHARE</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
            <Lock className="w-3 h-3" />
            <span>Encrypted</span>
          </div>
        </div>

        <div className="p-10 flex flex-col items-center text-center">
          <div className="w-32 h-32 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-100">
            {file.mimeType.startsWith('image/') ? <img src={file.url} alt="Preview" className="w-full h-full object-cover rounded-2xl" /> : renderIcon(file.mimeType)}
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 break-all">{file.filename}</h1>
          <p className="text-sm text-gray-500 mb-8">Shared on {new Date(file.uploadedAt).toLocaleDateString()} • {(file.size / 1024 / 1024).toFixed(2)} MB</p>

          <div className="w-full space-y-3">
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
              <Eye className="w-5 h-5" /> View File
            </a>

            {permissions.canDownload ? (
              <a href={file.url.replace('/upload/', '/upload/fl_attachment/')} download className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-200 text-gray-700 hover:text-green-600 hover:border-green-200 hover:bg-green-50 rounded-xl font-bold transition-all">
                <Download className="w-5 h-5" /> Download Securely
              </a>
            ) : (
              <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                <Download className="w-4 h-4" /> Download Disabled
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">This file is hosted securely by DigiVault.</p>
        </div>
      </div>
    </div>
  );
};

export default SharedFileView;