import React, { useState } from "react";
import { 
  ArrowLeft, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  GraduationCap,
  Sparkles
} from "lucide-react";
import { Course, Teacher, AdminConfig } from "../lib/types";
import EnrollmentForm from "./EnrollmentForm";

interface CourseDetailViewProps {
  course: Course & { teachers?: Teacher[] };
  config: Partial<AdminConfig> | null;
  onBack: () => void;
}

export default function CourseDetailView({ course, config, onBack }: CourseDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"about" | "curriculum" | "teachers">("about");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);
  const [showEnrollForm, setShowEnrollForm] = useState(false);

  const courseTeachers = course.teachers || [];

  const toggleWeek = (index: number) => {
    setExpandedWeek(expandedWeek === index ? null : index);
  };

  const isFree = course.price === 0;

  return (
    <div className="bg-[#fafdfb] min-h-screen pt-28 pb-20 font-sans" id="course-detail-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link indicator */}
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-primary hover:text-secondary font-bold text-sm mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-4 p-0.5 w-4 transition-transform group-hover:-translate-x-1" />
          <span>কোর্সসমূহে ফিরে যান</span>
        </button>

        {/* Master layout details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Main Content Stream */}
          <div className="lg:col-span-8 space-y-8">
            {/* Cover Banner */}
            <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-primary/20 shadow-md">
              {course.cover_photo_url ? (
                <img
                  src={course.cover_photo_url}
                  alt={course.title}
                  className="object-cover w-full h-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-primary to-primary/85 flex items-center justify-center p-8 text-white text-center font-bold text-2xl">
                  {course.title}
                </div>
              )}
              {/* Overlay with category info */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent flex items-end p-6 md:p-8">
                <span className="bg-secondary text-dark text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-secondary shadow-md font-sans uppercase tracking-wider">
                  {course.category}
                </span>
              </div>
            </div>

            {/* Header info headings */}
            <div className="space-y-3.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight leading-tight">
                {course.title}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-sans font-medium">
                {course.short_description}
              </p>
            </div>

            {/* Custom Interactive Tab Headers */}
            <div className="flex border-b border-primary/15 pb-px space-x-5 sm:space-x-8" id="course-tab-headers">
              {[
                { id: "about", label: "বিবরণ ও লাভ" },
                { id: "curriculum", label: `কোর্স কারিকুলাম (${course.curriculum?.length || 0})` },
                { id: "teachers", label: "শিক্ষকমণ্ডলী" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-4 text-sm sm:text-base font-extrabold cursor-pointer transition-all border-b-2 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-400 hover:text-dark"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic tabs render switch container */}
            <div className="pt-4" id="course-tab-render-container">
              {/* Tab 1: ABOUT DETAILS */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  <div className="prose text-gray-700 text-xs sm:text-sm leading-relaxed max-w-none">
                    <p className="whitespace-pre-line font-medium">{course.full_description || "এই কোর্সটিতে ঢাকা বিশ্ববিদ্যালয়ের স্ট্যান্ডার্ড অনুযায়ী সকল গুরুত্বপূর্ণ টপিক কভার করা হবে।"}</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-primary/5">
                    <h3 className="font-bold text-dark text-base sm:text-lg">আপনি কী কী শিখবেন ও পাবেন?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "বিগত ১০ বছরের প্রশ্ন ব্যাংক নির্ভুল সমাধান",
                        "সম্পূর্ণ ওএমআর ভিত্তিক ওয়ান-টু-ওয়ান গাইডেন্স",
                        "লেকচার ও নিয়মিত ক্লাসের স্পেশাল পিডিএফ শিট",
                        "দুর্বল টপিকের জন্য বিশেষ ডাউট সলভিং সেশন",
                        "উইকলি ও ফাইনাল রিভিশন মডেল টেস্ট"
                      ].map((item, i) => (
                        <div key={i} className="flex items-start space-x-2.5 text-xs sm:text-sm text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: CURRICULUM */}
              {activeTab === "curriculum" && (
                <div className="space-y-3">
                  {course.curriculum && course.curriculum.length > 0 ? (
                    course.curriculum.map((week, idx) => {
                      const isExpanded = expandedWeek === idx;
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-primary/10 rounded-2xl overflow-hidden transition-all duration-200"
                        >
                          <button
                            onClick={() => toggleWeek(idx)}
                            className="w-full flex items-center justify-between p-5 bg-neutral-50/50 hover:bg-neutral-50/10 text-left font-bold cursor-pointer font-sans"
                          >
                            <div className="flex items-center space-x-3 text-xs sm:text-sm">
                              <span className="bg-primary/5 text-primary text-xs px-2.5 py-1 rounded-lg border border-primary/10 font-bold">
                                {week.week}
                              </span>
                              <span className="text-dark font-extrabold text-sm sm:text-base leading-tight">
                                {week.topic}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-primary" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="p-5.5 text-xs sm:text-sm text-gray-600 border-t border-primary/5 leading-relaxed bg-white">
                              {week.details || "কোনো তথ্য সংযুক্ত করা হয়নি।"}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 bg-neutral-50 text-muted text-xs rounded-2xl border border-dashed border-primary/15">
                      কারিকুলাম এখনো আপডেট করা হয়নি। খুব শীঘ্রই রিলিজ করা হবে!
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: TEACHERS GROUP */}
              {activeTab === "teachers" && (
                <div className="space-y-6">
                  {courseTeachers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {courseTeachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="bg-white border border-primary/5 p-5 sm:p-6 rounded-2xl shadow-sm flex items-start space-x-4"
                        >
                          <img
                            src={teacher.photo_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200"}
                            alt={teacher.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-primary/15"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1 text-xs">
                            <h4 className="font-bold text-dark text-base">{teacher.name}</h4>
                            <span className="inline-block bg-primary/5 text-primary text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md mb-2">
                              {teacher.subject}
                            </span>
                            {teacher.qualifications && (
                              <p className="text-primary/95 text-xs mt-1 font-semibold leading-tight font-sans">
                                {teacher.qualifications}
                              </p>
                            )}
                            {teacher.bio && (
                              <p className="text-muted leading-tight text-xs font-medium mt-1 font-sans">
                                {teacher.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-neutral-50 text-muted text-xs rounded-2xl border border-dashed border-primary/15">
                      শীঘ্রই কোর্সটির জন্য শিক্ষকমণ্ডলী চূড়ান্ত করা হবে।
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Slider/Collapsible Enrollment integration */}
            {showEnrollForm && (
              <div className="pt-8 border-t border-primary/10 animate-slide-down" id="course-slide-form">
                <EnrollmentForm
                  course={course}
                  config={config}
                  onSuccess={() => setShowEnrollForm(false)}
                />
              </div>
            )}
          </div>

          {/* Right Sticky Pricing Block Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white p-6.5 rounded-3xl border border-primary/10 shadow-[0_10px_35px_rgba(27,67,50,0.05)] text-center space-y-5">
              
              {/* Costing */}
              <div className="space-y-1">
                <span className="text-[11px] text-muted block uppercase tracking-widest font-sans font-bold">কোর্স মূল্য</span>
                <span className="text-3xl font-black text-primary font-sans">
                  {isFree ? "বিনামূল্যে" : `${course.price.toLocaleString("en-BD")} ৳`}
                </span>
                {!isFree && <p className="text-[10px] text-muted font-sans">*এককালীন পরিশোধযোগ্য (কোনো হিডেন ফি নেই)</p>}
              </div>

              {/* Stat metrics */}
              <div className="grid grid-cols-2 gap-3.5 text-left border-t border-b border-primary/5 py-4">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] font-bold">সময়কাল</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-dark">{course.duration || "N/A"}</p>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-[10px] font-bold">মোট লেকচার</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-dark">{course.total_classes ? `${course.total_classes}টি লাইভ ক্লাস` : "উন্মুক্ত"}</p>
                </div>
              </div>

              {/* Main enroll action */}
              <button
                id="btn-trigger-enrollment"
                onClick={() => {
                  setShowEnrollForm(true);
                  // Scroll to form smoothly
                  setTimeout(() => {
                    const formEl = document.getElementById("enrollment-form-container");
                    if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 120);
                }}
                className="w-full bg-secondary hover:bg-secondary/95 text-dark font-black py-4 px-6 rounded-2xl transition duration-300 transform hover:scale-[1.01] shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>ভর্তি হতে আবেদন করুন</span>
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-gray-500 text-[11px]">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>সরাসরি ঢাকা বিশ্ববিদ্যালয় পড়ুয়া ভাইয়া-আপুদের মেন্টরশিপ</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
