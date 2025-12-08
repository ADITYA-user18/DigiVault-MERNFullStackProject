import React, { useState, useContext } from "react";
import axios from "../services/axios"; // Use the configured axios instance
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { ShieldCheck, Lock, Mail, KeyRound } from "lucide-react";

// Helper Component for Input Fields
const InputField = ({ label, icon, ...props }) => (
  <div className="mb-5">
    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
      />
    </div>
  </div>
);

const Login = () => {
  const [loginOtpMode, setLoginOtpMode] = useState(false); // Toggle Email OTP mode
  const [is2FAMode, setIs2FAMode] = useState(false); // Toggle Google Authenticator mode
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // For Email OTP flow
  
  // Form State
  const [form, setForm] = useState({ email: "", password: "", otp: "", twoFactorCode: "" });
  const [userIdFor2FA, setUserIdFor2FA] = useState(null); // Store UserID during 2FA step

  const { setUser, navigate } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- 1. PASSWORD LOGIN ---
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password)
      return toast.warning("Please fill in all fields.");

    setLoading(true);
    try {
      const res = await axios.post(`/api/user/verify-pass`, {
        email: form.email,
        password: form.password,
      });

      // 2FA INTERCEPTION
      if (res.data.require2FA) {
        setIs2FAMode(true);
        setUserIdFor2FA(res.data.userId);
        toast.info("Two-Factor Authentication Required");
        setLoading(false);
        return;
      }

      if (res.data.success) {
        toast.success("Login Successful!");
        setUser(res.data.user);
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. GOOGLE AUTH LOGIN ---
  const verify2FA = async (e) => {
    e.preventDefault();
    if (!form.twoFactorCode) return toast.warning("Enter the 6-digit code");

    setLoading(true);
    try {
      // Fix: Ensure route matches backend (api/auth or api/user)
      const res = await axios.post("/api/user/2fa/login", {
        userId: userIdFor2FA,
        token: form.twoFactorCode
      }, { withCredentials: true });

      if (res.data.success) {
        toast.success("Identity Verified!");
        setUser(res.data.user);
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid Code");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. EMAIL OTP LOGIN (AND RECOVERY) ---
  const sendLoginOtp = async () => {
    if (!form.email) return toast.warning("Please enter your email first.");
    setLoading(true);
    try {
      const res = await axios.post(`/api/user/send-login-otp`, { email: form.email });
      if (res.data.success) {
        setOtpSent(true);
        setLoginOtpMode(true);
        toast.success("OTP sent to your email!");
      }
    } catch (error) {
      toast.error("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOtp = async (e) => {
    e.preventDefault();
    if (!form.otp) return toast.warning("Please enter the OTP.");

    setLoading(true);
    try {
      const res = await axios.post(`/api/user/verify-login-otp`, {
        email: form.email,
        otp: form.otp,
      });

      // NOTE: We do NOT intercept for 2FA here anymore.
      // Email verification acts as the "Recovery Method" bypassing Google Auth.

      if (res.data.success) {
        toast.success(res.data.message || "Login Successful!");
        setUser(res.data.user);
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  // --- RECOVERY SWITCH ---
  const switchToRecovery = () => {
    setIs2FAMode(false); // Close Shield UI
    setLoginOtpMode(true); // Open Email OTP UI
    if (form.email) {
        sendLoginOtp(); // Auto-send code if email is known
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md mx-4 bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-8 z-10 animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30 mb-4">
            D
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {is2FAMode ? "Security Check" : "Welcome Back"}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {is2FAMode 
              ? "Please enter the code from your Authenticator App." 
              : (!loginOtpMode ? "Enter your details to access your vault." : "Login securely using a One-Time Password.")
            }
          </p>
        </div>

        {/* --- VIEW 1: GOOGLE AUTHENTICATOR (2FA) --- */}
        {is2FAMode ? (
          <form onSubmit={verify2FA} className="animate-scale-up">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-50 rounded-full">
                <ShieldCheck className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            
            <InputField
              label="Authenticator Code"
              type="text"
              name="twoFactorCode"
              maxLength={6}
              placeholder="123 456"
              autoFocus
              className="text-center text-xl tracking-widest font-mono"
              onChange={handleChange}
              value={form.twoFactorCode}
              icon={<KeyRound className="w-5 h-5" />}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? "Verifying..." : "Verify Identity"}
            </button>

            {/* --- RECOVERY LINK --- */}
            <div className="mt-6 flex flex-col gap-3 text-center">
                <button
                  type="button"
                  onClick={switchToRecovery}
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Lost your phone? Use Email OTP
                </button>

                <button
                  type="button"
                  onClick={() => setIs2FAMode(false)}
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  Back to Login
                </button>
            </div>
          </form>
        ) : (
          /* --- VIEW 2: STANDARD FLOW --- */
          <>
            {!otpSent && (
              <InputField
                label="Email Address"
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                value={form.email}
                icon={<Mail className="w-5 h-5" />}
              />
            )}

            {!loginOtpMode ? (
              // PASSWORD LOGIN
              <form onSubmit={handlePasswordLogin} className="animate-fade-in">
                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  value={form.password}
                  icon={<Lock className="w-5 h-5" />}
                />

                <div className="flex justify-end mb-6">
                  <button
                    type="button"
                    onClick={() => setLoginOtpMode(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center">
                  {loading ? "Logging in..." : "Login"}
                </button>

                <div className="mt-6 text-center">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
                  <button type="button" onClick={() => setLoginOtpMode(true)} className="mt-2 text-sm text-gray-600 hover:text-blue-600">
                    Login with Email OTP
                  </button>
                </div>
              </form>
            ) : (
              // EMAIL OTP LOGIN
              <div className="animate-fade-in-up">
                {!otpSent ? (
                  <div className="mt-2">
                    <button onClick={sendLoginOtp} disabled={loading} className="w-full py-3 px-4 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 mb-4">
                      {loading ? "Sending..." : "Send Verification Code"}
                    </button>
                    <button onClick={() => setLoginOtpMode(false)} className="w-full text-center text-sm text-gray-500">Cancel</button>
                  </div>
                ) : (
                  <form onSubmit={verifyLoginOtp}>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <p className="text-xs text-blue-800">Code sent to <span className="font-bold">{form.email}</span></p>
                    </div>

                    <InputField label="Enter OTP" type="number" name="otp" placeholder="123456" autoFocus value={form.otp} onChange={handleChange} icon={<KeyRound className="w-5 h-5" />} />

                    <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center">
                      {loading ? "Verifying..." : "Verify & Login"}
                    </button>

                    <div className="mt-4 flex justify-between items-center text-sm">
                      <button type="button" onClick={() => setLoginOtpMode(false)} className="text-gray-500 hover:text-gray-800">Use Password</button>
                      <button type="button" onClick={sendLoginOtp} className="text-blue-600 font-semibold hover:underline">Resend Code</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </>
        )}

        {!is2FAMode && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Sign up</Link></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;