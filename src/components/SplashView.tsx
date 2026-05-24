import React, { useEffect, useState } from "react";
import { ShieldAlert, Cpu, Radio, CheckCircle2 } from "lucide-react";

interface SplashViewProps {
  onComplete: () => void;
}

export function SplashView({ onComplete }: SplashViewProps) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  const logs = [
    "Contacting satellite navigation arrays...",
    "Calibrating micro-accelerometers (G-force Threshold: 4.5G)...",
    "Calibrating gyroscopic drift stabilizers...",
    "Registering hand-slip handovers & rotation sensors...",
    "Establishing secure full-stack API tunnel...",
    "Quick Rescue protective mesh active. Ready."
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    const logInterval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < logs.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen w-full bg-brand-dark p-6" id="splash-view">
      {/* Upper Spacing Header */}
      <div className="flex items-center space-x-2 mt-8 opacity-60">
        <Cpu className="w-4 h-4 text-brand-red animate-pulse" />
        <span className="font-mono text-[10px] tracking-wider uppercase">QuickRescue Engine v3.8</span>
      </div>

      {/* Center Brand */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-brand-red/20 blur-xl animate-pulse"></div>
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-red to-orange-500 flex items-center justify-center border border-white/20 shadow-lg">
            <ShieldAlert className="w-12 h-12 text-white animate-bounce" />
          </div>
          {/* Circular Orbit Ring */}
          <div className="absolute -inset-4 rounded-full border border-dashed border-brand-red/30 animate-spin" style={{ animationDuration: '10s' }}></div>
        </div>

        <h1 className="font-display font-bold text-3xl tracking-tight text-white select-none">
          QUICK <span className="text-brand-red font-extrabold text-[#ff4c4c]">RESCUE</span>
        </h1>
        <p className="text-xs text-gray-400 mt-2 tracking-wide font-light select-none">
          Autonomous Accident Protection Mesh
        </p>
      </div>

      {/* Diagnostics Logger & Progress */}
      <div className="w-full max-w-xs space-y-4 mb-8">
        <div className="glass-panel p-3 rounded-xl border border-white/5 space-y-2">
          <div className="flex justify-between text-[11px] font-mono text-gray-400">
            <span>DIAGNOSTICS</span>
            <span className="text-brand-red font-bold">{progress}%</span>
          </div>

          <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-red transition-all duration-300 ease-out shadow-[0_0_10px_rgb(255,60,60)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Scrolling Log Stream */}
          <div className="h-10 overflow-hidden text-center mt-1">
            <div className="flex items-center justify-center space-x-1.5 transition-all duration-300 transform translate-y-0.5">
              {progress < 100 ? (
                <Radio className="w-3 h-3 text-brand-red animate-spin flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              )}
              <span className="font-mono text-[10px] text-gray-400 truncate max-w-[240px]">
                {logs[logIndex]}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-gray-500 font-mono tracking-wide">
            AUTOMATIC CRASH DETECTOR ACTIVE • SECURE DATA STREAM
          </p>
        </div>
      </div>
    </div>
  );
}
