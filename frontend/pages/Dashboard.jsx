import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../services/axios.js";
import {
  PieChart, Image as ImageIcon, FileText, File, UploadCloud, Briefcase, GraduationCap, HeartPulse, Camera, Shield, Download, Eye, Loader2,
  Globe, Trash2, ExternalLink, ShieldCheck, Clock, MapPin, Lock // Added Lock Icon
} from "lucide-react";
import { toast } from "react-toastify";

// Import the 2FA Setup Modal
import TwoFactorSetup from "../components/TwoFactorSetup";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [activeLinks, setActiveLinks] = useState([]);
  const [logs, setLogs] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // NEW: State to toggle 2FA Modal
  const [show2FA, setShow2FA] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, linksRes, logsRes] = await Promise.all([
          axios.get("/api/file/dashboard", { withCredentials: true }),
          axios.get("/api/share/active", { withCredentials: true }),
          axios.get("/api/share/logs", { withCredentials: true }) 
        ]);

        if (dashRes.data.success) setData(dashRes.data);
        if (linksRes.data.success) setActiveLinks(linksRes.data.links);
        if (logsRes.data.success) setLogs(logsRes.data.logs);

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRevoke = async (linkId) => {
    try {
        await axios.delete(`/api/share/revoke/${linkId}`, { withCredentials: true });
        toast.success("Link revoked. File is secure again.");
        setActiveLinks(prev => prev.filter(link => link._id !== linkId));
    } catch (error) {
        toast.error("Failed to revoke link.");
    }
  };

  const categories = [
    { name: "Identity", icon: Shield, color: "bg-blue-100 text-blue-600", link: "/getfiles?category=Identity" },
    { name: "Medical", icon: HeartPulse, color: "bg-red-100 text-red-600", link: "/getfiles?category=Medical" },
    { name: "Education", icon: GraduationCap, color: "bg-green-100 text-green-600", link: "/getfiles?category=Education" },
    { name: "Photos", icon: Camera, color: "bg-purple-100 text-purple-600", link: "/getfiles?category=Others" },
    { name: "Work", icon: Briefcase, color: "bg-orange-100 text-orange-600", link: "/getfiles?category=Work" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative overflow-x-hidden pt-24 px-4 pb-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-gray-50 to-white"></div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in-down">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{data?.userName || "User"}</span>
            </h1>
            <p className="text-gray-500 mt-2">Explore your documents and security insights.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* NEW: ENABLE 2FA BUTTON */}
            <button 
                onClick={() => setShow2FA(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
                <Lock className="w-5 h-5 text-emerald-600" /> 
                <span className="hidden sm:inline">2FA Security</span>
            </button>

            <Link to="/upload" className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:-translate-y-1 transition-all">
                <UploadCloud className="w-5 h-5" /> Quick Upload
            </Link>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up">
          <StatCard label="Total Files" count={data?.stats.total} icon={PieChart} className="bg-blue-100 text-blue-600" />
          <StatCard label="Images" count={data?.stats.images} icon={ImageIcon} className="bg-purple-100 text-purple-600" />
          <StatCard label="PDF Documents" count={data?.stats.pdfs} icon={FileText} className="bg-red-100 text-red-600" />
          <StatCard label="Other Files" count={data?.stats.docs} icon={File} className="bg-green-100 text-green-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- MAIN CONTENT COLUMN (Left 2/3) --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. RECENT UPLOADS */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Uploads</h2>
                <Link to="/getfiles" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                {data?.recentFiles.length > 0 ? (
                  data.recentFiles.map((file) => <RecentFileRow key={file._id} file={file} />)
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <UploadCloud className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No files uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. ACTIVE SHARED LINKS */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        Active Public Links
                    </h2>
                    <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">
                        {activeLinks.length} Active
                    </span>
                </div>

                <div className="space-y-3">
                    {activeLinks.length > 0 ? (
                        activeLinks.map((link) => (
                            <div key={link._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-100 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-white rounded-lg border border-gray-100">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm truncate">{link.file?.filename || "Unknown File"}</p>
                                        <p className="text-xs text-gray-400">
                                            Expires: {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : "Never"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a 
                                        href={`${window.location.origin}/share/${link.token}`} 
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                                        title="Test Link"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button 
                                        onClick={() => handleRevoke(link._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                                        title="Stop Sharing (Revoke)"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-gray-400 text-sm">
                            No active shared links.
                        </div>
                    )}
                </div>
            </div>

            {/* 3. SECURITY ACCESS LOGS */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Security Access Logs
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Document</th>
                      <th className="px-4 py-3 font-medium">IP Address</th>
                      <th className="px-4 py-3 font-medium">Access Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]">
                            {log.filename}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-blue-600 bg-blue-50/30 rounded w-fit">
                            {log.ipAddress || "Unknown"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                            {new Date(log.accessedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-gray-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Shield className="w-8 h-8 text-gray-200" />
                            <p>No public access detected yet.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* --- SIDE COLUMN: SHORTCUTS (Right 1/3) --- */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Access</h2>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <Link key={cat.name} to={cat.link} className="group p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-center flex flex-col items-center gap-3">
                  <div className={`p-3 rounded-xl ${cat.color} group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* NEW: RENDER 2FA MODAL IF ACTIVE */}
      {show2FA && (
        <TwoFactorSetup onClose={() => setShow2FA(false)} />
      )}

    </div>
  );
};

// ... Subcomponents (StatCard, RecentFileRow) remain same ...
const StatCard = ({ label, count, icon: Icon, className }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${className}`}><Icon className="w-6 h-6" /></div>
      <span className="text-2xl font-bold text-gray-900">{count || 0}</span>
    </div>
    <p className="text-sm text-gray-500 font-medium">{label}</p>
  </div>
);

const RecentFileRow = ({ file }) => {
  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';
  return (
    <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isImage ? 'bg-purple-100 text-purple-600' : isPdf ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          {isImage ? <ImageIcon className="w-5 h-5" /> : isPdf ? <FileText className="w-5 h-5" /> : <File className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate text-sm">{file.filename}</p>
          <p className="text-xs text-gray-400">{new Date(file.uploadedAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></a>
        <a href={file.url.replace('/upload/', '/upload/fl_attachment/')} download className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><Download className="w-4 h-4" /></a>
      </div>
    </div>
  );
};

export default Dashboard;