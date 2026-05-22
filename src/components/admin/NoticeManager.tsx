import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2, Megaphone, FileText } from "lucide-react";
import { Notice } from "../../lib/types";

interface NoticeManagerProps {
  adminToken: string;
  notices: Notice[];
  onRefresh: () => Promise<void>;
}

export default function NoticeManager({ adminToken, notices, onRefresh }: NoticeManagerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [editingIsActive, setEditingIsActive] = useState(true);
  
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          is_active: isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "নোটিশ যোগ করতে সমস্যা হয়েছে।");
      }

      setTitle("");
      setContent("");
      setIsActive(true);
      setSuccess("নতুন নোটিশ সফলভাবে পাবলিশ করা হয়েছে!");
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "নোটিশ যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setEditingTitle(notice.title);
    setEditingContent(notice.content);
    setEditingIsActive(notice.is_active);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingContent("");
  };

  const handleUpdate = async (id: string) => {
    if (!editingTitle.trim() || !editingContent.trim()) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          title: editingTitle.trim(),
          content: editingContent.trim(),
          is_active: editingIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "নোটিশ আপডেট করতে সমস্যা হয়েছে।");
      }

      setEditingId(null);
      setEditingTitle("");
      setEditingContent("");
      setSuccess("নোটিশ সফলভাবে আপডেট করা হয়েছে!");
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "নোটিশ আপডেট করতে ব্যর্থ হয়েছে।");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": adminToken,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "নোটিশটি মুছতে ব্যর্থ হয়েছে।");
      }

      setSuccess("নোটিশটি সম্পূর্ণভাবে ডিলিট করা হয়েছে।");
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "নোটিশ অপসারণ ব্যর্থ হয়েছে।");
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div id="notice-manager-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Add / Edit Form Panel */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-primary/5 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-dark text-base border-b border-primary/5 pb-3 flex items-center space-x-1.5">
          <Megaphone className="h-5 w-5 text-primary" />
          <span>{editingId ? "নোটিশ সংস্করণ করুন" : "নতুন নোটিশ যোগ করুন"}</span>
        </h3>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 flex items-center space-x-1">
            <X className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 text-xs p-3 rounded-xl border border-green-100 flex items-center space-x-1">
            <Check className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        {editingId ? (
          /* Editing Form */
          <div className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">নোটিশ শিরোনাম *</label>
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                placeholder="যেমন: ভর্তি ওরিয়েন্টেশন শিডিউল ২০২৫"
                className="w-full text-xs px-3 py-2.5 border border-primary/10 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 bg-neutral-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">বিস্তারিত বিবরণ *</label>
              <textarea
                rows={5}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                placeholder="অংশগ্রহণ করতে জুম লিঙ্ক ... ইত্যাদি বিস্তারিত লিখুন"
                className="w-full text-xs px-3 py-2.5 border border-primary/10 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 bg-neutral-50/20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-is-active"
                checked={editingIsActive}
                onChange={(e) => setEditingIsActive(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="edit-is-active" className="text-xs font-bold text-gray-700 cursor-pointer">
                এই নোটিশটি সরাসরি সক্রিয় করুন
              </label>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdate(editingId)}
                className="flex-[2] text-center bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>আপডেট হচ্ছে...</span>
                  </>
                ) : (
                  <span>আপডেট সম্পন্ন করুন</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Adding Form */
          <form onSubmit={handleAdd} className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">নোটিশ শিরোনাম *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: ভর্তি ওরিয়েন্টেশন শিডিউল ২০২৫"
                className="w-full text-xs px-3 py-2.5 border border-primary/10 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 bg-neutral-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">বিস্তারিত বিবরণ *</label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="অংশগ্রহণ করতে জুম লিঙ্ক ... ইত্যাদি বিস্তারিত লিখুন"
                className="w-full text-xs px-3 py-2.5 border border-primary/10 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 bg-neutral-50/20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="add-is-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="add-is-active" className="text-xs font-bold text-gray-700 cursor-pointer">
                এই নোটিশটি সরাসরি সক্রিয় করুন
              </label>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full text-center bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1"
            >
              {adding ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>পাবলিশ করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>নোটিশ পাবলিশ করুন</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* 2. List of Existing Notices */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-primary/5 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-dark text-base border-b border-primary/5 pb-3 flex items-center space-x-1.5">
          <FileText className="h-5 w-5 text-primary" />
          <span>বিদ্যমান নোটিশসমূহ ({notices.length})</span>
        </h3>

        {notices.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            কোনো নোটিশ খুঁজে পাওয়া যায়নি। নতুন একটি যোগ করুন।
          </div>
        ) : (
          <div className="space-y-4 font-sans max-h-[500px] overflow-y-auto pr-1">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={`p-4 rounded-xl border transition-all ${
                  notice.is_active
                    ? "bg-[#fafdfb] border-primary/10 shadow-[0_2px_8px_rgba(27,67,50,0.02)]"
                    : "bg-gray-50/50 border-gray-200 text-gray-500"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`font-extrabold text-sm ${notice.is_active ? "text-dark" : "text-gray-500"}`}>
                        {notice.title}
                      </h4>
                      {notice.is_active ? (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">সক্রিয়</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded">নিষ্ক্রিয়</span>
                      )}
                    </div>
                    <p className={`text-xs whitespace-pre-line leading-relaxed ${notice.is_active ? "text-gray-700" : "text-gray-400"}`}>
                      {notice.content}
                    </p>
                    {notice.created_at && (
                      <span className="text-[10px] text-gray-400 block pt-1">
                        প্রকাশের তারিখ: {new Date(notice.created_at).toLocaleString("bn-BD")}
                      </span>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(notice)}
                      className="p-1 px-2 bg-white hover:bg-neutral-100 text-gray-600 rounded-lg border border-gray-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span className="hidden sm:inline">সম্পাদনা</span>
                    </button>
                    <button
                      type="button"
                      disabled={deleting && deletingId === notice.id}
                      onClick={() => {
                        if (confirm("আপনি কি নিশ্চিতভাবে এই নোটিশটি চিরতরে মুছে ফেলতে চান?")) {
                          handleDelete(notice.id);
                        }
                      }}
                      className="p-1 px-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition cursor-pointer"
                    >
                      {deleting && deletingId === notice.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
