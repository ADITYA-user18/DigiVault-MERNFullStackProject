import React, { useState } from "react";
import axios from "../services/axios";
import { 
  X, Link as LinkIcon, Copy, Check, Clock, Download, Globe, ShieldCheck, Loader2, Lock
} from "lucide-react";
import { toast } from "react-toastify";

const ShareModal = ({ file, onClose }) => {
  const [expiry, setExpiry] = useState("24h");
  const [canDownload, setCanDownload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // NEW: Password State
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/share/generate", {
        fileId: file._id,
        expiresIn: expiry,
        canDownload,
        password: usePassword ? password : null // Send password if enabled
      }, { withCredentials: true });

      if (response.data.success) {
        const fullLink = `${window.location.origin}/share/${response.data.token}`;
        setGeneratedLink(fullLink);
        toast.success("Secure link created!");
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to generate link.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.info("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const expiryOptions = [
    { value: "1h", label: "1 Hour" },
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "never", label: "Never" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col animate-scale-up">
        
        {/* Header */}
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Globe className="w-5 h-5" /></div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Share File</h3>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{file.filename}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!generatedLink ? (
            <div className="space-y-6">
              
              {/* Expiry Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> Link Expiration</label>
                <div className="grid grid-cols-4 gap-2">
                  {expiryOptions.map((opt) => (
                    <button key={opt.value} onClick={() => setExpiry(opt.value)} className={`py-2 px-1 rounded-lg text-sm font-medium transition-all border ${expiry === opt.value ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:bg-blue-50"}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Permissions & Security Group */}
              <div className="flex flex-col gap-3">
                  
                  {/* Allow Download Toggle */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${canDownload ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"}`}><Download className="w-5 h-5" /></div>
                      <div><p className="text-sm font-bold text-gray-900">Allow Download</p><p className="text-xs text-gray-500">Recipients can save file</p></div>
                    </div>
                    <button onClick={() => setCanDownload(!canDownload)} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${canDownload ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${canDownload ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Password Protection Toggle (NEW) */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${usePassword ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-500"}`}>
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Password Protection</p>
                                <p className="text-xs text-gray-500">Require a PIN to view</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setUsePassword(!usePassword)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${usePassword ? 'bg-orange-500' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${usePassword ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Password Input (Animated) */}
                    {usePassword && (
                        <input 
                            type="text" 
                            placeholder="Set a password (e.g. 1234)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none animate-fade-in"
                        />
                    )}
                  </div>
              </div>

              <button onClick={handleGenerate} disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-5 h-5" />} {loading ? "Generating Link..." : "Create Share Link"}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldCheck className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold text-gray-900">Link Ready!</h3>
                <p className="text-sm text-gray-500 mt-1">Anyone with this link can view the file.</p>
              </div>

              <div className="bg-gray-50 p-1 rounded-xl border border-gray-200 flex items-center">
                <input type="text" readOnly value={generatedLink} className="bg-transparent w-full text-sm text-gray-600 px-3 py-2 outline-none" />
                <button onClick={copyToClipboard} className={`p-2.5 rounded-lg transition-all shadow-sm ${copied ? "bg-green-500 text-white" : "bg-white text-gray-700 border border-gray-200"}`}>{copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}</button>
              </div>

              <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;