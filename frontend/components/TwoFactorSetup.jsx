import React, { useState } from "react";
import axios from "../services/axios";
import { toast } from "react-toastify";
import { QrCode, ShieldCheck, X, Loader2 } from "lucide-react";

const TwoFactorSetup = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1 = QR, 2 = Success
  const [qrImage, setQrImage] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Load QR Code on Mount
  React.useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await axios.post("/api/user/2fa/setup", {}, { withCredentials: true });
        if (res.data.success) setQrImage(res.data.qrCode);
      } catch (err) {
        toast.error("Failed to load 2FA setup");
        onClose();
      }
    };
    fetchQR();
  }, []);

  // 2. Verify Code
  const handleVerify = async () => {
    if (!otp) return toast.warning("Enter the code");
    try {
      setLoading(true);
      const res = await axios.post("/api/user/2fa/verify", { token: otp }, { withCredentials: true });
      if (res.data.success) {
        setStep(2); // Show Success Screen
        toast.success("2FA Enabled Successfully!");
      }
    } catch (err) {
      toast.error("Invalid Code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-scale-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        
        {step === 1 ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Enable 2FA Security</h2>
            <p className="text-sm text-gray-500 mb-6">Scan this with Google Authenticator.</p>
            
            {qrImage ? (
              <img src={qrImage} alt="QR Code" className="w-48 h-48 mx-auto mb-6 border-4 border-gray-100 rounded-lg" />
            ) : (
              <div className="h-48 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500"/></div>
            )}

            <input 
              type="text" 
              placeholder="Enter 6-digit code" 
              value={otp} 
              maxLength={6}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text-center text-xl tracking-widest px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none mb-4"
            />

            <button 
              onClick={handleVerify} 
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
            >
              {loading ? "Verifying..." : "Verify & Enable"}
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Secure & Ready!</h2>
            <p className="text-sm text-gray-500 mb-6">Two-factor authentication is now active on your account.</p>
            <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;