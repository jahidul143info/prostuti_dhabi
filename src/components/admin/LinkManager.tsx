import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2, Link as LinkIcon, FileText, ExternalLink, Globe } from "lucide-react";
import { apiFetch as fetch } from "../../lib/apiInterceptor";
import { SharedLink } from "../../lib/types";

interface LinkManagerProps {
  adminToken: string;
  links: SharedLink[];
  onRefresh: () => Promise<void>;
}

export default function LinkManager({ adminToken, links, onRefresh }: LinkManagerProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("exam");

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingUrl, setEditingUrl] = useState("");
  const [editingCategory, setEditingCategory] = useState("exam");

  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    { id: "exam", name: "এক্সাম লিংক" },
    { id: "notes", name: "নোটস ও পিডিএফ" },
    { id: "resources", name: "সাজেশন ও শিট" },
    { id: "other", name: "অন্যান্য লিংক" },
  ];

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case "exam":
        return "এক্সাম লিংক";
      case "notes":
        return "নোটস ও পিডিএফ";
      case "resources":
        return "সাজেশন ও শিট";
      default:
        return "অন্যান্য লিংক";
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/shared-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "লিংক যোগ করতে সমস্যা হয়েছে।");
      }

      setTitle("");
      setUrl("");
      setCategory("exam");
      setSuccess("নতুন রিসোর্স লিংক সফলভাবে যুক্ত করা হয়েছে!");
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "লিংক যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (link: SharedLink) => {
    setEditingId(link.id);
    setEditingTitle(link.title);
    setEditingUrl(link.url);
    setEditingCategory(link.category);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingUrl("");
  };

  const handleUpdate = async (id: string) => {
    if (!editingTitle.trim() || !editingUrl.trim()) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/shared-links/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          title: editingTitle.trim(),
          url: editingUrl.trim(),
          category: editingCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "লিংক আপডেট করতে সমস্যা হয়েছে।");
      }

      setEditingId(null);
      setEditingTitle("");
      setEditingUrl("");
      setSuccess("লিংক সফলভাবে আপডেট করা হয়েছে!");
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "লিংক আপডেট করতে ব্যর্থ হয়েছে।");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই লিংকটি মুছে ফেলতে চান?")) return;
    
    setDeletingId(id);
    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/shared-links/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": adminToken,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "লিংকটি মুছতে ব্যর্থ হয়েছে।");
      }

      setSuccess("লিংকটি সম্পূর্ণভাবে ডিলিট করা হয়েছে।");
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "লিংক অপসারণ ব্যর্থ হয়েছে।");
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div id="link-manager-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Add / Edit Form Panel */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-primary/5 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-dark text-base border-b border-primary/5 pb-3 flex items-center space-x-1.5">
          <LinkIcon className="h-5 w-5 text-primary" />
          <span>{editingId ? "লিংক সংস্করণ করুন" : "নতুন লিংক যোগ করুন"}</span>
        </h3>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 flex items-center space-x-1 font-sans">
            <X className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 text-xs p-3 rounded-xl border border-green-100 flex items-center space-x-1 font-sans">
            <Check className="h-4 w-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {editingId ? (
          /* Editing Form */
          <div className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">রিসোর্স শিরোনাম/হেডিং *</label>
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                placeholder="যেমন: রসায়ন গুণগত রসায়ন কুইজ"
                className="w-full text-xs px-3 py-2.5 border border-primary/10 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 bg-neutral-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">লিংক/ইউআরএল (URL) *</label>
              <input
                type="url"
                value={editingUrl}
                onChange={(e) => setEditingUrl(e.target.value)}
                placeholder="যেমন: https://docs.google.com/..."
                className="w-full text-xs px-3 py-2.5 border border-primary/10 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 bg-neutral-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">রিসোর্স ক্যাটাগরি</label>
              <select
                value={editingCategory}
                onChange={(e) => setEditingCategory(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-primary/10 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 bg-neutral-50/20 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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
              <label className="block text-xs font-bold text-gray-700 mb-1">রিসোর্স শিরোনাম/হেডিং *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: পদার্থবিজ্ঞান গতিবিদ্যা হ্যান্ড নোট পিডিএফ"
                className="w-full text-xs px-3 py-2.5 border border-primary/10 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 bg-neutral-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">লিংক/ইউআরএল (URL) *</label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="যেমন: https://drive.google.com/..."
                className="w-full text-xs px-3 py-2.5 border border-primary/10 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 bg-neutral-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">রিসোর্স ক্যাটাগরি</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-primary/10 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 bg-neutral-50/20 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1 pt-3"
            >
              {adding ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>লিংক পাবলিশ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>নতুন রিসোর্স লিংক যুক্ত করুন</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* 2. List Panel */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-primary/5 shadow-xs p-5 flex flex-col min-h-[450px]">
        <h3 className="font-bold text-dark text-base border-b border-primary/5 pb-3 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Globe className="h-5 w-5 text-primary" />
            <span>শেয়ার করা লিংকসমূহ ({links.length})</span>
          </span>
        </h3>

        {links.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <LinkIcon className="h-10 w-10 text-gray-350 mb-3" />
            <p className="text-sm font-bold text-dark">কোনো লিংক শেয়ার করা হয়নি</p>
            <p className="text-xs text-muted max-w-xs mt-1">
              বামে দেওয়া ফর্মটি ব্যবহার করে শিক্ষার্থীদের জন্য পরীক্ষা, কুইজ বা পিডিএফ ড্রাইভের লিংক শেয়ার করুন।
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[550px] pr-1 mt-3">
            {links.map((link) => (
              <div key={link.id} className="py-3.5 flex items-start justify-between gap-4 group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-black tracking-tight px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/5">
                      {getCategoryName(link.category)}
                    </span>
                    <span className="text-[9px] text-gray-500 font-sans">
                      {link.created_at ? new Date(link.created_at).toLocaleString("bn-BD") : ""}
                    </span>
                  </div>
                  <h4 className="font-bold text-dark text-sm leading-snug">
                    {link.title}
                  </h4>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary/80 hover:text-primary hover:underline flex items-center gap-1.5 mt-1 font-mono break-all"
                  >
                    <span>{link.url}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleStartEdit(link)}
                    className="p-1.5 text-gray-500 hover:text-primary hover:bg-neutral-50 rounded-lg transition border border-transparent hover:border-gray-100 cursor-pointer"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    disabled={deletingId === link.id && deleting}
                    onClick={() => handleDelete(link.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition border border-transparent hover:border-red-100 cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    {deletingId === link.id && deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
