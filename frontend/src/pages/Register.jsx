import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api";
import {
  Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (step === 2) inputRefs.current[0]?.focus();
  }, [step]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validateStep1 = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Please fill in all fields"); return false;
    }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return false; }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    try {
      await authAPI.sendOTP({ email: form.email, name: form.name });
      toast.success(`OTP sent to ${form.email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length))}`);
      setStep(2); setTimer(300);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await authAPI.sendOTP({ email: form.email, name: form.name });
      toast.success("OTP resent"); setOtp(["", "", "", "", "", ""]); setTimer(300);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally { setResending(false); }
  };

  const handleVerifyAndRegister = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) { toast.error("Please enter the full 6-digit OTP"); return; }
    setLoading(true);
    try {
      const userData = await authAPI.verifyOTP({ email: form.email, otp: otpCode, name: form.name, password: form.password });
      setUser(userData); toast.success("Account created successfully!"); navigate("/faq");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]); inputRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden gradient-hero px-4 py-8">
      <div className="orb w-80 h-80 bg-purple-500 -top-20 -right-20" />
      <div className="orb w-60 h-60 bg-indigo-500 bottom-10 -left-10" />

      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-xl shadow-indigo-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{step === 1 ? "Create account" : "Verify email"}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{step === 1 ? "Join the community" : "Enter the OTP sent to your email"}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "gradient-primary text-white shadow-lg shadow-indigo-500/20" : "glass text-gray-400"}`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s === 1 && <div className={`w-16 h-1 rounded-full transition-all duration-500 ${step >= 2 ? "gradient-primary" : "bg-gray-200 dark:bg-gray-700"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card-glass p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" autoFocus className="input-glass" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input-glass" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 chars" className="input-glass" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat password" className="input-glass" />
                  </div>
                </div>
              </div>
              <button type="button" onClick={handleSendOTP} disabled={loading} className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 text-base disabled:opacity-50">
                <span>{loading ? "Sending..." : "Send OTP"}</span>
                {!loading && <ShieldCheck className="w-4 h-4 relative z-10" />}
              </button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold">Sign in</Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card-glass p-8 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mb-3 shadow-lg">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter the 6-digit code sent to<br />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{form.email}</span>
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5">
                {otp.map((digit, i) => (
                  <input
                    key={i} ref={(el) => (inputRefs.current[i] = el)} type="text" inputMode="numeric" maxLength={1}
                    value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl glass dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                ))}
              </div>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-xs text-gray-400">Resend available in <span className="font-medium text-gray-600 dark:text-gray-300">{formatTime(timer)}</span></p>
                ) : (
                  <button type="button" onClick={handleResendOTP} disabled={resending} className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold disabled:opacity-50">
                    {resending ? "Resending..." : "Resend OTP"}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); }}
                  className="px-4 py-3 glass font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={handleVerifyAndRegister} disabled={loading || otp.join("").length !== 6}
                  className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                  <span>{loading ? "Verifying..." : "Verify & Register"}</span>
                  {!loading && <ArrowRight className="w-4 h-4 relative z-10" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
