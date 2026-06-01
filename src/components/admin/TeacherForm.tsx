import React, { useState } from "react";
import { Save, X, ImagePlus, Loader2 } from "lucide-react";
import { apiFetch as fetch } from "../../lib/apiInterceptor";
import { Teacher } from "../../lib/types";

interface TeacherFormProps {
  teacher?: Teacher | null;
  onSave: (teacherData: Partial<Teacher>) => Promise<void>;
  onCancel: () => void;
  adminToken: string;
}

export default function TeacherForm({ teacher, onSave, onCancel, adminToken }: TeacherFormProps) {
  const [name, setName] = useState(teacher?.name || "");
  const [subject, setSubject] = useState(teacher?.subject || "");
  const [qualifications, setQualifications] = useState(teacher?.qualifications || "");
  const [bio, setBio] = useState(teacher?.bio || "");
  const [photoUrl, setPhotoUrl] = useState(teacher?.photo_url || "");
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
          const preset = "teacher_profiles";
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
              setPhotoUrl(url);
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
            preset: "teacher_profiles"
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "আপলোড করতে সমস্যা হয়েছে");

        setPhotoUrl(data.url);
      } catch (err: any) {
        setError(err.message || "ছবি আপলোড ব্যর্থ হয়েছে।");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("শিক্ষকের নাম আবশ্যক।");
      return;
    }
    if (!subject.trim()) {
      setError("শিক্ষাদানের বিষয় আবশ্যক।");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        name: name.trim(),
        subject: subject.trim(),
        qualifications: qualifications.trim(),
        bio: bio.trim(),
        photo_url: photoUrl
      });
    } catch (err: any) {
      setError(err.message || "শিক্ষকের তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-primary/10 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-primary/5 pb-4">
        <h3 className="text-lg font-bold text-dark">
          {teacher ? "শিক্ষকের প্রোফাইল সম্পাদন" : "নতুন শিক্ষক সংযোজন"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            নাম <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="যেমন: ড. সাজিদ হাসান"
            className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            শিক্ষাদানের বিষয় <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="যেমন: রসায়ন ও গণিত"
            className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
          />
        </div>

        {/* Qualifications */}
        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            শিক্ষাগত যোগ্যতা
          </label>
          <input
            type="text"
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            placeholder="যেমন: বিএসসি, এমএসসি (ঢাকা বিশ্ববিদ্যালয়), পিএইচডি (জাপান)"
            className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
          />
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            সংক্ষিপ্ত পরিচিতি / বায়ো
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="শিক্ষকের সংক্ষিপ্ত পরিচিতি এখানে লিখুন..."
            className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
          />
        </div>

        {/* Image upload photo_url */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-dark">
            প্রোফাইল ছবি
          </label>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="ছবির সরাসরি লিংক অথবা আপলোড বাটন চাপুন"
              className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none font-sans"
            />
            <label className="flex-shrink-0 cursor-pointer bg-accent hover:bg-primary/5 text-primary border border-primary/20 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all select-none">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>আপলোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  <span>ছবি আপলোড</span>
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
          {photoUrl && (
            <div className="relative w-20 h-20 bg-neutral-100 rounded-full overflow-hidden mt-2 border border-primary/10">
              <img src={photoUrl} alt="Teacher Preview" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
              <button
                type="button"
                onClick={() => setPhotoUrl("")}
                className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-primary/5 pt-5 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-neutral-100 hover:bg-neutral-200 text-dark px-5 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors"
        >
          বাতিল
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-secondary px-6 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 hover:shadow-lg transition cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              <span>সংরক্ষণ হচ্ছে...</span>
            </>
          ) : (
            <>
              <Save className="h-4.5 w-4.5" />
              <span>তথ্য সংরক্ষণ করুন</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
