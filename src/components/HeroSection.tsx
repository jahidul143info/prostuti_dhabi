import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { AdminConfig } from "../lib/types";

interface HeroSectionProps {
  config: AdminConfig | null;
  onSeeCourses: () => void;
  onSeeAbout: () => void;
}

export default function HeroSection({ config, onSeeCourses, onSeeAbout }: HeroSectionProps) {
  // Stagger parameters for layout reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div
      id="hero-container"
      className="relative min-h-screen flex items-center justify-center animated-mesh overflow-hidden pt-28 pb-16"
    >
      {/* Decorative ambient glowing circles */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-secondary/15 rounded-full blur-[100px] pointer-events-none animate-pulse duration-5000" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-8000" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center flex flex-col items-center justify-center"
        >
          {/* Tagline Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-secondary/10 via-secondary/20 to-secondary/10 border border-secondary/40 rounded-full px-5 py-2 mb-8 shadow-[0_4px_20px_rgba(212,160,23,0.15)] backdrop-blur-md"
            id="hero-badge-container"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary text-xs sm:text-sm font-extrabold tracking-wider uppercase font-sans">
              ঢাকা বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি ২০২৬
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-white text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-[1.15] drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
            id="hero-headline"
          >
            স্বপ্ন তোমার, <span className="text-secondary bg-clip-text drop-shadow-[0_0_15px_rgba(212,160,23,0.2)]">চেষ্টা আমাদের</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-white/90 text-base sm:text-xl font-medium max-w-2xl leading-relaxed mb-12 drop-shadow-sm px-4"
            id="hero-subtitle"
          >
            ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষায় মেধা-তালিকায় শীর্ষস্থান নিশ্চিত করতে অভিজ্ঞ শিক্ষক মণ্ডলীর সরাসরি তত্ত্বাবধানে সেরা ডিজিটাল প্ল্যাটফর্ম।
          </motion.p>

          {/* Action CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5 mb-14 w-full justify-center max-w-lg px-4"
            id="hero-cta-group"
          >
            <button
              id="hero-btn-see-courses"
              onClick={onSeeCourses}
              className="bg-secondary hover:bg-secondary/95 text-dark font-black text-sm sm:text-base px-9 py-4.5 rounded-2xl flex items-center justify-center space-x-2.5 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-[0_12px_30px_rgba(212,160,23,0.35)] cursor-pointer group"
            >
              <span>কোর্সসমূহ দেখুন</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5 text-dark" />
            </button>

            <button
              id="hero-btn-see-about"
              onClick={onSeeAbout}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/45 font-bold text-sm sm:text-base px-9 py-4.5 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer backdrop-blur-md"
            >
              <span>আমাদের সম্পর্কে</span>
            </button>
          </motion.div>

          {/* Premium Trust Indicators / Feature Highlights Bar */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 mt-4 px-6 py-6 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-xl max-w-3xl w-full"
          >
            <div className="text-center">
              <p className="text-secondary text-2xl sm:text-3xl font-black font-sans">
                {config?.success_student_count || "৫,০০০+"}
              </p>
              <p className="text-white/60 text-xs mt-1">সফল শিক্ষার্থী ও ভর্তিযোদ্ধা</p>
            </div>
            <div className="text-center border-y sm:border-y-0 sm:border-x border-white/10 py-4 sm:py-0">
              <p className="text-secondary text-2xl sm:text-3xl font-black font-sans">১০০%</p>
              <p className="text-white/60 text-xs mt-1">কমন উপযোগী লেকচার শিট</p>
            </div>
            <div className="text-center">
              <p className="text-secondary text-2xl sm:text-3xl font-black font-sans">
                {config?.review_count || "150+"}
              </p>
              <p className="text-white/60 text-xs mt-1">
                {config?.review_label || "Review"}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
