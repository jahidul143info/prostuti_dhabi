import React, { useState } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Sparkles, Copy, Check } from "lucide-react";
import { AdminConfig, Course } from "../lib/types";

interface EnrollmentFormProps {
  course: Course;
  config: Partial<AdminConfig> | null;
  onSuccess: () => void;
}

export default function EnrollmentForm({ course, config, onSuccess }: EnrollmentFormProps) {
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad">("bkash");
  const [transactionId, setTransactionId] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-fill active merchant receiving number based on bkash or nagad configuration
  const merchantNumber = paymentMethod === "bkash" 
    ? (config?.bkash_number || "01712345678") 
    : (config?.nagad_number || "01912345678");

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(merchantNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Bangladesh telephone standard validation
    const phonePattern = /^01[3-9]\d{8}$/;
    if (!studentPhone.trim() || !phonePattern.test(studentPhone.trim())) {
      setError("অনুগ্ৰহ করে একটি সঠিক ১১-ডিজিটের বাংলাদেশী মোবাইল নম্বর প্রদান করুন (যেমন: 01712345678)।");
      return;
    }

    if (!studentName.trim() || studentName.trim().length < 2) {
      setError("অনুগ্রহ করে শিক্ষার্থীর নাম সঠিকভাবে লিখুন।");
      return;
    }

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      setError("অনুগ্রহ করে পেমেন্ট সম্পন্নের পর প্রাপ্ত ট্রানজেকশন আইডি (Transaction ID) প্রদান করুন।");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: course.id,
          student_name: studentName,
          student_phone: studentPhone,
          payment_method: paymentMethod,
          payment_number: merchantNumber,
          transaction_id: transactionId,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "পেমেন্ট রেকর্ড সাবমিট করতে কোনো সমস্যা হয়েছে।");
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 5000);
    } catch (err: any) {
      setError(err.message || "সার্ভার এর সাথে সংযোগ স্থাপন করা যাচ্ছে না। পরে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-primary/5 text-dark p-8 rounded-3xl border border-primary/20 text-center space-y-4 shadow-[0_10px_30px_rgba(27,67,50,0.05)] animate-fade-in" id="enroll-success-box">
        <div className="mx-auto w-16 h-16 bg-primary text-secondary rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black text-primary">আবেদন সফলভাবে জমা হয়েছে!</h3>
        <p className="text-xs sm:text-sm text-gray-700 max-w-md mx-auto leading-relaxed">
          আপনার পেমেন্ট বিবরণী (<span className="font-semibold text-primary">{transactionId}</span>) অ্যাডমিন প্যানেলে যাচাইকরণের জন্য পাঠানো হয়েছে। পরবর্তী ২৪ ঘণ্টার মধ্যে আপনার মোবাইল নম্বরে নিশ্চিতকরণ এসএমএস পাঠানো হবে। যেকোনো প্রয়োজনে হেল্পলাইনে যোগাযোগ করুন।
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center space-x-1.5 bg-secondary/15 text-primary text-xs font-extrabold px-3 py-1.5 rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            <span>প্রস্তুতি ঢাবিতে আপনাকে স্বাগতম!</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="enrollment-form-container"
      className="bg-white p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-[0_15px_40px_rgba(27,67,50,0.06)] space-y-6"
    >
      <div className="border-b border-primary/5 pb-4">
        <h3 className="text-xl font-bold text-dark flex items-center space-x-2">
          <CreditCard className="h-5.5 w-5.5 text-primary" />
          <span>ভর্তি তথ্য পূরণ করুন</span>
        </h3>
        <p className="text-muted text-xs mt-1">
          কোর্সে অংশগ্রহণ নিশ্চিত করতে প্রথমে পেমেন্ট প্রদানপূর্বক সঠিক ট্রানজেকশন ডেটা সাবমিট করুন।
        </p>
      </div>

      {/* Merchant Number Instruction Panel */}
      <div className="bg-accent/40 border border-primary/10 rounded-2xl p-5 text-dark space-y-3">
        <span className="text-[11px] bg-primary text-secondary px-2.5 py-0.5 rounded-full font-bold">
          পেমেন্ট নির্দেশনাবলী
        </span>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
          আপনার পছন্দসই <span className="font-bold">বিকাশ বা নগদ</span> পার্সোন্যাল অ্যাকাউন্ট থেকে নিচের নম্বরে মোট <span className="font-bold text-primary font-sans">{course.price.toLocaleString("en-BD")} ৳</span> টাকা 'সেন্ড মানি' (Send Money) করুন।
        </p>
        
        <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-primary/10">
          <div>
            <span className="text-[10px] text-muted block">সেন্ড মানি করার নম্বর</span>
            <span className="text-primary text-base font-extrabold tracking-wide font-sans">
              {merchantNumber} ({paymentMethod === "bkash" ? "বিকাশ" : "নগদ"})
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyNumber}
            className="flex items-center space-x-1 text-primary hover:text-secondary text-xs font-bold bg-accent/40 px-3 py-2 rounded-lg border border-primary/5 cursor-pointer hover:bg-neutral-100"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600">কপি হয়েছে</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>নম্বর কপি</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs sm:text-sm flex items-start space-x-2 border border-red-100">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Name in Bengali */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            শিক্ষার্থীর নাম <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="আপনার পূর্ণ নাম লিখুন"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full text-xs sm:text-sm px-4 py-3 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none focus:bg-white bg-neutral-50/50"
          />
        </div>

        {/* Mobile Number/Phone */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            মোবাইল নম্বর <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="01XXXXXXXXX"
            value={studentPhone}
            onChange={(e) => setStudentPhone(e.target.value)}
            className="w-full text-xs sm:text-sm px-4 py-3 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none focus:bg-white bg-neutral-50/50 font-sans"
          />
        </div>

        {/* Payment Channels selector */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-dark mb-2">
            পেমেন্ট পদ্ধতি নির্বাচন করুন <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            {/* bKash */}
            <label
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                paymentMethod === "bkash"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-primary/10 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === "bkash"}
                  onChange={() => setPaymentMethod("bkash")}
                  className="accent-primary"
                />
                <span className="text-xs sm:text-sm font-bold text-dark">বিকাশ (bKash)</span>
              </div>
              <span className="bg-pink-100 text-pink-700 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase font-sans">
                bkash
              </span>
            </label>

            {/* Nagad */}
            <label
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                paymentMethod === "nagad"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-primary/10 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === "nagad"}
                  onChange={() => setPaymentMethod("nagad")}
                  className="accent-primary"
                />
                <span className="text-xs sm:text-sm font-bold text-dark">নগদ (Nagad)</span>
              </div>
              <span className="bg-orange-100 text-orange-700 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase font-sans">
                nagad
              </span>
            </label>
          </div>
        </div>

        {/* Transaction ID */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-dark mb-1.5">
            লেনদেন আইডি (Transaction ID) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="যেমন: MPK8D2SS1"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full text-xs sm:text-sm px-4 py-3 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none focus:bg-white bg-neutral-50/50 uppercase font-sans tracking-widest font-bold"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary hover:bg-secondary/95 text-dark font-black py-4 px-6 rounded-2xl transition-transform duration-300 hover:scale-[1.01] shadow-lg cursor-pointer"
        >
          {loading ? "আবেদন জমা হচ্ছে..." : "ভর্তি নিশ্চিত করতে আবেদন করুন"}
        </button>
      </form>
    </div>
  );
}
