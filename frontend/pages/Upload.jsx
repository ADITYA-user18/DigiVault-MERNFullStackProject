import React, { useState, useRef } from "react";
import axios from "../services/axios.js";
import {
  CloudUpload,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileType,
  Tag // Added Tag icon
} from "lucide-react";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // NEW: Category State
  const [category, setCategory] = useState("Others");
  
  const fileInputRef = useRef(null);

  const categories = ['Identity', 'Medical', 'Education', 'Work', 'Financial', 'Others'];

  // --- Handlers ---

  const validateAndSetFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Unsupported file type! Only PDF, JPG, PNG, DOCX.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size exceeds 10MB limit." });
      return;
    }

    setSelectedFile(file);
    setPreview(
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    );
    setMessage(null);
    setProgress(0);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setMessage(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    // NEW: Append Category
    formData.append("category", category);

    try {
      setMessage(null);
      const response = await axios.post("/api/file/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
        withCredentials: true,
      });

      setMessage({
        type: "success",
        text: "File encrypted, categorized & uploaded successfully!",
      });
      console.log(response.data.file);

      // Optional: Clear file after success after a delay
      setTimeout(() => removeFile(), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ type: "error", text: "Upload failed. Please try again." });
      setProgress(0);
    }
  };

  // Helper to determine icon based on file type
  const getFileIcon = () => {
    if (!selectedFile)
      return <CloudUpload className="w-10 h-10 text-blue-400" />;
    if (selectedFile.type.startsWith("image/"))
      return <ImageIcon className="w-8 h-8 text-purple-500" />;
    if (selectedFile.type.includes("pdf"))
      return <FileText className="w-8 h-8 text-red-500" />;
    return <FileType className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative overflow-hidden flex items-center justify-center pt-20 pb-10 px-4">
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-gray-50 to-white"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse mix-blend-multiply -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[100px] animate-pulse -z-10" />

      {/* --- Main Card --- */}
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-900/5 rounded-3xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-white px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CloudUpload className="w-6 h-6 text-blue-600" />
              Upload Documents
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Add files to your secure digital vault.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            AES-256 ENCRYPTED
          </div>
        </div>

        <div className="p-8">
          
          {/* --- NEW: Category Selection --- */}
          <div className="mb-8">
            <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-500" />
              Categorize this document
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border
                    ${category === cat 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20" 
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* --- Drop Zone --- */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group
              ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 scale-[1.02]"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }
              ${selectedFile ? "hidden" : "block"}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <div
              className={`p-4 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 ${
                isDragging ? "bg-blue-100" : "bg-blue-50"
              }`}
            >
              <CloudUpload
                className={`w-10 h-10 ${
                  isDragging ? "text-blue-600" : "text-blue-500"
                }`}
              />
            </div>

            <p className="text-lg font-semibold text-gray-700">
              {isDragging
                ? "Drop your file here"
                : "Click to upload or drag & drop"}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              SVG, PNG, JPG, PDF or DOCX (max. 10MB)
            </p>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* --- Selected File Preview --- */}
          {selectedFile && (
            <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <button
                onClick={removeFile}
                className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getFileIcon()
                  )}
                </div>

                <div className="flex-1 w-full text-center sm:text-left">
                  <h4 className="text-lg font-bold text-gray-900 truncate max-w-[300px]">
                    {selectedFile.name}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                    {selectedFile.type.split("/")[1].toUpperCase()}
                  </p>
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-md">
                    {category}
                  </span>

                  {progress > 0 && (
                    <div className="w-full mt-4">
                      <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- Status Messages --- */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-fade-in
              ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }
            `}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          )}

          {/* --- Action Button --- */}
          <div className="mt-8">
            <button
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform duration-200
                ${
                  !selectedFile || progress > 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-blue-500/30 hover:-translate-y-1 hover:shadow-xl"
                }
              `}
              onClick={handleUpload}
              disabled={!selectedFile || progress > 0}
            >
              {progress > 0
                ? progress === 100
                  ? "Processing..."
                  : "Uploading..."
                : "Upload to Secure Vault"}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Your files are encrypted before being stored. No one else can access them.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upload;