import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CategoryManagerProps {
  adminToken: string;
  categories: Category[];
  onRefresh: () => Promise<void>;
}

export default function CategoryManager({ adminToken, categories, onRefresh }: CategoryManagerProps) {
  const [newCatName, setNewCatName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ name: newCatName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ক্যাটাগরি যোগ করতে সমস্যা হয়েছে।");
      }

      setNewCatName("");
      setSuccess("নতুন ক্যাটাগরি সফলভাবে যোগ করা হয়েছে!");
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "ক্যাটাগরি যোগ ব্যর্থ হয়েছে।");
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ক্যাটাগরি আপডেট করতে সমস্যা হয়েছে।");
      }

      setEditingId(null);
      setEditingName("");
      setSuccess("ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!");
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "ক্যাটাগরি আপডেট ব্যর্থ হয়েছে।");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": adminToken,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ক্যাটাগরি মুছতে সমস্যা হয়েছে।");
      }

      setDeletingId(null);
      setSuccess("ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে!");
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "ক্যাটাগরি মুছতে ব্যর্থ হয়েছে।");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 text-red-700 text-xs sm:text-sm p-4 rounded-xl border border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-[#f0fdf4] text-primary text-xs sm:text-sm p-4 rounded-xl border border-primary/10 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="text-primary hover:text-dark">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Grid: Create New + List Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Input form card */}
        <div className="bg-white border border-primary/10 rounded-2xl p-5 sm:p-6 shadow-xs h-fit">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
              <Tag className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-dark text-base sm:text-lg">নতুন ক্যাটাগরি তৈরি</h3>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-dark mb-1.5">ক্যাটাগরির নাম</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="যেমন: প্রিপারেশন, আইসিটি"
                className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={adding || !newCatName.trim()}
              className="w-full flex items-center justify-center space-x-2 text-xs sm:text-sm font-bold bg-primary hover:bg-primary/95 text-secondary px-4 py-3 rounded-xl transition cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>তৈরি করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4.5 w-4.5" />
                  <span>ক্যাটাগরি যোগ করুন</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Categories Table list Card */}
        <div className="lg:col-span-2 bg-white border border-primary/10 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 className="font-bold text-dark text-base sm:text-lg mb-4">বিদ্যমান কোর্স ক্যাটাগরিসমূহ</h3>
          
          {categories.length === 0 ? (
            <div className="text-center py-10 text-muted text-xs sm:text-sm">
              <p>কোনো ক্যাটাগরি পাওয়া যায়নি!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className="border-b border-primary/5 text-xs text-muted/80 uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">নাম (Name)</th>
                    <th className="py-3 px-4 font-bold text-right">অ্যাকশন (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5 text-xs sm:text-sm">
                  {categories.map((cat) => {
                    const isEditing = editingId === cat.id;

                    return (
                      <tr key={cat.id} className="hover:bg-accent/10 transition-colors">
                        <td className="py-3 px-4 font-medium text-dark">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="w-full px-3 py-1.5 border border-primary/15 rounded-lg outline-none focus:ring-2 focus:ring-primary/10"
                            />
                          ) : (
                            <span>{cat.name}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(cat.id)}
                                  disabled={updating || !editingName.trim()}
                                  title="সংরক্ষণ করুন"
                                  className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {updating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  title="বাতিল করুন"
                                  className="p-1.5 hover:bg-neutral-50 text-muted rounded-lg transition-colors cursor-pointer"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(cat)}
                                  title="এডিট করুন"
                                  className="p-1.5 hover:bg-neutral-50 text-primary hover:text-dark rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                
                                {deletingId === cat.id ? (
                                  <div className="flex items-center space-x-1 border border-red-100 rounded-xl p-1 bg-red-50/50">
                                    <span className="text-[10px] text-red-600 font-bold px-1.5">নিশ্চিত?</span>
                                    <button
                                      onClick={() => handleDelete(cat.id)}
                                      disabled={deleting}
                                      className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded-lg disabled:opacity-50"
                                    >
                                      {deleting ? "..." : "হ্যাঁ"}
                                    </button>
                                    <button
                                      onClick={() => setDeletingId(null)}
                                      className="text-xs bg-gray-200 hover:bg-gray-300 text-dark font-bold px-2 py-1 rounded-lg"
                                    >
                                      না
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeletingId(cat.id)}
                                    title="মুছে ফেলুন"
                                    className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
