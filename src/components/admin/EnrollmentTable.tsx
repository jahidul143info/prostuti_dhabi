import React, { useState, useMemo } from "react";
import { CheckCircle2, XCircle, Search, Clock, ShieldAlert, CreditCard, MessageSquare, ListFilter } from "lucide-react";
import { Enrollment } from "../../lib/types";

interface EnrollmentTableProps {
  enrollments: Enrollment[];
  onUpdateStatus: (id: string, status: "approved" | "rejected", note?: string) => Promise<void>;
}

export default function EnrollmentTable({ enrollments, onUpdateStatus }: EnrollmentTableProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [showNoteModal, setShowNoteModal] = useState<string | null>(null);

  // Filter state list
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((en) => {
      const matchStatus = activeFilter === "all" || en.status === activeFilter;
      const matchSearch =
        en.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        en.student_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        en.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (en.course_title && en.course_title.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [enrollments, activeFilter, searchTerm]);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setActioningId(id);
    try {
      await onUpdateStatus(id, status, adminNoteInput);
      setAdminNoteInput("");
      setShowNoteModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center space-x-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>অনুমোদিত</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center space-x-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <XCircle className="h-3.5 w-3.5" />
            <span>বাতিলকৃত</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>অপেক্ষমাণ</span>
          </span>
        );
    }
  };

  return (
    <div id="enrollment-management-block" className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-primary/5 shadow-sm">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none" id="enroll-filter-btns">
          <span className="text-xs font-bold text-dark flex items-center space-x-1.5 mr-2">
            <ListFilter className="h-4 w-4" />
            <span>ফিল্টার:</span>
          </span>
          {[
            { id: "all", label: "সকল আবেদন" },
            { id: "pending", label: "অপেক্ষমাণ" },
            { id: "approved", label: "অনুমোদিত" },
            { id: "rejected", label: "বাতিলকৃত" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
                activeFilter === item.id
                  ? "bg-primary text-secondary"
                  : "bg-accent/60 hover:bg-accent text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Input bar */}
        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="আবেদনকারী, ফোন বা TRX আইডি..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-neutral-50/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 border border-primary/5 focus:border-primary/20 font-sans"
          />
        </div>
      </div>

      {/* Table Data list view */}
      <div className="bg-white rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto select-none">
          {filteredEnrollments.length > 0 ? (
            <table className="min-w-full divide-y divide-primary/5">
              <thead className="bg-neutral-50 text-dark uppercase text-xs font-extrabold tracking-wider border-b border-primary/5">
                <tr>
                  <th className="px-6 py-4.5 text-left">শিক্ষার্থীর নাম ও মোবাইল</th>
                  <th className="px-6 py-4.5 text-left">কোর্সের নাম</th>
                  <th className="px-6 py-4.5 text-left">পেমেন্ট চ্যানেল ও নম্বর</th>
                  <th className="px-6 py-4.5 text-left">লেনদেন আইডি (Trx ID)</th>
                  <th className="px-6 py-4.5 text-left">আবেদনের তারিখ</th>
                  <th className="px-6 py-4.5 text-left">স্ট্যাটাস</th>
                  <th className="px-6 py-4.5 text-right">পদক্ষেপ (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-xs sm:text-sm text-gray-700 font-sans">
                {filteredEnrollments.map((en) => {
                  const paymentDisplay = en.payment_method === "bkash" ? "বিকাশ" : "নগদ";
                  const dateString = en.created_at ? new Date(en.created_at).toLocaleDateString("bn-BD", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  }) : "N/A";

                  return (
                    <tr key={en.id} className="hover:bg-neutral-50/50 transition">
                      {/* Name & Phone */}
                      <td className="px-6 py-4.5">
                        <div className="font-bold text-dark font-sans">{en.student_name}</div>
                        <div className="text-muted text-xs mt-0.5 tracking-wide">{en.student_phone}</div>
                      </td>

                      {/* Course */}
                      <td className="px-6 py-4.5">
                        <span className="font-sans font-bold text-dark">{en.course_title || "অজানা কোর্স"}</span>
                      </td>

                      {/* Payment detail logo */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            en.payment_method === "bkash" ? "bg-pink-100 text-pink-700" : "bg-orange-100 text-orange-700"
                          }`}>
                            {paymentDisplay}
                          </span>
                          <span className="text-xs text-muted leading-none mt-0.5">{en.payment_number}</span>
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="px-6 py-4.5 font-mono text-dark font-black tracking-wide bg-neutral-50/30 px-3 rounded-lg py-1.5 text-center inline-block">
                        {en.transaction_id}
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4.5 font-mono text-xs text-muted">
                        {dateString}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4.5">
                        {getStatusBadge(en.status)}
                        {en.admin_note && (
                          <p className="text-[11px] text-muted leading-tight mt-1 flex items-start space-x-1 max-w-xs">
                            <MessageSquare className="h-3 w-3 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">নোট: {en.admin_note}</span>
                          </p>
                        )}
                      </td>

                      {/* Action triggers */}
                      <td className="px-6 py-4.5 text-right space-x-2">
                        {en.status === "pending" ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Approve button */}
                            <button
                              id={`approve-btn-${en.id}`}
                              disabled={actioningId !== null}
                              onClick={() => {
                                setShowNoteModal(en.id);
                                setAdminNoteInput("");
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-lg text-xs font-bold cursor-pointer transition flex items-center space-x-1 px-3 py-1.5"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>অনুমোদন</span>
                            </button>

                            {/* Reject button */}
                            <button
                              id={`reject-btn-${en.id}`}
                              disabled={actioningId !== null}
                              onClick={() => handleAction(en.id, "rejected")}
                              className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg text-xs font-bold cursor-pointer transition flex items-center space-x-1 px-3 py-1.5"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>বাতিল</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted select-none">সম্পূর্ণ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-muted text-sm" id="enroll-empty-state">
              কোনো পেমেন্ট আবেদন পাওয়া যায়নি।
            </div>
          )}
        </div>
      </div>

      {/* Note modal when approving */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h4 className="font-bold text-dark text-base border-b border-primary/5 pb-2.5">
              যাচাইকরণ শেষ করুন
            </h4>
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-dark">
                ভর্তি নোট / ব্যাচ নাম (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="যেমন: ব্যাচ ১ এ যুক্ত করা হয়েছে।"
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-2.5 border border-primary/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
              />
            </div>
            <div className="flex justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowNoteModal(null)}
                className="bg-neutral-100 hover:bg-neutral-200 text-dark px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleAction(showNoteModal, "approved")}
                className="bg-primary text-secondary px-5 py-2 rounded-lg text-xs font-bold cursor-pointer"
              >
                নিশ্চিত করুন ও অনুমোদন দিন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
