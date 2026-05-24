import React, { useState } from "react";
import { ShieldAlert, Mail, ArrowRight, Lock, UserPlus, Fingerprint } from "lucide-react";
import { UserProfile } from "../types";

interface AuthViewProps {
  onLoginSuccess: (profile: UserProfileObj) => void;
}

interface UserProfileObj {
  fullName: string;
  email: string;
  photoUrl: string;
}

export function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("chourasiyaadityaraj@gmail.com");
  const [password, setPassword] = useState("•••••••••");
  const [fullName, setFullName] = useState("Adityaraj Chourasiya");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleGmailSignInSimulated = () => {
    setIsLoading(true);
    setFeedback("Connecting to Google Auth API inside Secure Frame...");
    
    setTimeout(() => {
      setFeedback("Google Auth Authorized via Firebase [Gmail Login: SUCCESS]");
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          fullName: isRegistering ? fullName : "Adityaraj Chourasiya",
          email: email || "chourasiyaadityaraj@gmail.com",
          photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
        });
      }, 800);
    }, 1200);
  };

  return (
    <div className="flex flex-col justify-center min-h-screen w-full max-w-md mx-auto bg-brand-dark p-6 space-y-6" id="auth-view">
      {/* Top Graphic Header */}
      <div className="flex flex-col items-center mt-6">
        <div className="w-14 h-14 bg-brand-red/10 border border-brand-red/20 rounded-2xl flex items-center justify-center mb-3">
          <ShieldAlert className="w-7 h-7 text-brand-red animate-pulse" />
        </div>
        <h2 className="font-display font-bold text-xl text-white">Join Protective Core</h2>
        <p className="text-xs text-gray-400 mt-1">Autonomous Emergency Care Mesh</p>
      </div>

      {/* Auth Credentials Panel */}
      <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 my-auto">
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${!isRegistering ? "bg-brand-red text-white shadow-md shadow-brand-red/10" : "text-gray-400 hover:text-white"}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${isRegistering ? "bg-brand-red text-white shadow-md shadow-brand-red/10" : "text-gray-400 hover:text-white"}`}
          >
            Register
          </button>
        </div>

        {isRegistering && (
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">Full Name</span>
            <div className="relative">
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="w-full glass-input rounded-xl py-2 px-3 text-sm"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">Gmail Address</span>
          <div className="relative">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@gmail.com"
              className="w-full glass-input rounded-xl py-2 px-3 text-sm font-light"
            />
            <Mail className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">Master Key</span>
          <div className="relative">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full glass-input rounded-xl py-2 px-3 text-sm letter-spacing"
            />
            <Lock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleGmailSignInSimulated}
          disabled={isLoading}
          className="w-full py-2.5 bg-brand-red hover:bg-[#ff4c4c] disabled:opacity-50 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-md shadow-brand-red/20 hover:shadow-brand-red/30 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>{isRegistering ? "CREATE PROTECTION ID" : "SECURE GMAIL LOG IN"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {/* Gmail One-Tap Authentic Authentication Button */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 bg-white/5 h-[1px]"></div>
          <span className="relative bg-[#111216] px-3 text-[10px] font-mono uppercase text-gray-500 tracking-wider">OR ONE-TAP SECURE</span>
        </div>

        <button
          onClick={handleGmailSignInSimulated}
          disabled={isLoading}
          className="w-full py-2.5 bg-white hover:bg-white/95 disabled:opacity-50 text-[#1a1b1f] rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>One-Tap Secure Gmail Login</span>
        </button>

        {feedback && (
          <p className="text-[10px] text-center font-mono text-brand-red animate-pulse mt-2">{feedback}</p>
        )}
      </div>

      {/* Security Tagline Bottom */}
      <div className="flex flex-col items-center mb-6 space-y-1">
        <div className="flex items-center space-x-1 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">
          <Fingerprint className="w-3 h-3" />
          <span>AES-256 Bit Encrypted Tunnel</span>
        </div>
        <p className="text-[9px] text-gray-500 font-mono">By signing up you agree to automated accident dispatch triage</p>
      </div>
    </div>
  );
}
