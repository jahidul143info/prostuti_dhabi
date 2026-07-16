import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, MessageSquare, Quote, Send, CheckCircle2, AlertCircle, Plus, Sparkles } from "lucide-react";
import { StudentFeedback, Course } from "../lib/types";

interface FeedbackSectionProps {
  courses: Course[];
}

export default function FeedbackSection({ courses }: FeedbackSectionProps) {
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [studentName, setStudentName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("/api/feedbacks");
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    if (!studentName.trim()) {
      setSubmitError("অনুগ্রহ করে আপনার নাম লিখুন।");
      setSubmitting(false);
      return;
    }
    if (!comment.trim()) {
      setSubmitError("অনুগ্রহ করে আপনার মন্তব্য লিখুন।");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: studentName,
          rating,
          comment,
          course_name: selectedCourse
        })
      });

      if (res.ok) {
        const newFb = await res.json();
        setSubmitSuccess(true);
        // Add new feedback to the top of the list instantly!
        setFeedbacks(prev => [newFb, ...prev]);
        
        // Reset form
        setStudentName("");
        setRating(5);
        setComment("");
        setSelectedCourse("");
        
        // Hide success message and form after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
          setShowForm(false);
        }, 3000);
      } else {
        const errData = await res.json();
        setSubmitError(errData.error || "ফিডব্যাক সাবমিট করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      setSubmitError("সার্ভার কানেকশন সমস্যা। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate statistics
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : "5.0";

  const totalReviews = feedbacks.length;

  return (
    <section id="student-feedbacks" className="py-20 bg-gradient-to-b from-[#fafdfb] to-[#f4faf7] relative overflow-hidden font-sans">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-64 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary/5 border border-primary/10 px-4 py-1.5 rounded-full text-primary text-xs font-bold tracking-wide">
            <Sparkles className="h-4 w-4 text-secondary" />
            <span>সফল শিক্ষার্থীদের অনুভূতি</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-dark tracking-tight leading-tight">
            আমাদের শিক্ষার্থীদের <span className="text-primary font-extrabold relative inline-block">
              মূল্যবান ফিডব্যাকসমূহ
              <span className="absolute left-0 bottom-1 w-full h-1.5 bg-secondary/30 rounded-full" />
            </span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            ইতিমধ্যে প্রস্তুতি ঢাবির সাহায্যে সফল হওয়া শিক্ষার্থীরা আমাদের সেবা ও মেন্টরশিপ সম্পর্কে কী বলছে তা দেখে নিন।
          </p>
        </div>

        {/* Stats and Action Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-center">
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white border border-primary/5 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/5 h-16 w-16 rounded-2xl flex flex-col items-center justify-center border border-primary/10">
                <span className="text-2xl font-black text-primary font-sans">{averageRating}</span>
                <span className="text-[10px] text-gray-400 font-bold -mt-1 uppercase">রেটিং</span>
              </div>
              <div>
                <div className="flex items-center space-x-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`h-5 w-5 ${s <= Math.round(Number(averageRating)) ? "fill-secondary text-secondary" : "text-gray-200"}`} 
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                  সর্বমোট <span className="font-bold text-dark font-sans">{totalReviews}টি</span> যাচাইকৃত মতামত
                </p>
              </div>
            </div>
            
            <div className="hidden sm:block h-10 w-px bg-gray-200" />

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md">
              আমাদের সফল হওয়া প্রতি ৩ জন শিক্ষার্থীর ২ জনই এই অনলাইন পোর্টাল ও এক্সাম সিস্টেম ব্যবহার করে নিজেদের ঢাকা বিশ্ববিদ্যালয় স্বপ্ন পূরণ করেছেন।
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-end">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setSubmitSuccess(false);
              }}
              className="w-full lg:w-auto bg-primary text-secondary hover:bg-primary-dark font-black px-6 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-lg active:scale-98 cursor-pointer border border-primary/10"
            >
              <MessageSquare className="h-5 w-5" />
              <span>{showForm ? "মতামত ফর্ম বন্ধ করুন" : "আপনার মতামত দিন"}</span>
            </button>
          </div>
        </div>

        {/* Form Expansion Section */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="bg-white border-2 border-primary/10 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl relative">
                <h3 className="text-xl font-bold text-dark mb-1 flex items-center space-x-2">
                  <span className="w-2 h-6 bg-secondary rounded-full" />
                  <span>আপনার অনুভূতি আমাদের জানান</span>
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-6">
                  আপনার একটি সুন্দর রিভিউ আমাদের আগামী দিনের হাজারো শিক্ষার্থীদের স্বপ্ন পূরণে পথ দেখাবে।
                </p>

                {submitSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center flex flex-col items-center justify-center space-y-3"
                  >
                    <CheckCircle2 className="h-12 w-12 text-green-600 animate-bounce" />
                    <h4 className="font-bold text-base sm:text-lg">রিভিউ সফলভাবে সাবমিট হয়েছে!</h4>
                    <p className="text-xs sm:text-sm text-green-700 max-w-sm">
                      ধন্যবাদ! আপনার মূল্যবান মতামতটি সফলভাবে সংরক্ষিত হয়েছে এবং হোমপেজে যুক্ত করা হয়েছে।
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {submitError && (
                      <div className="bg-red-50 border border-red-150 text-red-700 p-4 rounded-xl flex items-center space-x-2 text-xs sm:text-sm">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-dark mb-1.5">আপনার নাম <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="যেমন: সাকিব চৌধুরী"
                          className="w-full px-4 py-3 border border-primary/10 rounded-xl outline-none focus:border-primary transition-all font-sans text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-dark mb-1.5">কোর্স নির্বাচন করুন (ঐচ্ছিক)</label>
                        <select
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className="w-full px-4 py-3 border border-primary/10 rounded-xl bg-white outline-none focus:border-primary transition-all font-sans text-sm"
                        >
                          <option value="">-- কোনো কোর্স নেই --</option>
                          {courses.map(c => (
                            <option key={c.id} value={c.title}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Star selection */}
                    <div>
                      <label className="block text-xs font-bold text-dark mb-2">রেটিং নির্বাচন করুন <span className="text-red-500">*</span></label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((s) => {
                          const isLit = hoverRating !== null ? s <= hoverRating : s <= rating;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRating(s)}
                              onMouseEnter={() => setHoverRating(s)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="focus:outline-none transition-transform active:scale-90 hover:scale-110 cursor-pointer"
                              title={`${s} স্টার`}
                            >
                              <Star 
                                className={`h-8 w-8 ${
                                  isLit 
                                    ? "fill-secondary text-secondary drop-shadow-[0_0_4px_rgba(212,160,23,0.3)]" 
                                    : "text-gray-200"
                                }`} 
                              />
                            </button>
                          );
                        })}
                        <span className="text-xs sm:text-sm font-bold text-gray-500 pl-2">
                          ({rating} স্টার)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-dark mb-1.5">আপনার মন্তব্য <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="প্রস্তুতি ঢাবির ক্লাস এবং সার্ভিস আপনার প্রস্তুতিকে কীভাবে উন্নত করেছে তা বিস্তারিত লিখুন..."
                        className="w-full px-4 py-3 border border-primary/10 rounded-xl outline-none focus:border-primary transition-all text-sm leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-primary text-secondary hover:bg-primary-dark font-black text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center space-x-2 transition cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {submitting ? (
                          <span>সংরক্ষণ হচ্ছে...</span>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>ফিডব্যাক পাঠান</span>
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Reviews grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-xs sm:text-sm">ফিডব্যাকসমূহ লোড হচ্ছে...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white border border-primary/5 rounded-3xl p-12 text-center max-w-md mx-auto">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="font-bold text-dark mb-1">কোনো রিভিউ খুঁজে পাওয়া যায়নি</h4>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
              এখনও কোনো শিক্ষার্থী ফিডব্যাক দেয়নি। প্রথম মতামতটি প্রদান করতে নিচের বাটনে চাপুন।
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              প্রথম ফিডব্যাক লিখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {feedbacks.map((fb) => (
                <motion.div
                  key={fb.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white border border-primary/5 p-7 rounded-3xl shadow-[0_10px_30px_rgba(27,67,50,0.02)] hover:shadow-[0_15px_35px_rgba(27,67,50,0.06)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative"
                >
                  {/* Quote decoration */}
                  <div className="absolute top-6 right-6 text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none">
                    <Quote className="h-10 w-10 rotate-180" />
                  </div>

                  <div>
                    {/* Stars */}
                    <div className="flex items-center space-x-0.5 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`h-4.5 w-4.5 ${s <= fb.rating ? "fill-secondary text-secondary" : "text-gray-100"}`} 
                        />
                      ))}
                    </div>

                    {/* Comment text */}
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                      "{fb.comment}"
                    </p>
                  </div>

                  {/* Student details */}
                  <div className="flex items-center space-x-3 border-t border-gray-50 pt-4">
                    <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center font-bold text-primary font-sans">
                      {fb.student_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-dark text-xs sm:text-sm">
                        {fb.student_name}
                      </h4>
                      {fb.course_name ? (
                        <span className="text-[10px] text-primary bg-primary/5 font-semibold px-2 py-0.5 rounded-md mt-1 inline-block max-w-[200px] truncate" title={fb.course_name}>
                          {fb.course_name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 mt-1 inline-block">
                          যাচাইকৃত শিক্ষার্থী
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </section>
  );
}
