import React from "react";
import { GraduationCap, ArrowUp, Lock } from "lucide-react";

interface FooterProps {
  setView: (view: string) => void;
}

export default function Footer({ setView }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-footer" className="bg-dark text-white pt-16 pb-8 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Upper footer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 mb-12 border-b border-white/5">
          {/* Logo brand & description */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-secondary p-2 rounded-xl text-dark">
                <GraduationCap className="h-5 w-5" />
              </div>
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
              +৮৮০ ১৭১২-৩৪৫৬৭৮
            </p>
          </div>
        </div>

        {/* Lower footer copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p id="copyright-label">
            © {currentYear} প্রস্তুতি ঢাবি। সর্বস্বত্ব সংরক্ষিত।
          </p>

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
