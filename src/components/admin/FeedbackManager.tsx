import React, { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, Trash2, AlertCircle, RefreshCw, MessageSquare } from "lucide-react";
import { StudentFeedback } from "../../lib/types";
import { apiFetch as fetch } from "../../lib/apiInterceptor";

interface FeedbackManagerProps {
  adminToken: string;
}

export default function FeedbackManager({ adminToken }: FeedbackManagerProps) {
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const fetchAllFeedbacks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/feedbacks", {
        headers: { "x-admin-token": adminToken }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      } else {
        setError("ফিডব্যাক তালিকা লোড করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setError("সার্ভার কানেকশন ত্রুটি।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchAllFeedbacks();
    }
  }, [adminToken]);

  const handleToggleApproval = async (fb: StudentFeedback) => {
    setStatusMsg("");
    const newStatus = !fb.is_approved;
    try {
      const res = await fetch(`/api/admin/feedbacks/${fb.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify({ is_approved: newStatus })
      });

      if (res.ok) {
        setFeedbacks(prev =>
          prev.map(item =>
            item.id === fb.id ? { ...item, is_approved: newStatus } : item
          )
        );
        setStatusMsg(
          newStatus ? "ফিডব্যাকটি সফলভাবে অনুমোদন করা হয়েছে।" : "ফিডব্যাকটির অনুমোদন বাতিল করা হয়েছে।"
        );
        setTimeout(() => setStatusMsg(""), 3000);
      } else {
        setError("অনুমোদন স্ট্যাটাস পরিবর্তন করা যায়নি।");
      }
    } catch (err) {
      setError("অনুমোদন পরিবর্তনে সার্ভার ত্রুটি।");
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ফিডব্যাকটি মুছে ফেলতে চান?")) {
      return;
    }
    setStatusMsg("");
    try {
      const res = await fetch(`/api/admin/feedbacks/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": adminToken }
      });

      if (res.ok) {
        setFeedbacks(prev => prev.filter(item => item.id !== id));
        setStatusMsg("ফিডব্যাকটি সফলভাবে মুছে ফেলা হয়েছে।");
        setTimeout(() => setStatusMsg(""), 3000);
      } else {
        setError("ফিডব্যাকটি মুছতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setError("সার্ভার সমস্যা।");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-primary/5 shadow-xs p-6 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-dark font-black text-lg flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>শিক্ষার্থী ফিডব্যাক মডারেশন</span>
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            শিক্ষার্থীদের পাঠানো রিভিউর অনুমোদন স্ট্যাটাস পরিবর্তন করুন এবং হোমপেজে প্রদর্শন নিয়ন্ত্রণ করুন।
          </p>
        </div>
        <button
          onClick={fetchAllFeedbacks}
          disabled={loading}
          className="self-start sm:self-auto bg-gray-50 hover:bg-gray-150 text-gray-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition cursor-pointer border border-gray-250"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>রিলোড করুন</span>
        </button>
      </div>

      {statusMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm p-4 rounded-xl flex items-center space-x-1.5">
          <CheckCircle className="h-4.5 w-4.5 text-green-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-4 rounded-xl flex items-center space-x-1.5">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-xs">ফিডব্যাক ডেটা লোড হচ্ছে...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-xs sm:text-sm">কোনো ফিডব্যাক পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-gray-150 text-dark font-bold text-xs">
                <th className="p-4">শিক্ষার্থীর নাম</th>
                <th className="p-4">কোর্স</th>
                <th className="p-4">রেটিং</th>
                <th className="p-4">মন্তব্য</th>
                <th className="p-4 text-center">স্ট্যাটাস</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {feedbacks.map((fb) => (
                <tr key={fb.id} className="hover:bg-neutral-50/30 transition-colors">
                  <td className="p-4 font-extrabold text-dark min-w-[120px]">
                    {fb.student_name}
                  </td>
                  <td className="p-4 text-gray-500 max-w-[180px] truncate">
                    {fb.course_name || "যাচাইকৃত শিক্ষার্থী"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`h-4 w-4 ${s <= fb.rating ? "fill-secondary text-secondary" : "text-gray-200"}`} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 min-w-[200px] leading-relaxed max-w-[300px] truncate" title={fb.comment}>
                    "{fb.comment}"
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleApproval(fb)}
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-black cursor-pointer border select-none transition-colors ${
                        fb.is_approved
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                      }`}
                      title={fb.is_approved ? "অনুমোদন বাতিল করতে ক্লিক করুন" : "অনুমোদন দিতে ক্লিক করুন"}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${fb.is_approved ? "bg-green-600" : "bg-amber-600"}`} />
                      <span>{fb.is_approved ? "অনুমোদিত" : "হোল্ড করা"}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteFeedback(fb.id)}
                      className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer inline-flex items-center"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
