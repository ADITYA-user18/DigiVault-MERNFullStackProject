import React, { useState, useRef, useEffect } from "react";
import axios from "../services/axios";
import { X, Send, Bot, User, FileText, Loader2, Sparkles } from "lucide-react";

const FileChatModal = ({ file, onClose }) => {
  const [messages, setMessages] = useState([
    { role: "system", text: `Hello! I've read "${file.filename}". Ask me anything about it.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuestion = input;
    setInput(""); 
    
    // Add User Message
    setMessages(prev => [...prev, { role: "user", text: userQuestion }]);
    setLoading(true);

    try {
      // Send to Backend (which calls Gemini)
      const res = await axios.post("/api/ai/chat", {
        fileUrl: file.url,
        mimeType: file.mimeType,
        question: userQuestion
      }, { withCredentials: true });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: "ai", text: res.data.answer }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: "Error: Unable to analyze document. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col h-[600px] animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Assistant</h3>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <FileText className="w-3 h-3" /> {file.filename.substring(0, 25)}...
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role !== "user" && <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0"><Bot className="w-5 h-5 text-blue-600" /></div>}
              <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-700 border border-gray-100 rounded-bl-none"}`}>
                {msg.text}
              </div>
              {msg.role === "user" && <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0"><User className="w-5 h-5 text-gray-500" /></div>}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
               <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><Bot className="w-5 h-5 text-blue-600" /></div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-blue-500" /><span className="text-xs text-gray-400">Gemini is thinking...</span></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
          <div className="relative flex items-center">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this document..." className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm" />
            <button type="submit" disabled={loading || !input.trim()} className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"><Send className="w-4 h-4" /></button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileChatModal;