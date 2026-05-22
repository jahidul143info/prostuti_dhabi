import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onSeeCourses: () => void;
  onSeeAbout: () => void;
}

export default function HeroSection({ onSeeCourses, onSeeAbout }: HeroSectionProps) {
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
            className="inline-flex items-center space-x-2 bg-secondary/10 border border-secondary/30 rounded-full px-4.5 py-1.5 mb-6 shadow-[0_0_20px_rgba(212,160,23,0.1)]"
            id="hero-badge-container"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
            <span className="text-secondary text-xs sm:text-sm font-semibold tracking-wider font-sans">
              ঢাকা বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-white text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl"
            id="hero-headline"
          >
            স্বপ্ন তোমার, <span className="text-secondary bg-clip-text">চেষ্টা আমাদের</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-white/80 text-[16px] sm:text-[20px] font-medium max-w-2xl leading-relaxed mb-10"
            id="hero-subtitle"
          >
            ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষায় মেধা-তালিকায় শীর্ষস্থান নিশ্চিত করতে অভিজ্ঞ শিক্ষক মণ্ডলীর সরাসরি তত্ত্বাবধানে সেরা ডিজিটাল প্ল্যাটফর্ম।
          </motion.p>

          {/* Action CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5 mb-8 w-full justify-center max-w-md px-4"
            id="hero-cta-group"
          >
            <button
              id="hero-btn-see-courses"
              onClick={onSeeCourses}
              className="bg-secondary hover:bg-secondary/95 text-dark font-extrabold px-8 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_25px_rgba(212,160,23,0.25)] cursor-pointer group"
            >
              <span>কোর্সসমূহ দেখুন</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              id="hero-btn-see-about"
              onClick={onSeeAbout}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/40 font-bold px-8 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <span>আমাদের সম্পর্কে</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
