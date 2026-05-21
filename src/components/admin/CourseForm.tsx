import React, { useState } from "react";
import { Plus, Trash2, Save, X, ImagePlus, Loader2 } from "lucide-react";
import { Course, Teacher, CurriculumWeek } from "../../lib/types";

interface CourseFormProps {
  course?: Course | null;
  teachers: Teacher[];
  onSave: (courseData: Partial<Course>) => Promise<void>;
  onCancel: () => void;
  adminToken: string;
}

export default function CourseForm({ course, teachers, onSave, onCancel, adminToken }: CourseFormProps) {
  const [title, setTitle] = useState(course?.title || "");
  const [category, setCategory] = useState(course?.category || "বিজ্ঞান");
  const [shortDesc, setShortDesc] = useState(course?.short_description || "");
  const [fullDesc, setFullDesc] = useState(course?.full_description || "");
  const [price, setPrice] = useState(course?.price || 0);
  const [duration, setDuration] = useState(course?.duration || "৩ মাস");
  const [totalClasses, setTotalClasses] = useState(course?.total_classes || 60);
  const [isPublished, setIsPublished] = useState(course?.is_published ?? false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(course?.teacher_ids || []);
  const [curriculum, setCurriculum] = useState<CurriculumWeek[]>(course?.curriculum || []);
  
  const [coverUrl, setCoverUrl] = useState(course?.cover_photo_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categories = ["বাংলা", "ইংরেজি", "গণিত", "সাধারণ জ্ঞান", "বিজ্ঞান", "অন্যান্য"];

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
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": adminToken
          },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            data: base64Data
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

  // Add a new empty row to curriculum
  const addCurriculumRow = () => {
    const nextWeekNum = curriculum.length + 1;
    const newRow: CurriculumWeek = {
      week: `সপ্তাহ ${nextWeekNum}`,
      topic: "",
      details: ""
    };
    setCurriculum([...curriculum, newRow]);
  };

  // Remove a row from curriculum
  const removeCurriculumRow = (index: number) => {
    setCurriculum(curriculum.filter((_, i) => i !== index));
  };

  const handleCurriculumChange = (index: number, field: keyof CurriculumWeek, value: string) => {
    const updated = [...curriculum];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setCurriculum(updated);
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
        cover_photo_url: coverUrl
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
            {categories.map((cat) => (
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
        <div className="md:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between border-b border-primary/5 pb-2">
            <label className="block text-xs sm:text-sm font-extrabold text-primary">
              সাপ্তাহিক কারিকুলাম (Curriculum Schedule)
            </label>
            <button
              type="button"
              onClick={addCurriculumRow}
              className="flex items-center space-x-1 text-primary hover:text-secondary text-xs font-bold bg-accent/60 px-3 py-1.5 rounded-lg border border-primary/5 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>রো যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {curriculum.length === 0 ? (
              <div className="text-center py-6 text-muted text-xs bg-neutral-50 rounded-xl border border-dashed border-primary/15">
                কোনো সাপ্তাহিক ট্র্যাপ এড করা নেই। রো যোগ করে শুরু করুন।
              </div>
            ) : (
              curriculum.map((cur, index) => (
                <div
                  key={index}
                  className="bg-neutral-50 p-4 rounded-xl border border-primary/5 flex flex-col sm:flex-row gap-3 items-start"
                >
                  <div className="flex-shrink-0 w-full sm:w-28">
                    <span className="text-[10px] text-muted block mb-0.5 font-bold uppercase">সপ্তাহ</span>
                    <input
                      type="text"
                      required
                      value={cur.week}
                      onChange={(e) => handleCurriculumChange(index, "week", e.target.value)}
                      placeholder="যেমন: সপ্তাহ ১"
                      className="w-full text-xs font-bold px-3 py-2 bg-white border border-primary/10 rounded-lg outline-none"
                    />
                  </div>

                  <div className="flex-grow w-full">
                    <span className="text-[10px] text-muted block mb-0.5 font-bold uppercase">টপিক/বিষয়</span>
                    <input
                      type="text"
                      required
                      value={cur.topic}
                      onChange={(e) => handleCurriculumChange(index, "topic", e.target.value)}
                      placeholder="যেমন: অন্তরীকরণ ও বলবিদ্যা বেসিকস"
                      className="w-full text-xs px-3 py-2 bg-white border border-primary/10 rounded-lg outline-none"
                    />
                  </div>

                  <div className="flex-grow scroll-py-8 w-full">
                    <span className="text-[10px] text-muted block mb-0.5 font-bold uppercase">বিস্তারিত আলোচনা</span>
                    <input
                      type="text"
                      value={cur.details}
                      onChange={(e) => handleCurriculumChange(index, "details", e.target.value)}
                      placeholder="যেমন: লিমিট, অন্তরজের জ্যামিতিক তাৎপর্য ও বলবিদ্যার প্রশ্ন সমাধান"
                      className="w-full text-xs px-3 py-2 bg-white border border-primary/10 rounded-lg outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCurriculumRow(index)}
                    className="sm:self-end text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
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
