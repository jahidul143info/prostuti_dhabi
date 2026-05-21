import React, { useState, useEffect } from "react";
import { GraduationCap, Menu, X, Settings2, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  currentView: string;
  setView: (view: string, courseId?: string) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export default function Navbar({ currentView, setView, isAdminLoggedIn, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "হোম", target: "home", id: "nav-home" },
    { label: "কোর্সসমূহ", target: "courses", id: "nav-courses" },
    { label: "আমাদের সম্পর্কে", target: "about", id: "nav-about" },
    { label: "যোগাযোগ", target: "connect", id: "nav-connect" }
  ];

  const handleNavClick = (target: string) => {
    setIsOpen(false);
    if (target === "home") {
      setView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setView("home");
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-primary/90 backdrop-blur-md shadow-lg border-b border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo Brand */}
          <div
            id="nav-logo-btn"
            onClick={() => setView("home")}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="bg-secondary p-2 rounded-xl text-dark flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-[0_0_15px_rgba(212,160,23,0.3)]">
              <GraduationCap className="h-6 w-6" id="nav-logo-icon" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight" id="nav-logo-title">
                প্রস্তুতি <span className="text-secondary font-extrabold">ঢাবি</span>
              </span>
              <p className="text-[10px] text-accent/80 tracking-widest font-sans uppercase -mt-1">
                Dhaka University Prep
              </p>
            </div>
          </div>

          {/* Desktop Nav Selection */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.target}
                  id={item.id}
                  onClick={() => handleNavClick(item.target)}
                  className="text-white/80 hover:text-secondary font-medium transition-colors duration-200 cursor-pointer text-[15px]"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick Admin Shortcut status */}
            <div className="flex items-center border-l border-white/10 pl-6 space-x-3">
              {isAdminLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <button
                    id="nav-admin-dashboard-btn"
                    onClick={() => setView("admin-dashboard")}
                    className="flex items-center space-x-1.5 bg-secondary/20 hover:bg-secondary/35 text-secondary text-xs px-3 py-1.5 rounded-lg border border-secondary/30 transition-all cursor-pointer font-medium"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>ড্যাশবোর্ড</span>
                  </button>
                  <button
                    id="nav-logout-btn"
                    onClick={onLogout}
                    className="text-white/60 hover:text-red-400 text-xs transition duration-200"
                  >
                    লগআউট
                  </button>
                </div>
              ) : (
                <button
                  id="nav-admin-login-link"
                  onClick={() => setView("admin-login")}
                  className="text-white/50 hover:text-secondary text-xs flex items-center space-x-1 transition duration-200"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  <span>অ্যাডমিন</span>
                </button>
              )}
            </div>
          </div>

          {/* Responsive Mobile burger */}
          <div className="flex md:hidden items-center">
            <button
              id="mobile-menu-burger"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-secondary p-1"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer Overlay for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark/95 border-b border-primary/40 backdrop-blur-xl"
            id="mobile-nav-panel"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.target}
                  id={`m-${item.id}`}
                  onClick={() => handleNavClick(item.target)}
                  className="block w-full text-left text-white/90 hover:text-secondary py-2 border-b border-white/5 font-medium transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 flex items-center justify-between">
                {isAdminLoggedIn ? (
                  <>
                    <button
                      id="mobile-nav-dash-btn"
                      onClick={() => {
                        setIsOpen(false);
                        setView("admin-dashboard");
                      }}
                      className="bg-secondary text-dark text-sm py-2 px-4 rounded-xl font-bold flex items-center space-x-1"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>ড্যাশবোর্ড প্রবেশ করুন</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onLogout();
                      }}
                      className="text-white/65 text-xs py-2 px-4 underline"
                    >
                      লগআউট
                    </button>
                  </>
                ) : (
                  <button
                    id="mobile-nav-admin-login"
                    onClick={() => {
                      setIsOpen(false);
                      setView("admin-login");
                    }}
                    className="text-white/40 hover:text-secondary text-xs flex items-center space-x-1"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    <span>ম্যানেজমেন্ট লগইন</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
