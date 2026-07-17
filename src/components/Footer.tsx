import React from "react";
import { GraduationCap, ArrowUp, Lock } from "lucide-react";
import { AdminConfig } from "../lib/types";

interface FooterProps {
  setView: (view: string) => void;
  config?: Partial<AdminConfig> | null;
}

export default function Footer({ setView, config }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();
  
  // Convert Bengali digits to English digits
  const convertBengaliToEnglish = (str: string): string => {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return str.replace(/[০-৯]/g, (digit) => {
      const idx = banglaDigits.indexOf(digit);
      return idx !== -1 ? idx.toString() : digit;
    });
  };

  const helpline = convertBengaliToEnglish(config?.helpline_number || "+880 1712-345678");

  return (
    <footer id="main-footer" className="bg-dark text-white pt-16 pb-8 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Upper footer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 mb-12 border-b border-white/5">
          {/* Logo brand & description */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center space-x-2.5">
              <img
                src="https://ziydyorjdctwisatbvwp.supabase.co/storage/v1/object/public/others/photo_2026-05-22_00-09-37.jpg"
                alt="Logo"
                referrerPolicy="no-referrer"
                className="h-8 w-8 object-cover rounded-lg border border-white/10"
              />
              <span className="text-xl font-bold tracking-tight">
                প্রস্তুতি <span className="text-secondary font-extrabold">ঢাবি</span>
              </span>
            </div>
            <p className="text-white/60 text-xs sm:text-sm max-w-sm leading-relaxed">
              ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষায় সাফল্যের এক নির্ভরযোগ্য সহযাত্রী। দেশসেরা গবেষক ও শিক্ষকমণ্ডলী দ্বারা প্রণীত অনন্য এডটেক প্ল্যাটফর্ম।
            </p>
          </div>

          {/* Quick links columns */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wide">মডিউল</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/55">
              <li>
                <button
                  onClick={() => {
                    setView("home");
                    setTimeout(() => document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="hover:text-secondary cursor-pointer transition-colors"
                >
                  সমস্ত কোর্সসমূহ
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView("home");
                    setTimeout(() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="hover:text-secondary cursor-pointer transition-colors"
                >
                  আমাদের সম্পর্কে বিস্তারিত
                </button>
              </li>
            </ul>
          </div>

          {/* Support Helpline columns */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wide">হেল্পলাইন</h4>
            <p className="text-white/55 text-xs sm:text-sm">
              শনি থেকে বৃহস্পতিবার: সকাল ১০টা — রাত ১০টা
            </p>
            <p className="text-secondary text-base font-extrabold font-sans">
              {helpline}
            </p>
          </div>
        </div>

        {/* Lower footer copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div className="flex flex-col items-center sm:items-start space-y-1">
            <p id="copyright-label">
              © {currentYear} প্রস্তুতি ঢাবি। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-secondary/10 via-emerald-500/5 to-secondary/10 border border-secondary/20 shadow-[0_0_15px_rgba(242,180,46,0.08)] hover:shadow-[0_0_20px_rgba(242,180,46,0.18)] hover:border-secondary/40 transition-all duration-300 group">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <p className="text-[11px] text-white/85 leading-relaxed font-sans text-center sm:text-left">
                Developed & Technical Support: <span className="text-secondary font-black tracking-wide text-xs drop-shadow-[0_0_6px_rgba(242,180,46,0.4)]">MD JAHIDUL ISLAM</span> <span className="opacity-70 text-[10px]">(Department of Management Studies, 20th Batch, Jagannath University)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            {/* Scroll back to top */}
            <button
              onClick={scrollToTop}
              className="bg-white/5 hover:bg-white/15 p-2.5 rounded-full hover:text-white transition cursor-pointer"
              title="উপরে যান"
            >
              <ArrowUp className="h-4 w-4" />
            </button>

            {/* Hidden subtle admin panel link */}
            <button
              id="footer-admin-link"
              onClick={() => setView("admin-login")}
              className="hover:text-secondary text-[11px] font-sans flex items-center space-x-1 border border-white/10 rounded px-2 py-1 transition-colors"
            >
              <Lock className="h-3 w-3" />
              <span>Admin Setup</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
