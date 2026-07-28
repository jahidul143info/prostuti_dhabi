import React, { useState } from "react";
import { Plus, Trash2, Save, X, ImagePlus, Loader2 } from "lucide-react";
import { apiFetch as fetch } from "../../lib/apiInterceptor";
import { Course, Teacher, CurriculumSubject, CurriculumChapter, CurriculumClass, parseCurriculum } from "../../lib/types";

interface CourseFormProps {
  course?: Course | null;
  teachers: Teacher[];
  categories?: Array<{ id: string; name: string }>;
  onSave: (courseData: Partial<Course>) => Promise<void>;
  onCancel: () => void;
  adminToken: string;
}

export default function CourseForm({ course, teachers, categories = [], onSave, onCancel, adminToken }: CourseFormProps) {
  const [title, setTitle] = useState(course?.title || "");
  const [category, setCategory] = useState(course?.category || (categories.length > 0 ? categories[0].name : "বিজ্ঞান"));
  const [shortDesc, setShortDesc] = useState(course?.short_description || "");
  const [fullDesc, setFullDesc] = useState(course?.full_description || "");
  const [price, setPrice] = useState(course?.price || 0);
  const [duration, setDuration] = useState(course?.duration || "৩ মাস");
  const [totalClasses, setTotalClasses] = useState(course?.total_classes || 60);
  const [isPublished, setIsPublished] = useState(course?.is_published ?? false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(course?.teacher_ids || []);
  const [curriculum, setCurriculum] = useState<CurriculumSubject[]>(() => {
    return parseCurriculum(course?.curriculum || []);
  });
  
  const [coverUrl, setCoverUrl] = useState(course?.cover_photo_url || "");
  const [enrolledCount, setEnrolledCount] = useState(course?.enrolled_count || "");
  const [timerEnabled, setTimerEnabled] = useState(course?.timer_enabled ?? false);
  const [timerEndTime, setTimerEndTime] = useState(course?.timer_end_time || "");
  const [timerLabel, setTimerLabel] = useState(course?.timer_label || "অফার শেষ হতে বাকি:");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categoryList = categories.length > 0 
    ? categories.map(c => c.name) 
    : ["विज्ञान", "मानविक", "ब्यबसाए", "अन्यन्य"]; // Wait, let's write accurate Bengali text: ["বিজ্ঞান", "মানবিক", "ব্যবসায়", "অন্যান্য"]
  const finalCategoryList = categories.length > 0 
    ? categories.map(c => c.name) 
    : ["বিজ্ঞান", "মানবিক", "ব্যবসায়", "অন্যান্য"];

  // File to base64 upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("ফাইলের সাইজ ৫ মেগাবাইট অপেক্ষা কম হতে হবে।");
      return;
    }

    setUploading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64Data = event.target?.result as string;

        // 1. Try Direct Cloudinary Upload from browser for speed and absolute reliability (Unsigned Preset)
        try {
          const cloudName = "dli4xunsm";
          const preset = "course_covers";
          const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

          const formData = new FormData();
          formData.append("file", file); // actual file object
          formData.append("upload_preset", preset);

          console.log("Attempting direct client-side upload to Cloudinary...");
          const cloudRes = await fetch(cloudinaryUrl, {
            method: "POST",
            body: formData
          });

          if (cloudRes.ok) {
            const cloudData = await cloudRes.json();
            const url = cloudData.secure_url || cloudData.url;
            if (url) {
              console.log("Direct Cloudinary upload successful:", url);
              setCoverUrl(url);
              setUploading(false);
              return; // Quit early since we are fully successful!
            }
          } else {
            console.warn("Direct Cloudinary upload failed with status:", cloudRes.status, "Trying backend fallback...");
          }
        } catch (cloudErr) {
          console.warn("Direct Cloudinary upload failed with exception. Trying backend fallback...", cloudErr);
        }

        // 2. Fallback to server-side upload proxy
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": adminToken
          },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            data: base64Data,
            preset: "course_covers"
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "আপলোড করতে সমস্যা হয়েছে");

        setCoverUrl(data.url);
      } catch (err: any) {
        setError(err.message || "ফাইল আপলোড ব্যর্থ হয়েছে।");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTeacherToggle = (teacherId: string) => {
    if (selectedTeachers.includes(teacherId)) {
      setSelectedTeachers(selectedTeachers.filter(id => id !== teacherId));
    } else {
      setSelectedTeachers([...selectedTeachers, teacherId]);
    }
  };

  // Add a new empty Subject
  const addSubject = () => {
    const newSubject: CurriculumSubject = {
      id: `subj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: "",
      chapters: []
    };
    setCurriculum([...curriculum, newSubject]);
  };

  // Update Subject Title
  const updateSubjectTitle = (subjId: string, title: string) => {
    setCurriculum(curriculum.map(s => s.id === subjId ? { ...s, title } : s));
  };

  // Remove Subject
  const removeSubject = (subjId: string) => {
    setCurriculum(curriculum.filter(s => s.id !== subjId));
  };

  // Add Chapter to Subject
  const addChapter = (subjId: string) => {
    setCurriculum(curriculum.map(s => {
      if (s.id !== subjId) return s;
      const newChapter: CurriculumChapter = {
        id: `chap-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: "",
        classes: []
      };
      return {
        ...s,
        chapters: [...s.chapters, newChapter]
      };
    }));
  };

  // Update Chapter Title
  const updateChapterTitle = (subjId: string, chapId: string, title: string) => {
    setCurriculum(curriculum.map(s => {
      if (s.id !== subjId) return s;
      return {
        ...s,
        chapters: s.chapters.map(c => c.id === chapId ? { ...c, title } : c)
      };
    }));
  };

  // Remove Chapter from Subject
  const removeChapter = (subjId: string, chapId: string) => {
    setCurriculum(curriculum.map(s => {
      if (s.id !== subjId) return s;
      return {
        ...s,
        chapters: s.chapters.filter(c => c.id !== chapId)
      };
    }));
  };

  // Add Class to Chapter
  const addClass = (subjId: string, chapId: string) => {
    setCurriculum(curriculum.map(s => {
      if (s.id !== subjId) return s;
      return {
        ...s,
        chapters: s.chapters.map(c => {
          if (c.id !== chapId) return c;
          const newClass: CurriculumClass = {
            id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: "",
            duration: ""
          };
          return {
            ...c,
            classes: [...c.classes, newClass]
          };
        })
      };
    }));
  };

  // Update Class field inside Chapter
  const updateClassField = (subjId: string, chapId: string, classId: string, field: keyof CurriculumClass, value: string) => {
    setCurriculum(curriculum.map(s => {
      if (s.id !== subjId) return s;
      return {
        ...s,
        chapters: s.chapters.map(c => {
          if (c.id !== chapId) return c;
          return {
            ...c,
            classes: c.classes.map(cl => cl.id === classId ? { ...cl, [field]: value } : cl)
          };
        })
      };
    }));
  };

  // Remove Class from Chapter
  const removeClass = (subjId: string, chapId: string, classId: string) => {
    setCurriculum(curriculum.map(s => {
      if (s.id !== subjId) return s;
      return {
        ...s,
        chapters: s.chapters.map(c => {
          if (c.id !== chapId) return c;
          return {
            ...c,
            classes: c.classes.filter(cl => cl.id !== classId)
          };
        })
      };
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("কোর্স শিরোনাম আবশ্যক।");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        title: title.trim(),
        category,
        short_description: shortDesc.trim(),
        full_description: fullDesc.trim(),
        price: Number(price),
        duration: duration.trim(),
        total_classes: Number(totalClasses),
        is_published: isPublished,
        teacher_ids: selectedTeachers,
        curriculum: curriculum,
        cover_photo_url: coverUrl,
        enrolled_count: enrolledCount.trim(),
        timer_enabled: timerEnabled,
        timer_end_time: timerEndTime,
        timer_label: timerLabel.trim()
      });
    } catch (err: any) {
      setError(err.message || "কোর্স সংরক্ষণ করতে ব্যর্থ হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-primary/10 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-primary/5 pb-4">
        <h3 className="text-lg font-bold text-dark">
          {course ? "কোর্স এডিট করুন" : "নতুন কোর্স সংযোজন"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted hover:text-dark p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs sm:text-sm p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Title */}
        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            কোর্সের নাম/শিরোনাম <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="যেমন: ঢাবি 'ক' ইউনিট সম্পূর্ণ ভর্তি প্রস্তুতি"
            className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
          />
        </div>

        {/* Category select */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            বিভাগ/ক্যাটাগরি
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none bg-white font-sans"
          >
            {finalCategoryList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Price input */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            মূল্য (টাকায়) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="0"
            className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none font-sans"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            সময়কাল (যেমন: ৩ মাস)
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="যেমন: ৪ মাস"
            className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
          />
        </div>

        {/* Total Classes */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            মোট ক্লাসের সংখ্যা
          </label>
          <input
            type="number"
            value={totalClasses}
            onChange={(e) => setTotalClasses(Number(e.target.value))}
            placeholder="৬০"
            className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none font-sans"
          />
        </div>

        {/* Enrolled Students Count */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            এনরোল্ড শিক্ষার্থী সংখ্যা (যেমন: ১৫০+ বা 350)
          </label>
          <input
            type="text"
            value={enrolledCount}
            onChange={(e) => setEnrolledCount(e.target.value)}
            placeholder="যেমন: ১৫০+ বা 350 জন"
            className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none font-sans"
          />
        </div>

        {/* Course Countdown Timer Configuration */}
        <div className="md:col-span-2 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-dark flex items-center gap-1.5">
                <span>⏱️ কোর্স টাইমার / কাউন্টডাউন অপশন</span>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-md">Optional</span>
              </h4>
              <p className="text-[11px] text-gray-500">অন করলে কোর্সের কার্ডে এবং ডিটেইল পেইজে লিমিটেড টাইম কাউন্টডাউন দেখাবে।</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {timerEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-amber-500/10">
              <div>
                <label className="block text-[11px] font-bold text-dark mb-1">
                  টাইমার লেবেল / টাইটেল
                </label>
                <input
                  type="text"
                  value={timerLabel}
                  onChange={(e) => setTimerLabel(e.target.value)}
                  placeholder="যেমন: অফার শেষ হতে বাকি:"
                  className="w-full text-xs px-3.5 py-2 border border-primary/10 rounded-xl focus:border-primary outline-none bg-white font-sans"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-dark mb-1">
                  টাইমার শেষ হওয়ার তারিখ ও সময় (Target End Time)
                </label>
                <input
                  type="datetime-local"
                  value={timerEndTime}
                  onChange={(e) => setTimerEndTime(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-primary/10 rounded-xl focus:border-primary outline-none bg-white font-sans"
                />
              </div>
            </div>
          )}
        </div>

        {/* Short Description */}
        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            সংক্ষিপ্ত বিবরণ (২ লাইনের কার্ডের নিচে দেখানোর জন্য)
          </label>
          <input
            type="text"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="যেমন: বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য সম্পূর্ণ পদার্থ, রসায়ন, গণিত ও জীববিজ্ঞানের সেরা কোর্স।"
            className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
          />
        </div>

        {/* Detailed description */}
        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            বিস্তারিত বিবরণ
          </label>
          <textarea
            rows={5}
            value={fullDesc}
            onChange={(e) => setFullDesc(e.target.value)}
            placeholder="কোর্সটির বিস্তারিত খুঁটিনাটি এখানে লিখুন যেন শিক্ষার্থীরা আকর্ষণবোধ করে ও ভর্তি হতে উৎসাহিত হয়..."
            className="w-full text-xs sm:text-sm px-4 py-3 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
          />
        </div>

        {/* Image upload widget cover */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-dark">
            কভার ফটো
          </label>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Input URL direct field */}
            <input
              type="text"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="কভার ফটোর সরাসরি ইমেজ URL বা নিচের বাটন দিয়ে আপলোড করুন"
              className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none font-sans"
            />
            {/* File Upload Button wrapper */}
            <label className="flex-shrink-0 cursor-pointer bg-accent hover:bg-primary/5 text-primary border border-primary/20 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all select-none">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>আপলোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  <span>ফটো আপলোড</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          {coverUrl && (
            <div className="relative aspect-[16/6] bg-neutral-100 rounded-xl overflow-hidden mt-2 border border-primary/5 max-w-sm">
              <img src={coverUrl} alt="Preview" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
              <button
                type="button"
                onClick={() => setCoverUrl("")}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Teacher Selection lists */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-dark">
            শিক্ষক নির্বাচন করুন (একাধিক নির্বাচনযোগ্য)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-neutral-50 p-4 rounded-xl border border-primary/5">
            {teachers.map((teach) => {
              const selected = selectedTeachers.includes(teach.id);
              return (
                <div
                  key={teach.id}
                  onClick={() => handleTeacherToggle(teach.id)}
                  className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                    selected 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-primary/5 bg-white hover:bg-neutral-100"
                  }`}
                >
                  <img
                    src={teach.photo_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200"}
                    alt={teach.name}
                    className="w-10 h-10 rounded-full object-cover border border-primary/10"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-dark">{teach.name}</h5>
                    <p className="text-muted text-[11px] leading-tight mt-0.5">{teach.subject}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Curriculum list section */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-primary/5 pb-2">
            <label className="block text-xs sm:text-sm font-extrabold text-primary">
              কোর্স কারিকুলাম (বিষয়, অধ্যায় ও ক্লাসসমূহ)
            </label>
            <button
              type="button"
              onClick={addSubject}
              className="flex items-center space-x-1 text-primary hover:text-secondary text-xs font-bold bg-accent/60 px-3 py-1.5 rounded-lg border border-primary/5 cursor-pointer animate-pulse"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>নতুন বিষয় (Subject) যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-6">
            {curriculum.length === 0 ? (
              <div className="text-center py-8 text-muted text-xs bg-neutral-50 rounded-xl border border-dashed border-primary/15">
                কোনো বিষয় এখনো যোগ করা হয়নি। "নতুন বিষয় যোগ করুন" বাটন চেপে শুরু করুন।
              </div>
            ) : (
              curriculum.map((subj, sIdx) => (
                <div
                  key={subj.id || sIdx}
                  className="bg-neutral-50/50 p-5 rounded-2xl border border-primary/10 space-y-4"
                >
                  {/* Subject Row */}
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <div className="flex-grow w-full">
                      <span className="text-[10px] text-primary font-bold uppercase block mb-1">বিষয় / সাবজেক্ট {sIdx + 1}</span>
                      <input
                        type="text"
                        required
                        value={subj.title}
                        onChange={(e) => updateSubjectTitle(subj.id, e.target.value)}
                        placeholder="যেমন: পদার্থবিজ্ঞান ১ম পত্র বা সাধারণ জ্ঞান"
                        className="w-full text-xs font-bold px-3.5 py-2 bg-white border border-primary/10 rounded-lg outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end sm:mt-5">
                      <button
                        type="button"
                        onClick={() => addChapter(subj.id)}
                        className="flex items-center space-x-1 text-primary hover:text-secondary text-xs font-bold bg-white px-3 py-2 rounded-lg border border-primary/10 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>অধ্যায় যোগ করুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubject(subj.id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="বিষয় মুছুন"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Chapters Nested Area */}
                  <div className="pl-4 sm:pl-8 border-l-2 border-primary/10 space-y-4">
                    {subj.chapters && subj.chapters.length > 0 ? (
                      subj.chapters.map((chapter, cIdx) => (
                        <div
                          key={chapter.id || cIdx}
                          className="bg-white p-4 rounded-xl border border-primary/5 space-y-3"
                        >
                          {/* Chapter Header Row */}
                          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-neutral-50/30 p-2.5 rounded-lg border border-primary/5">
                            <div className="flex-grow w-full">
                              <span className="text-[10px] text-muted font-bold uppercase block mb-1">অধ্যায় / চ্যাপ্টার {cIdx + 1}</span>
                              <input
                                type="text"
                                required
                                value={chapter.title}
                                onChange={(e) => updateChapterTitle(subj.id, chapter.id, e.target.value)}
                                placeholder="যেমন: অধ্যায় ১ - ভেক্টর বা পরিপাক ও শোষণ"
                                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-primary/10 rounded-lg outline-none focus:border-primary"
                              />
                            </div>
                            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end sm:mt-5">
                              <button
                                type="button"
                                onClick={() => addClass(subj.id, chapter.id)}
                                className="flex items-center space-x-1 text-secondary hover:text-primary text-xs font-bold bg-white px-3 py-2 rounded-lg border border-primary/10 cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>ক্লাস যোগ করুন</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeChapter(subj.id, chapter.id)}
                                className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                                title="অধ্যায় মুছুন"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </div>

                          {/* Classes Nested Area */}
                          <div className="pl-4 sm:pl-6 border-l border-dashed border-primary/10 space-y-2">
                            {chapter.classes && chapter.classes.length > 0 ? (
                              chapter.classes.map((cls, clIdx) => (
                                <div
                                  key={cls.id || clIdx}
                                  className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center bg-neutral-50/20 p-2.5 rounded-lg border border-neutral-100"
                                >
                                  <div className="flex-shrink-0 text-xs font-bold text-muted bg-neutral-100 h-6 w-6 rounded-full flex items-center justify-center">
                                    {clIdx + 1}
                                  </div>
                                  <div className="flex-grow w-full">
                                    <input
                                      type="text"
                                      required
                                      value={cls.title}
                                      onChange={(e) => updateClassField(subj.id, chapter.id, cls.id, "title", e.target.value)}
                                      placeholder="ক্লাসের শিরোনাম (যেমন: লেকচার ১ - ভেক্টর পরিচিতি)"
                                      className="w-full text-xs px-3 py-1.5 bg-white border border-primary/5 rounded-lg outline-none focus:border-primary"
                                    />
                                  </div>
                                  <div className="w-full sm:w-36">
                                    <input
                                      type="text"
                                      value={cls.duration || ""}
                                      onChange={(e) => updateClassField(subj.id, chapter.id, cls.id, "duration", e.target.value)}
                                      placeholder="সময়কাল (যেমন: ১ ঘ. ৩০ মি.)"
                                      className="w-full text-xs px-3 py-1.5 bg-white border border-primary/5 rounded-lg outline-none focus:border-primary font-sans"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeClass(subj.id, chapter.id, cls.id)}
                                    className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer self-end sm:self-center"
                                    title="ক্লাস মুছুন"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-3 text-muted text-[11px] bg-neutral-50/50 rounded-lg border border-dashed border-primary/10">
                                অধ্যায়ে কোনো ক্লাস যোগ করা নেই। "ক্লাস যোগ করুন" বাটন চেপে ক্লাস সংযোগ করুন।
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted text-xs bg-white rounded-xl border border-dashed border-primary/10">
                        বিষয়ে কোনো অধ্যায় যোগ করা নেই। "অধ্যায় যোগ করুন" বাটন চেপে অধ্যায় সংযোগ করুন।
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Is Published Toggle */}
        <div className="md:col-span-2 pt-4 bg-neutral-50 p-4 rounded-xl border border-primary/5">
          <label className="flex items-center space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-5 h-5 accent-primary rounded cursor-pointer"
            />
            <div>
              <span className="text-xs sm:text-sm font-bold text-dark block">ধাপ: কোর্সটি সরাসরি পাবলিশ করুন</span>
              <p className="text-muted text-[11px] leading-snug mt-0.5">পাবলিশ করা হলে শিক্ষার্থীরা স্বয়ংক্রিয়ভাবে প্ল্যাটফর্মে কোর্সটি দেখতে পাবে এবং ভর্তি সম্পন্ন করতে পারবে।</p>
            </div>
          </label>
        </div>
      </div>

      {/* Admin Action Triggers bar */}
      <div className="border-t border-primary/5 pt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-neutral-100 hover:bg-neutral-200 text-dark px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors"
        >
          বাতিল করুন
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-secondary px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 hover:shadow-lg transition cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              <span>রক্ষে করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <Save className="h-4.5 w-4.5" />
              <span>সংরক্ষণ করুন</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
