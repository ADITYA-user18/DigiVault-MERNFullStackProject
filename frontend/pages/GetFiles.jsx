import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "../services/axios.js";
import { toast } from 'react-toastify';
import { 
  FileText, 
  Image as ImageIcon, 
  File, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Plus, 
  Loader2, 
  Calendar, 
  X, 
  Edit2, 
  Save, 
  Ban,
  Share2,
  MessageSquareText, // New Icon for AI Chat
  Bot,           
  CalendarClock, 
  AlertTriangle  
} from "lucide-react";

// Import Modals
import ShareModal from "../components/ShareModal"; 
import FileChatModal from "../components/FileChatModal"; // New Chat Modal

const GetFiles = () => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // URL Params
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");

  // Modal States
  const [editingFile, setEditingFile] = useState(null);
  const [newFilename, setNewFilename] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [sharingFile, setSharingFile] = useState(null);
  const [chatFile, setChatFile] = useState(null); // New State for AI Chat

  // --- Fetch Files ---
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/file/getfiles", { withCredentials: true });
      if (response.data.success) {
        setFiles(response.data.files);
      } else {
        toast.error("Failed to fetch files.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Server error.");
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---
  const handleDelete = async (fileId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      const response = await axios.delete("/api/file/delete", { data: { fileId }, withCredentials: true });
      if (response.data.success) {
        toast.success("Deleted");
        setFiles(files.filter((f) => f._id !== fileId));
      }
    } catch (error) { toast.error("Error deleting"); }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!newFilename.trim()) return toast.warning("Name required");
    try {
      setIsRenaming(true);
      const response = await axios.put("/api/file/rename", { fileId: editingFile._id, newFilename: newFilename.trim() }, { withCredentials: true });
      if (response.data.success) {
        toast.success("Renamed");
        setFiles(files.map(f => f._id === editingFile._id ? { ...f, filename: newFilename.trim() } : f));
        setEditingFile(null);
      }
    } catch (error) { toast.error("Error renaming"); } finally { setIsRenaming(false); }
  };

  // --- Expiry Status Calculator ---
  const getExpiryStatus = (dateString) => {
    if (!dateString) return null;
    const expiry = new Date(dateString);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "EXPIRED", color: "bg-red-100 text-red-600 border-red-200", icon: AlertTriangle };
    if (diffDays <= 30) return { label: `Expires in ${diffDays}d`, color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: CalendarClock };
    return { label: expiry.toLocaleDateString(), color: "bg-green-50 text-green-700 border-green-200", icon: Calendar };
  };

  // --- Filter Logic ---
  useEffect(() => {
    const results = files.filter((file) => {
      const matchesText = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (searchDate && file.uploadedAt) {
        const d = new Date(file.uploadedAt);
        // Local Time Comparison
        const fileDateLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        matchesDate = fileDateLocal === searchDate;
      }

      let matchesCategory = true;
      if (categoryFilter) {
         const fileCat = file.category || 'Others'; 
         matchesCategory = fileCat === categoryFilter;
      }

      return matchesText && matchesDate && matchesCategory;
    });
    setFilteredFiles(results);
  }, [searchTerm, searchDate, categoryFilter, files]);

  useEffect(() => { fetchFiles(); }, []);

  const renderCardVisual = (file) => {
    if (file.mimeType.startsWith("image/")) {
      return (
        <div className="w-full h-40 bg-gray-100 overflow-hidden relative group-hover:opacity-90 transition-opacity">
          <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      );
    } 
    let Icon = File; let color = "text-gray-400 bg-gray-50";
    if (file.mimeType.includes("pdf")) { Icon = FileText; color = "text-red-500 bg-red-50"; }
    else if (file.mimeType.includes("word") || file.mimeType.includes("document")) { Icon = FileText; color = "text-blue-500 bg-blue-50"; }
    return <div className={`w-full h-40 flex items-center justify-center ${color}`}><Icon className="w-16 h-16 opacity-80 group-hover:scale-110 transition-transform duration-300" /></div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative overflow-x-hidden pt-24 px-4 pb-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-gray-50 to-white"></div>
      
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10 animate-fade-in-down">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              {categoryFilter ? <><span className="text-blue-600">{categoryFilter}</span> Vault</> : "My Secure Vault"}
              {categoryFilter && (
                  <button onClick={() => setSearchParams({})} className="group flex items-center gap-1 text-sm font-normal text-gray-400 hover:text-red-500 bg-gray-100 px-3 py-1 rounded-full transition-colors"><X className="w-3 h-3" /> Clear</button>
              )}
            </h2>
            <p className="text-gray-500 mt-1">{filteredFiles.length} documents found.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 xl:flex-none">
              <div className="relative group flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm outline-none" />
              </div>
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10"><Calendar className="h-5 w-5 text-gray-400" /></div>
                <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="pl-10 pr-10 py-2.5 w-full sm:w-auto bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm outline-none text-gray-600 cursor-pointer" />
                {searchDate && <button onClick={() => setSearchDate("")} className="absolute inset-y-0 right-2 flex items-center justify-center z-20"><div className="p-1 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></div></button>}
              </div>
            </div>
            <Link to="/upload" className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 shadow-lg hover:-translate-y-0.5 whitespace-nowrap"><Plus className="w-5 h-5" /> Upload New</Link>
          </div>
        </div>

        {/* LOADING & EMPTY */}
        {loading && <div className="flex flex-col items-center justify-center h-64 text-gray-400"><Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" /><p>Decrypting vault...</p></div>}
        {!loading && filteredFiles.length === 0 && (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
            <Search className="w-10 h-10 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No files found</h3>
            <button onClick={() => { setSearchTerm(""); setSearchDate(""); setSearchParams({}); }} className="text-blue-600 font-semibold hover:underline mt-2">Clear all filters</button>
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {!loading && filteredFiles.map((file) => {
            const expiryInfo = getExpiryStatus(file.expiryDate);
            
            return (
              <div key={file._id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                {renderCardVisual(file)}
                
                <div className="p-5 flex flex-col flex-1">
                  
                  {/* BADGES ROW */}
                  <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${file.category === categoryFilter ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                          {file.category || 'Others'}
                      </span>
                      
                      {/* EXPIRY BADGE */}
                      {expiryInfo && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border ${expiryInfo.color}`}>
                           {file.isAutoDetected ? <Bot className="w-3 h-3" /> : <expiryInfo.icon className="w-3 h-3" />}
                           {expiryInfo.label}
                        </div>
                      )}
                  </div>
                  
                  <h3 className="font-bold text-gray-800 truncate mb-1" title={file.filename}>{file.filename}</h3>
                  <p className="text-xs text-gray-400 mb-6">
                    Added {new Date(file.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  
                  {/* ACTIONS TOOLBAR */}
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex gap-1">
                      {/* View & Download */}
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-5 h-5" /></a>
                      <a href={file.url.replace('/upload/', '/upload/fl_attachment/')} download className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"><Download className="w-5 h-5" /></a>
                      
                      {/* AI CHAT BUTTON (Only for PDFs) */}
                      {file.mimeType === "application/pdf" && (
                        <button
                            onClick={() => setChatFile(file)}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Chat with AI"
                        >
                            <MessageSquareText className="w-5 h-5" />
                        </button>
                      )}

                      {/* Share Button */}
                      <button onClick={() => setSharingFile(file)} className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Share Securely"><Share2 className="w-5 h-5" /></button>
                      
                      {/* Rename */}
                      <button onClick={() => { setEditingFile(file); setNewFilename(file.filename); }} className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg"><Edit2 className="w-5 h-5" /></button>
                    </div>
                    {/* Delete */}
                    <button onClick={() => handleDelete(file._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RENAME MODAL */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setEditingFile(null)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10">
            <div className="flex justify-between mb-6"><h3 className="text-xl font-bold">Rename</h3><button onClick={() => setEditingFile(null)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleRenameSubmit}>
              <input type="text" value={newFilename} onChange={(e) => setNewFilename(e.target.value)} className="w-full px-4 py-3 rounded-xl border mb-6" autoFocus />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditingFile(null)} className="px-5 py-2 text-gray-600">Cancel</button>
                <button type="submit" disabled={isRenaming} className="px-5 py-2 bg-blue-600 text-white rounded-xl">{isRenaming ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {sharingFile && (
        <ShareModal file={sharingFile} onClose={() => setSharingFile(null)} />
      )}

      {/* AI CHAT MODAL (NEW) */}
      {chatFile && (
        <FileChatModal 
            file={chatFile} 
            onClose={() => setChatFile(null)} 
        />
      )}

    </div>
  );
};

export default GetFiles;