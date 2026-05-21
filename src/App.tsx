import React, { useState, useEffect } from "react";
import { 
  Building2, 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  Clock, 
  Settings, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit2, 
  Plus, 
  GraduationCap, 
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  FolderMinus,
  Save,
  Lock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
import { Course, Teacher, Enrollment, AdminConfig } from "./lib/types";

// Client Core Components
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import CourseGrid from "./components/CourseGrid";
import AboutSection from "./components/AboutSection";
import ConnectSection from "./components/ConnectSection";
import Footer from "./components/Footer";
import CourseDetailView from "./components/CourseDetailView";

// Admin Panel Components
import AdminSidebar from "./components/admin/AdminSidebar";
import CourseForm from "./components/admin/CourseForm";
import TeacherForm from "./components/admin/TeacherForm";
import EnrollmentTable from "./components/admin/EnrollmentTable";

export default function App() {
  // Views navigation router
  const [currentView, setCurrentView] = useState<"home" | "course-detail" | "admin-login" | "admin-dashboard">("home");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Unified global storage states
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [config, setConfig] = useState<Partial<AdminConfig> | null>(null);
  const [fetching, setFetching] = useState(true);

  // Authentication State
  const [adminToken, setAdminToken] = useState<string>(() => {
    return localStorage.getItem("prostuti_dhabi_admin_token") || "";
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Active Admin Subpages Control
  const [activeAdminTab, setActiveAdminTab] = useState<string>("overview");

  // Admin Actions Crud triggers
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);

  // Admin Settings modifications states
  const [fbUrlInput, setFbUrlInput] = useState("");
  const [ytUrlInput, setYtUrlInput] = useState("");
  const [waNumInput, setWaNumInput] = useState("");
  const [bkashNumInput, setBkashNumInput] = useState("");
  const [nagadNumInput, setNagadNumInput] = useState("");
  const [aboutTextInput, setAboutTextInput] = useState("");
  const [aboutMissionInput, setAboutMissionInput] = useState("");
  const [adminNewPasswordInput, setAdminNewPasswordInput] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState({ success: false, error: "" });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Handle Initial Application Data Queries
  const loadInitialData = async () => {
    setFetching(true);
    try {
      // 1. Config retrieve
      const configRes = await fetch("/api/config");
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
        // Pre-fill inputs for administrative configurations
        setFbUrlInput(configData.facebook_url || "");
        setYtUrlInput(configData.youtube_url || "");
        setWaNumInput(configData.whatsapp_number || "");
        setBkashNumInput(configData.bkash_number || "");
        setNagadNumInput(configData.nagad_number || "");
        setAboutTextInput(configData.about_text || "");
        setAboutMissionInput(configData.about_mission || "");
      }

      // 2. Published Courses
      const coursesRes = await fetch("/api/courses");
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }

      // 3. Teachers lists
      const teachersRes = await fetch("/api/teachers");
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData);
      }
    } catch (err) {
      console.error("Error loading application states", err);
    } finally {
      setFetching(false);
    }
  };

  // Run on first load
  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch admin confidential records if logged in
  const loadAdminAuthorizedRecords = async () => {
    if (!adminToken) return;
    try {
      // 1. All courses (draft + active)
      const resCourses = await fetch("/api/courses?admin=true");
      if (resCourses.ok) {
        const coursesData = await resCourses.json();
        setCourses(coursesData);
      }

      // 2. Retrieve enrollments
      const resEnroll = await fetch("/api/admin/enrollments", {
        headers: { "x-admin-token": adminToken }
      });
      if (resEnroll.ok) {
        const enrollsData = await resEnroll.json();
        setEnrollments(enrollsData);
      }
    } catch (error) {
      console.error("Failed loading authorized records", error);
    }
  };

  useEffect(() => {
    if (adminToken && currentView === "admin-dashboard") {
      loadAdminAuthorizedRecords();
    }
  }, [adminToken, currentView]);

  // Action: Admin Login Handling
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPasswordInput })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "পাসওয়ার্ড সঠিক নয়।");
      }

      // Save token state
      localStorage.setItem("prostuti_dhabi_admin_token", resData.token);
      setAdminToken(resData.token);
      setAdminPasswordInput("");
      setCurrentView("admin-dashboard");
      setActiveAdminTab("overview");
    } catch (error: any) {
      setLoginError(error.message || "ভুল হচ্ছে, অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।");
    } finally {
      setLoggingIn(false);
    }
  };

  // Action: Admin Logout
  const handleAdminLogout = () => {
    localStorage.removeItem("prostuti_dhabi_admin_token");
    setAdminToken("");
    setCurrentView("home");
  };

  // Navigation setter wrapper
  const handleViewChange = (view: any, courseId?: string) => {
    if (view === "home") {
      setCurrentView("home");
      setSelectedCourseId(null);
    } else if (view === "course-detail" && courseId) {
      setSelectedCourseId(courseId);
      setCurrentView("course-detail");
      window.scrollTo(0, 0);
    } else if (view === "admin-dashboard") {
      if (!adminToken) {
        setCurrentView("admin-login");
      } else {
        setCurrentView("admin-dashboard");
      }
    } else {
      setCurrentView(view);
    }
  };

  // CRUD Course actions proxy handlers
  const handleSaveCourse = async (courseData: Partial<Course>) => {
    const isEditing = editingCourse !== null;
    const url = isEditing ? `/api/admin/courses/${editingCourse.id}` : "/api/admin/courses";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": adminToken
      },
      body: JSON.stringify(courseData)
    });

    if (!response.ok) {
      const errRes = await response.json();
      throw new Error(errRes.error || "কোর্স রিসিভ অপারেশনে ভুল হয়েছে।");
    }

    // Refresh records
    await loadAdminAuthorizedRecords();
    setIsAddingCourse(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত এই কোর্সটি ডিলিট করতে চান?")) return;

    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": adminToken }
      });

      if (response.ok) {
        await loadAdminAuthorizedRecords();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublishCourse = async (course: Course) => {
    try {
      const updated = { ...course, is_published: !course.is_published };
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify(updated)
      });

      if (response.ok) {
        await loadAdminAuthorizedRecords();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Teacher actions proxy handlers
  const handleSaveTeacher = async (teacherData: Partial<Teacher>) => {
    const isEditing = editingTeacher !== null;
    const url = isEditing ? `/api/admin/teachers/${editingTeacher.id}` : "/api/admin/teachers";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": adminToken
      },
      body: JSON.stringify(teacherData)
    });

    if (!response.ok) {
      const errRes = await response.json();
      throw new Error(errRes.error || "শিক্ষকের তথ্য সংরক্ষণে ত্রুটি ঘটেছে।");
    }

    // Reload
    const teachersRes = await fetch("/api/teachers");
    if (teachersRes.ok) {
      const list = await teachersRes.json();
      setTeachers(list);
    }
    setIsAddingTeacher(false);
    setEditingTeacher(null);
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত এই শিক্ষকের ফাইল মুছে ফেলতে চান?")) return;

    try {
      const response = await fetch(`/api/admin/teachers/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": adminToken }
      });

      if (response.ok) {
        const teachersRes = await fetch("/api/teachers");
        if (teachersRes.ok) {
          const list = await teachersRes.json();
          setTeachers(list);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Approve or Reject Enrollment
  const handleUpdateEnrollmentStatus = async (id: string, status: "approved" | "rejected", note?: string) => {
    try {
      const response = await fetch(`/api/admin/enrollments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify({ status, admin_note: note || "" })
      });

      if (response.ok) {
        await loadAdminAuthorizedRecords();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Save Global settings panel modifications
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsStatus({ success: false, error: "" });

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify({
          facebook_url: fbUrlInput,
          youtube_url: ytUrlInput,
          whatsapp_number: waNumInput,
          bkash_number: bkashNumInput,
          nagad_number: nagadNumInput,
          about_text: aboutTextInput,
          about_mission: aboutMissionInput,
          new_password: adminNewPasswordInput
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "কনফিগারেশন আপডেট করতে ভুল হয়েছে।");
      }

      setSettingsStatus({ success: true, error: "" });
      setConfig(resData.config);

      // Reset new password input field on success
      setAdminNewPasswordInput("");
      
      // If password changed, update local adminToken state reference
      if (resData.config.password_hash) {
        localStorage.setItem("prostuti_dhabi_admin_token", resData.config.password_hash);
        setAdminToken(resData.config.password_hash);
      }

      setTimeout(() => setSettingsStatus({ success: false, error: "" }), 5000);
    } catch (error: any) {
      setSettingsStatus({ success: false, error: error.message || "সংরক্ষণে ব্যর্থ হয়েছে।" });
    } finally {
      setSettingsLoading(false);
    }
  };

  // Fetch fully hydrated course detail on select target
  const getSelectedCourseWithTeachers = () => {
    if (!selectedCourseId) return null;
    const found = courses.find(c => c.id === selectedCourseId);
    if (!found) return null;
    
    const popTeachers = teachers.filter(t => found.teacher_ids?.includes(t.id));
    return {
      ...found,
      teachers: popTeachers
    };
  };

  const selectedCourseFull = getSelectedCourseWithTeachers();

  // Navigation callbacks
  const onSeeCourses = () => {
    const el = document.getElementById("courses");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const onSeeAbout = () => {
    const el = document.getElementById("about");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Statistics for Admin
  const statsTotalCourses = courses.length;
  const statsPublishedCourses = courses.filter(c => c.is_published).length;
  const statsTotalTeachers = teachers.length;
  const statsTotalEnrollments = enrollments.length;
  const statsPendingEnrollments = enrollments.filter(e => e.status === "pending").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafdfb]" id="app-root-container">
      
      {/* 1. Navbar displays globally except when in full-screen admin dashboard layout */}
      {currentView !== "admin-dashboard" && (
        <Navbar
          currentView={currentView}
          setView={handleViewChange}
          isAdminLoggedIn={adminToken !== ""}
          onLogout={handleAdminLogout}
        />
      )}

      {/* 2. Main content routing viewport */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* VIEW: HOME LANDING */}
          {currentView === "home" && (
            <motion.div
              key="home-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HeroSection onSeeCourses={onSeeCourses} onSeeAbout={onSeeAbout} />
              
              {/* Courses Catalogue Grid */}
              <CourseGrid courses={courses} onSelectCourse={(id) => handleViewChange("course-detail", id)} />
              
              {/* About US Background & Mission */}
              <AboutSection config={config} />
              
              {/* Channels list */}
              <ConnectSection config={config} />
            </motion.div>
          )}

          {/* VIEW: COURSE DETAIL WINDOWS */}
          {currentView === "course-detail" && selectedCourseFull && (
            <motion.div
              key="course-detail-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CourseDetailView
                course={selectedCourseFull}
                config={config}
                onBack={() => handleViewChange("home")}
              />
            </motion.div>
          )}

          {/* VIEW: ADMIN ACCESS LOGIN */}
          {currentView === "admin-login" && (
            <motion.div
              key="admin-login-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-dark flex flex-col items-center justify-center p-4 pt-28 pb-16 relative"
            >
              {/* Ambient dots */}
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

              <div className="max-w-md w-full bg-slate-900 border border-white/5 shadow-2xl rounded-3xl p-8 space-y-6 relative z-10 text-white" id="admin-login-card">
                <div className="text-center space-y-2">
                  <div className="mx-auto bg-secondary p-3.5 rounded-full text-dark w-14 h-14 flex items-center justify-center shadow-[0_0_20px_rgba(212,160,23,0.3)]">
                    <Lock className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight" id="login-title">ম্যানেজমেন্ট কনসোল</h2>
                  <p className="text-white/60 text-xs sm:text-sm">
                    পাসওয়ার্ড প্রদান করে অ্যাডমিন প্যানেলে নিরাপদ প্রবেশ করুন।
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {loginError && (
                    <div className="bg-red-500/15 text-red-400 p-4.5 rounded-xl text-xs sm:text-sm flex items-start space-x-1.5 border border-red-500/20">
                      <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-white/80">পাসওয়ার্ড দিন</label>
                    <input
                      type="password"
                      required
                      placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="w-full text-xs sm:text-sm px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary text-white font-sans placeholder:text-white/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loggingIn || !adminPasswordInput}
                    className="w-full bg-secondary hover:bg-secondary/95 text-dark font-black py-3.5 rounded-xl transition cursor-pointer text-xs sm:text-sm"
                  >
                    {loggingIn ? "যাচাই করা হচ্ছে..." : "কনসোলে প্রবেশ করুন"}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleViewChange("home")}
                    className="text-white/30 hover:text-white/60 text-xs underline transition"
                  >
                    হোমপেজে ফিরে যান
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: ADMIN BOARD CORE CONTROL SYSTEM */}
          {currentView === "admin-dashboard" && adminToken && (
            <motion.div
              key="admin-dashboard-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col md:flex-row min-h-screen bg-[#f3fbf6] text-[#1A1A2E]"
            >
              {/* Left admin navigation sidebar */}
              <AdminSidebar
                currentTab={activeAdminTab}
                setTab={setActiveAdminTab}
                onLogout={handleAdminLogout}
                statsPending={statsPendingEnrollments}
              />

              {/* Right panel section views */}
              <section className="flex-grow p-6 sm:p-8 space-y-6 md:max-h-screen md:overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-primary/5 pb-4">
                  <div>
                    <span className="text-[10px] bg-secondary/15 text-primary tracking-wide font-extrabold px-2.5 py-1 rounded-full">
                      সিস্টেম এডিশন v1.0 (MVP)
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-primary mt-1.5 leading-none">
                      {activeAdminTab === "overview" && "সারসংক্ষেপ ও ড্যাশবোর্ড"}
                      {activeAdminTab === "courses" && "কোর্স ক্রিয়েটর ও লিস্ট"}
                      {activeAdminTab === "teachers" && "শিক্ষক পরিচিতি ও প্রোফাইল"}
                      {activeAdminTab === "enrollments" && "পেমেন্ট ডাটা ট্র্যাকিং"}
                      {activeAdminTab === "settings" && "সিস্টেম সেটিংস ও সামাজিক লিংক"}
                    </h1>
                  </div>

                  {/* Return back home view */}
                  <button
                    onClick={() => handleViewChange("home")}
                    className="self-start text-xs font-bold text-primary hover:text-secondary flex items-center space-x-1 border border-primary/10 rounded-xl px-3.5 py-2.5 bg-white shadow-xs cursor-pointer hover:shadow-md transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>পাবলিক হোমপেজ দেখুন</span>
                  </button>
                </div>

                {/* TAB 1: OVERVIEW COMPONENT */}
                {activeAdminTab === "overview" && (
                  <div className="space-y-6">
                    {/* Bento grids metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                      
                      {/* Total courses */}
                      <div className="bg-white p-5 rounded-2xl border border-primary/5 shadow-xs flex items-center space-x-4">
                        <div className="bg-primary/5 p-3 rounded-xl text-primary">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block uppercase font-bold">মোট কোর্স</span>
                          <span className="text-xl sm:text-2xl font-bold font-sans">{statsTotalCourses}টি</span>
                        </div>
                      </div>

                      {/* Published Courses */}
                      <div className="bg-white p-5 rounded-2xl border border-primary/5 shadow-xs flex items-center space-x-4">
                        <div className="bg-green-50 p-3 rounded-xl text-green-600">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block uppercase font-bold">প্রকাশিত</span>
                          <span className="text-xl sm:text-2xl font-bold font-sans">{statsPublishedCourses}টি</span>
                        </div>
                      </div>

                      {/* Total teachers */}
                      <div className="bg-white p-5 rounded-2xl border border-primary/5 shadow-xs flex items-center space-x-4">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block uppercase font-bold">মোট শিক্ষক</span>
                          <span className="text-xl sm:text-2xl font-bold font-sans">{statsTotalTeachers}জন</span>
                        </div>
                      </div>

                      {/* Total enrolled */}
                      <div className="bg-white p-5 rounded-2xl border border-primary/5 shadow-xs flex items-center space-x-4">
                        <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                          <ClipboardCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block uppercase font-bold">মোট আবেদন</span>
                          <span className="text-xl sm:text-2xl font-bold font-sans">{statsTotalEnrollments}টি</span>
                        </div>
                      </div>

                      {/* Pending audit */}
                      <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200/50 shadow-xs flex items-center space-x-4">
                        <div className="bg-amber-100 p-3 rounded-xl text-amber-700">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-700 block uppercase font-bold">অপেক্ষমাণ</span>
                          <span className="text-xl sm:text-2xl font-extrabold text-amber-700 font-sans">{statsPendingEnrollments}টি</span>
                        </div>
                      </div>

                    </div>

                    {/* Pending items lists summary */}
                    <div className="p-6 bg-white rounded-2xl border border-primary/5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                        <h3 className="font-bold text-dark text-base sm:text-lg">ভর্তি আবেদন ট্র্যাকিং লিস্ট (সর্বশেষ)</h3>
                        <button
                          onClick={() => setActiveAdminTab("enrollments")}
                          className="text-primary hover:text-secondary text-xs font-bold underline"
                        >
                          সবগুলো দেখুন
                        </button>
                      </div>
                      <EnrollmentTable
                        enrollments={enrollments}
                        onUpdateStatus={handleUpdateEnrollmentStatus}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: COURSES MANAGEMENT SYSTEM */}
                {activeAdminTab === "courses" && (
                  <div className="space-y-6">
                    {/* Opened form for dynamic course */}
                    {isAddingCourse || editingCourse ? (
                      <CourseForm
                        course={editingCourse}
                        teachers={teachers}
                        adminToken={adminToken}
                        onCancel={() => {
                          setIsAddingCourse(false);
                          setEditingCourse(null);
                        }}
                        onSave={handleSaveCourse}
                      />
                    ) : (
                      <div className="space-y-4">
                        {/* Title additions */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-dark font-bold text-base sm:text-lg">সমস্ত কোর্স তালিকা</h3>
                          <button
                            id="add-new-course-btn"
                            onClick={() => setIsAddingCourse(true)}
                            className="bg-primary text-secondary font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center space-x-1 hover:shadow-md cursor-pointer transition-all"
                          >
                            <Plus className="h-4.5 w-4.5" />
                            <span>নতুন কোর্স যোগ করুন</span>
                          </button>
                        </div>

                        {/* List block */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-courses-list">
                          {courses.map((course) => {
                            const foundTeachers = teachers.filter(t => course.teacher_ids?.includes(t.id));
                            return (
                              <div
                                key={course.id}
                                className={`bg-white border rounded-2xl p-5.5 space-y-4 shadow-xs relative flex flex-col justify-between ${
                                  course.is_published ? "border-primary/5" : "border-gray-200 opacity-80 bg-neutral-50/50"
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between">
                                    <span className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                                      {course.category}
                                    </span>
                                    
                                    {/* is published badge */}
                                    <button
                                      onClick={() => handleTogglePublishCourse(course)}
                                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 cursor-pointer select-none border transition-colors ${
                                        course.is_published 
                                          ? "bg-green-50 text-green-700 border-green-200" 
                                          : "bg-gray-100 text-gray-500 border-gray-300"
                                      }`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${course.is_published ? "bg-green-600" : "bg-gray-500"}`} />
                                      <span>{course.is_published ? "অনলাইন" : "ড্রাফট"}</span>
                                    </button>
                                  </div>

                                  <h4 className="text-dark font-black text-[15px] sm:text-base mt-3 leading-snug line-clamp-2">
                                    {course.title}
                                  </h4>

                                  <p className="text-muted text-[11px] sm:text-xs mt-1.5 line-clamp-2 leading-relaxed">
                                    {course.short_description}
                                  </p>

                                  <p className="text-primary font-bold text-sm font-sans mt-3">
                                    {course.price === 0 ? "বিনামূল্যে" : `${course.price} ৳`}
                                  </p>

                                  {/* Instructors list preview */}
                                  <div className="flex items-center -space-x-1.5 mt-4">
                                    {foundTeachers.map(t => (
                                      <img
                                        key={t.id}
                                        src={t.photo_url || ""}
                                        alt={t.name}
                                        title={t.name}
                                        className="w-7 h-7 rounded-full object-cover border border-white"
                                        referrerPolicy="no-referrer"
                                      />
                                    ))}
                                    <span className="text-[10px] text-muted pl-2.5 font-medium">
                                      {foundTeachers.length}জন অ্যাসাইন শিক্ষক
                                    </span>
                                  </div>
                                </div>

                                {/* Actions trigger */}
                                <div className="flex items-center space-x-2 border-t border-primary/5 pt-4 mt-4">
                                  <button
                                    onClick={() => setEditingCourse(course)}
                                    className="flex-grow bg-accent hover:bg-primary/5 text-primary text-xs py-2 rounded-lg font-bold flex items-center justify-center space-x-1"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    <span>এডিট</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="h-4.5 w-4.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: TEACHERS MANAGEMENT */}
                {activeAdminTab === "teachers" && (
                  <div className="space-y-6">
                    {/* Teacher form */}
                    {isAddingTeacher || editingTeacher ? (
                      <TeacherForm
                        teacher={editingTeacher}
                        adminToken={adminToken}
                        onCancel={() => {
                          setIsAddingTeacher(false);
                          setEditingTeacher(null);
                        }}
                        onSave={handleSaveTeacher}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-dark font-bold text-base sm:text-lg">অনলাইন সমস্ত শিক্ষকগণ</h3>
                          <button
                            id="add-new-teacher-btn"
                            onClick={() => setIsAddingTeacher(true)}
                            className="bg-primary text-secondary font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center space-x-1 hover:shadow-md cursor-pointer transition-all"
                          >
                            <Plus className="h-4.5 w-4.5" />
                            <span>নতুন শিক্ষক যোগ করুন</span>
                          </button>
                        </div>

                        {/* Teachers grid lists */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-teachers-list">
                          {teachers.map((teach) => (
                            <div
                              key={teach.id}
                              className="bg-white border border-primary/5 p-5.5 rounded-2xl flex items-start space-x-4 shadow-xs"
                            >
                              <img
                                src={teach.photo_url || ""}
                                alt={teach.name}
                                className="w-14 h-14 rounded-full object-cover border border-primary/10 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-grow space-y-1 min-w-0">
                                <h4 className="font-bold text-dark text-base leading-tight truncate">{teach.name}</h4>
                                <span className="inline-block bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5">
                                  {teach.subject}
                                </span>
                                <p className="text-primary text-[11px] font-semibold leading-tight line-clamp-1 mt-1 font-sans">
                                  {teach.qualifications}
                                </p>
                                <p className="text-muted text-[11px] leading-tight line-clamp-2 mt-1">
                                  {teach.bio}
                                </p>

                                {/* Action Buttons editing */}
                                <div className="flex items-center space-x-2 pt-3 mt-3 border-t border-primary/5">
                                  <button
                                    onClick={() => setEditingTeacher(teach)}
                                    className="text-primary hover:text-secondary text-xs font-bold"
                                  >
                                    সম্পাদনা
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    onClick={() => handleDeleteTeacher(teach.id)}
                                    className="text-red-500 hover:text-red-600 text-xs font-bold font-sans"
                                  >
                                    মুছে ফেলুন
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: ENROLLMENTS RECORDS */}
                {activeAdminTab === "enrollments" && (
                  <div className="bg-white rounded-2xl border border-primary/5 shadow-xs p-6">
                    <h3 className="text-dark font-black text-base sm:text-lg mb-4">ভর্তি আবেদন ও ট্রানজেকশন তালিকা</h3>
                    <EnrollmentTable
                      enrollments={enrollments}
                      onUpdateStatus={handleUpdateEnrollmentStatus}
                    />
                  </div>
                )}

                {/* TAB 5: GLOBAL CONFIG SETTINGS */}
                {activeAdminTab === "settings" && (
                  <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-primary/5 shadow-xs p-6 sm:p-8 space-y-6">
                    
                    {settingsStatus.success && (
                      <div className="bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm p-4.5 rounded-xl flex items-center space-x-1.5">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>কনফিগারেশন ডেটা সফলভাবে সংরক্ষণ করা হয়েছে!</span>
                      </div>
                    )}

                    {settingsStatus.error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-4.5 rounded-xl flex items-center space-x-1.5">
                        <XCircle className="h-5 w-5" />
                        <span>{settingsStatus.error}</span>
                      </div>
                    )}

                    {/* Social Media and Helplines */}
                    <div className="space-y-4">
                      <h4 className="font-extrabold text-primary text-base border-b border-primary/5 pb-2">
                        ১. হেল্পলাইন ও পেমেন্ট মার্চেন্ট নম্বর
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
                        {/* bKash */}
                        <div>
                          <label className="block text-xs font-bold text-dark mb-1.5">বিকাশ পার্সোনাল নম্বর</label>
                          <input
                            type="text"
                            value={bkashNumInput}
                            onChange={(e) => setBkashNumInput(e.target.value)}
                            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl outline-none font-sans"
                          />
                        </div>
                        {/* Nagad */}
                        <div>
                          <label className="block text-xs font-bold text-dark mb-1.5">নগদ পার্সোনাল নম্বর</label>
                          <input
                            type="text"
                            value={nagadNumInput}
                            onChange={(e) => setNagadNumInput(e.target.value)}
                            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl outline-none font-sans"
                          />
                        </div>
                        {/* WhatsApp Helpline */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-dark mb-1.5">হোয়াটসঅ্যাপ কন্টাক্ট নম্বর</label>
                          <input
                            type="text"
                            value={waNumInput}
                            onChange={(e) => setWaNumInput(e.target.value)}
                            placeholder="যেমন: 01712345678"
                            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl outline-none font-sans"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-extrabold text-primary text-base border-b border-primary/5 pb-2">
                        ২. সামাজিক কন্টাক্ট ইউআরএল
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
                        {/* Facebook URL */}
                        <div>
                          <label className="block text-xs font-bold text-dark mb-1.5">ফেসবুক গ্রুপ/পেইজ লিংক</label>
                          <input
                            type="url"
                            value={fbUrlInput}
                            onChange={(e) => setFbUrlInput(e.target.value)}
                            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl outline-none font-sans"
                          />
                        </div>
                        {/* Youtube URL */}
                        <div>
                          <label className="block text-xs font-bold text-dark mb-1.5">ইউটিউব চ্যানেল লিংক</label>
                          <input
                            type="url"
                            value={ytUrlInput}
                            onChange={(e) => setYtUrlInput(e.target.value)}
                            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl outline-none font-sans"
                          />
                        </div>
                      </div>
                    </div>

                    {/* About details text edit */}
                    <div className="space-y-4">
                      <h4 className="font-extrabold text-primary text-base border-b border-primary/5 pb-2">
                        ৩. 'আমাদের সম্পর্কে' সেকশন টেক্সট
                      </h4>
                      <div className="space-y-4 text-xs sm:text-sm">
                        <div>
                          <label className="block text-xs font-bold text-dark mb-1.5">প্রধান পরিচিতিমূলক টেক্সট</label>
                          <textarea
                            rows={3}
                            value={aboutTextInput}
                            onChange={(e) => setAboutTextInput(e.target.value)}
                            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-dark mb-1.5">আমাদের দীর্ঘমেয়াদি ভিশন/মিশন টেক্সট</label>
                          <textarea
                            rows={3}
                            value={aboutMissionInput}
                            onChange={(e) => setAboutMissionInput(e.target.value)}
                            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Modification update */}
                    <div className="space-y-4">
                      <h4 className="font-extrabold text-primary text-base border-b border-primary/5 pb-2">
                        ৪. অ্যাডমিন পাসওয়ার্ড পরিবর্তন নিশ্চিত করুন
                      </h4>
                      <div className="max-w-md text-xs sm:text-sm">
                        <label className="block text-xs font-bold text-dark mb-1.5">নতুন পাসওয়ার্ড</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={adminNewPasswordInput}
                            onChange={(e) => setAdminNewPasswordInput(e.target.value)}
                            placeholder="পাসওয়ার্ড টেক্সট লিখুন (ফাঁকা রাখলে আগের আইডি পাসওয়ার্ড থাকবে)"
                            className="w-full pl-4 pr-11 py-2.5 border border-primary/10 rounded-xl outline-none font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-primary/60 hover:text-primary transition-colors cursor-pointer"
                            title={showNewPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit settings change */}
                    <div className="border-t border-primary/5 pt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={settingsLoading}
                        className="bg-primary text-secondary px-8 py-3.5 rounded-xl text-xs sm:text-sm font-black flex items-center space-x-1.5 hover:shadow-lg transition cursor-pointer"
                      >
                        <Save className="h-4.5 w-4.5" />
                        <span>{settingsLoading ? "সংরক্ষণ হচ্ছে..." : "কনফিগারেশন সংরক্ষণ করুন"}</span>
                      </button>
                    </div>

                  </form>
                )}
              </section>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 3. Footer displays globally except when in wide screen full admin console */}
      {currentView !== "admin-dashboard" && (
        <Footer setView={handleViewChange} />
      )}

    </div>
  );
}
