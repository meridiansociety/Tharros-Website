"use client";

import { motion } from "motion/react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl border border-slate-200 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-100 border-t-accent-3 animate-spin" />
        </div>
        <div className="absolute -inset-4 bg-accent-3/5 blur-2xl rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] animate-pulse">Initializing_System</span>
        <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full bg-accent-3"
          />
        </div>
      </div>
    </div>
  );
}
