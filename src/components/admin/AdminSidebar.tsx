import React from "react";
import { 
  Building2, 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  Settings, 
  LogOut, 
  GraduationCap 
} from "lucide-react";

interface AdminSidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onLogout: () => void;
  statsPending: number;
}

export default function AdminSidebar({ currentTab, setTab, onLogout, statsPending }: AdminSidebarProps) {
  const tabs = [
    { id: "overview", label: "ড্যাশবোর্ড", icon: <Building2 className="h-5 w-5" /> },
    { id: "courses", label: "কোর্স ব্যবস্থাপনা", icon: <BookOpen className="h-5 w-5" /> },
    { id: "teachers", label: "শিক্ষক ব্যবস্থাপনা", icon: <Users className="h-5 w-5" /> },
    { id: "enrollments", label: "ভর্তি আবেদন", icon: <ClipboardCheck className="h-5 w-5" />, badge: statsPending },
    { id: "settings", label: "সেটিংস ও কনফিগ", icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <aside id="admin-sidebar" className="bg-dark text-white w-full md:w-64 min-h-screen border-r border-white/5 flex flex-col justify-between p-6">
      {/* Upper Logo header */}
      <div className="space-y-8">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-6">
          <div className="bg-secondary p-1.5 rounded-lg text-dark">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-white leading-none">
              ম্যানেজমেন্ট পোর্টাল
            </h2>
            <p className="text-[10px] text-secondary font-sans uppercase tracking-[0.12em] mt-1">
              PROSTUTI DHABI
            </p>
          </div>
        </div>

        {/* Tab links */}
        <nav className="flex flex-col space-y-1.5">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-btn-${tab.id}`}
                onClick={() => setTab(tab.id)}
                className={`flex items-center justify-between w-full p-3.5 rounded-xl text-sm font-bold text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-secondary text-dark shadow-[0_4px_15px_rgba(212,160,23,0.15)]"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`className="text-[10px] w-5 h-5 flex items-center justify-center font-sans font-bold rounded-full ${
                    isActive ? "bg-dark text-white" : "bg-red-500 text-white animate-pulse"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout triggers */}
      <div className="border-t border-white/5 pt-6 mt-8">
        <button
          id="admin-logout-sidebar-btn"
          onClick={onLogout}
          className="flex items-center space-x-3 text-white/55 hover:text-red-400 font-bold text-sm w-full p-3 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>লগআউট করুন</span>
        </button>
      </div>
    </aside>
  );
}
