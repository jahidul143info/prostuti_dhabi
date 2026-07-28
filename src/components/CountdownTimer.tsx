import React, { useState, useEffect } from "react";
import { Clock, Flame } from "lucide-react";

interface CountdownTimerProps {
  endTime: string;
  label?: string;
  variant?: "card" | "detail";
}

// Convert numbers to Bengali digits
export function toBengaliNumber(num: number | string): string {
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let str = num.toString();
  for (let i = 0; i < 10; i++) {
    str = str.replaceAll(englishDigits[i], bengaliDigits[i]);
  }
  return str;
}

export default function CountdownTimer({ endTime, label = "অফার শেষ হতে বাকি:", variant = "card" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      if (!endTime) return;
      const target = new Date(endTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (!endTime) return null;

  if (timeLeft.isExpired) {
    return (
      <div className={variant === "card" 
        ? "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 text-[10px] font-bold border border-red-500/20"
        : "p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center text-red-700 text-xs font-bold font-sans"
      }>
        <Clock className="w-3.5 h-3.5 text-red-500 animate-pulse" />
        <span>ভর্তির জন্য নির্ধারিত সময় শেষ হয়েছে!</span>
      </div>
    );
  }

  const format2 = (n: number) => n < 10 ? `0${n}` : `${n}`;

  // Card layout (compact)
  if (variant === "card") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border border-red-500/20 text-dark font-sans text-[11px] shadow-xs">
        <Flame className="w-3.5 h-3.5 text-red-500 animate-bounce shrink-0" />
        <span className="text-[10px] text-gray-600 font-bold hidden sm:inline">{label}</span>
        <div className="flex items-center gap-1 font-mono font-extrabold text-red-600 text-xs">
          {timeLeft.days > 0 && <span>{toBengaliNumber(timeLeft.days)}দিন </span>}
          <span>{toBengaliNumber(format2(timeLeft.hours))}:</span>
          <span>{toBengaliNumber(format2(timeLeft.minutes))}:</span>
          <span className="text-red-500">{toBengaliNumber(format2(timeLeft.seconds))}</span>
        </div>
      </div>
    );
  }

  // Detail View layout (Rich Banner)
  return (
    <div className="bg-gradient-to-r from-dark via-primary to-dark p-5 rounded-3xl text-white shadow-lg border border-secondary/20 relative overflow-hidden my-4">
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary/10 rounded-full blur-xl pointer-events-none" />
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="p-2.5 rounded-2xl bg-secondary/20 border border-secondary/30 text-secondary">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-secondary font-black uppercase tracking-widest block">সীমিত সময়ের সুযোগ</span>
            <h4 className="text-sm sm:text-base font-extrabold text-white">{label}</h4>
          </div>
        </div>

        {/* 4 Countdown Blocks */}
        <div className="flex items-center gap-2 font-mono text-center">
          <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15 min-w-[50px]">
            <span className="block text-base sm:text-lg font-black text-secondary">{toBengaliNumber(timeLeft.days)}</span>
            <span className="text-[9px] font-sans text-white/70 block uppercase">দিন</span>
          </div>
          <span className="text-secondary font-bold text-lg">:</span>
          <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15 min-w-[50px]">
            <span className="block text-base sm:text-lg font-black text-white">{toBengaliNumber(format2(timeLeft.hours))}</span>
            <span className="text-[9px] font-sans text-white/70 block uppercase">ঘণ্টা</span>
          </div>
          <span className="text-secondary font-bold text-lg">:</span>
          <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15 min-w-[50px]">
            <span className="block text-base sm:text-lg font-black text-white">{toBengaliNumber(format2(timeLeft.minutes))}</span>
            <span className="text-[9px] font-sans text-white/70 block uppercase">মিঃ</span>
          </div>
          <span className="text-secondary font-bold text-lg">:</span>
          <div className="bg-white/10 backdrop-blur-md px-[#10px] py-2 rounded-xl border border-red-400/40 bg-red-500/20 min-w-[50px]">
            <span className="block text-base sm:text-lg font-black text-red-300 animate-pulse">{toBengaliNumber(format2(timeLeft.seconds))}</span>
            <span className="text-[9px] font-sans text-white/70 block uppercase">সেঃ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
