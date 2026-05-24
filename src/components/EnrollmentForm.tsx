import React, { useState, useMemo } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Sparkles, Copy, Check } from "lucide-react";
import { apiFetch as fetch } from "../lib/apiInterceptor";
import { AdminConfig, Course } from "../lib/types";

interface EnrollmentFormProps {
  course: Course;
  config: Partial<AdminConfig> | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function EnrollmentForm({ course, config, onSuccess, onCancel }: EnrollmentFormProps) {
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [senderPaymentNumber, setSenderPaymentNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic unique Reference ID generated for active session matching the screenshot
  const referenceCode = useMemo(() => {
    return "BS" + Math.floor(100000 + Math.random() * 900000);
  }, []);

  // Retrieve matching receiving merchant numbers from settings database
  const merchantNumber = useMemo(() => {
    if (paymentMethod === "bkash") {
      return config?.bkash_number || "01570238312";
    } else if (paymentMethod === "nagad") {
      return config?.nagad_number || "01570238312";
    } else {
      return config?.rocket_number || "01570238312";
    }
  }, [paymentMethod, config]);

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
      setError("অনুগ্ৰহ করে ভর্তিকৃত শিক্ষার্থীর সঠিক ১১-ডিজিটের মোবাইল নম্বরটি প্রদান করুন (যেমন: 01712345678)।");
      return;
    }

    if (!studentName.trim() || studentName.trim().length < 2) {
      setError("অনুগ্রহ করে শিক্ষার্থীর নাম সঠিকভাবে লিখুন।");
      return;
    }

    if (!senderPaymentNumber.trim() || !phonePattern.test(senderPaymentNumber.trim())) {
      setError("অনুগ্রহ করে যে নম্বরটি ব্যবহার করে টাকা পাঠিয়েছেন তা সঠিকভাবে লিখুন (১১ ডিজিটের নম্বর)।");
      return;
    }

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      setError("অনুগ্রহ করে পেমেন্ট সম্পন্ন করার পরপ্রাপ্ত সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করুন।");
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
          payment_number: senderPaymentNumber, // Storing user's payment sending phone number for validation check
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs sm:text-sm flex items-start space-x-2 border border-red-100">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Name and Student Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
        </div>

        {/* Payment Guide with Switcher Tabs */}
        <div className="space-y-4">
          <label className="block text-xs sm:text-sm font-bold text-dark">
            Payment Method <span className="text-red-500">*</span>
          </label>
          
          {/* Tab switches */}
          <div className="grid grid-cols-3 gap-3">
            {/* bKash */}
            <button
              type="button"
              onClick={() => setPaymentMethod("bkash")}
              className={`py-2.5 px-2 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all focus:outline-none cursor-pointer ${
                paymentMethod === "bkash"
                  ? "border-[#E2125D] bg-[#FDF1F5] text-[#E2125D] ring-2 ring-[#E2125D]/10"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              bKash
            </button>

            {/* Nagad */}
            <button
              type="button"
              onClick={() => setPaymentMethod("nagad")}
              className={`py-2.5 px-2 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all focus:outline-none cursor-pointer ${
                paymentMethod === "nagad"
                  ? "border-[#F05A24] bg-[#FFF5F2] text-[#F05A24] ring-2 ring-[#F05A24]/10"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              Nagad
            </button>

            {/* Rocket */}
            <button
              type="button"
              onClick={() => setPaymentMethod("rocket")}
              className={`py-2.5 px-2 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all focus:outline-none cursor-pointer ${
                paymentMethod === "rocket"
                  ? "border-[#8C338A] bg-[#FAF3FA] text-[#8C338A] ring-2 ring-[#8C338A]/10"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              Rocket
            </button>
          </div>

          {/* Guidelines Details panel */}
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-4">
            <div className="text-center font-bold text-xs sm:text-sm text-gray-700">
              {paymentMethod === "bkash" ? "bKash" : paymentMethod === "nagad" ? "Nagad" : "Rocket"} Personal Number <span className="text-[#E2125D] font-extrabold">(Send Money)</span>
            </div>

            {/* Large Merchant Number + Copy */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto">
              <span className="text-md sm:text-lg font-extrabold text-gray-900 font-sans tracking-wide">
                {merchantNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="flex items-center space-x-1 text-xs font-bold bg-neutral-100 hover:bg-neutral-200/80 text-gray-700 px-3 py-1.5 rounded-lg border border-neutral-300/40 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Reference Box centered */}
            <div className="border border-dashed border-primary/20 rounded-xl bg-primary/[0.01] p-3 text-center max-w-xs mx-auto space-y-1">
              <span className="text-[10px] text-gray-400 tracking-wider font-extrabold uppercase font-sans">
                YOUR STUDENT ID (REFERENCE)
              </span>
              <span className="block text-primary text-sm font-black font-mono tracking-widest uppercase">
                {referenceCode}
              </span>
            </div>

            {/* List instruction guidelines */}
            <div className="pt-3 border-t border-gray-200/60 text-xs sm:text-sm text-gray-700 space-y-2">
              <h5 className="font-extrabold text-gray-800 text-sm">How to Pay:</h5>
              <ol className="list-decimal pl-5 space-y-1.5 text-gray-600 font-sans">
                <li>
                  Open <span className="font-bold text-gray-800 capitalize">{paymentMethod}</span> App or Dial{" "}
                  <span className="font-bold text-primary">
                    {paymentMethod === "bkash" ? "*247#" : paymentMethod === "nagad" ? "*167#" : "*322#"}
                  </span>
                </li>
                <li>
                  Select <span className="bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded text-xs">Send Money</span> option.
                </li>
                <li>
                  Enter Number: <span className="font-bold text-gray-900">{merchantNumber}</span>
                </li>
                <li>
                  Enter Amount: <span className="font-bold text-gray-900">৳{course.price.toLocaleString("en-BD")}</span>
                </li>
                <li>
                  Enter Reference: <span className="font-bold text-primary">{referenceCode}</span>{" "}
                  <span className="text-[#E2125D] font-bold text-xs">(Mandatory)</span>
                </li>
                <li>Enter PIN to confirm.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Inputs matching screenshot 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-gray-200/60 pt-5">
          {/* Your Payment Number */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
              Your Payment Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 017..."
              value={senderPaymentNumber}
              onChange={(e) => setSenderPaymentNumber(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none font-sans"
            />
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
              Transaction ID (TrxID)
            </label>
            <input
              type="text"
              required
              placeholder="e.g., 8HG7..."
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none uppercase font-sans tracking-widest font-bold"
            />
            <span className="block text-[11px] text-gray-400 mt-1 font-sans">
              Found in the confirmation SMS from {paymentMethod === "bkash" ? "bKash" : paymentMethod === "nagad" ? "Nagad" : "Rocket"}.
            </span>
          </div>
        </div>

        {/* Buttons Cancel + Confirm */}
        <div className="flex items-center space-x-4 pt-3" id="enroll-control-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white hover:bg-neutral-50/80 text-gray-700 font-bold py-3.5 px-4 rounded-xl border border-gray-300 transition duration-200 cursor-pointer text-center text-sm"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3.5 px-6 rounded-xl transition duration-300 shadow-md cursor-pointer text-center text-sm disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
