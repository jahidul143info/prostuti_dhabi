import React, { useState } from "react";
import { BookOpen, Calendar, ArrowUpRight, Users, Share2, Check } from "lucide-react";
import { Course, createCourseSlug } from "../lib/types";
import CountdownTimer from "./CountdownTimer";

interface CourseCardProps {
  course: Course;
  onSelect: (id: string) => void;
  key?: string;
}

export default function CourseCard({ course, onSelect }: CourseCardProps) {
  const isFree = course.price === 0;
  const [copied, setCopied] = useState(false);

  const handleCopyDirectLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const slug = createCourseSlug(course);
    const url = `${window.location.origin}${window.location.pathname}?course=${encodeURIComponent(slug)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`course-card-${course.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-primary/5 transition-all duration-300 hover:-translate-y-1.5 premium-card-shadow premium-card-shadow-hover hover:border-primary/20 flex flex-col h-full cursor-pointer relative"
      onClick={() => onSelect(course.id)}
    >
      {/* Cover Photo with overlay */}
      <div className="relative aspect-[16/10] bg-primary/10 overflow-hidden w-full">
        {course.cover_photo_url ? (
          <img
            src={course.cover_photo_url}
            alt={course.title}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-103"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center p-6 text-white text-center font-bold">
            {course.title}
          </div>
        )}
        <div className="absolute top-3 left-3 bg-primary text-secondary text-[10px] font-black px-2.5 py-1 rounded-lg border border-secondary/20 shadow-md uppercase tracking-wider font-sans">
          {course.category}
        </div>
      </div>

      {/* Card Contents */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        {/* Top Row under cover photo: Timer (Left) & Enrolled Students Tag (Right) */}
        {(course.enrolled_count || (course.timer_enabled && course.timer_end_time)) && (
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              {course.timer_enabled && course.timer_end_time && (
                <CountdownTimer
                  endTime={course.timer_end_time}
                  label={course.timer_label || "অফার শেষ হতে বাকি:"}
                  variant="card"
                />
              )}
            </div>

            {course.enrolled_count && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 text-primary font-extrabold text-[11px] border border-primary/15 shrink-0 ml-auto font-sans shadow-2xs">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>{course.enrolled_count} শিক্ষার্থী</span>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-dark text-base sm:text-lg font-extrabold mb-2 line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Short description */}
        <p className="text-gray-500 text-[11px] sm:text-xs mb-4 leading-relaxed flex-grow line-clamp-2">
          {course.short_description}
        </p>

        {/* Course specs icons */}
        <div className="grid grid-cols-2 gap-2.5 py-3 border-t border-b border-gray-100 text-gray-500 text-[11px] font-semibold mb-4">
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-4 w-4 text-primary opacity-80 shrink-0" />
            <span className="truncate">সময়কাল: {course.duration || "N/A"}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <BookOpen className="h-4 w-4 text-primary opacity-80 shrink-0" />
            <span className="truncate">লেকচার: {course.total_classes ? `${course.total_classes}টি` : "উন্মুক্ত"}</span>
          </div>
        </div>

        {/* Price & Primary Action */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <span className="text-[9px] text-gray-400 block -mb-0.5 uppercase tracking-wider">কোর্স ফি</span>
            <span className="text-primary text-xl font-black font-sans">
              {isFree ? "বিনামূল্যে" : `${course.price.toLocaleString("en-BD")} ৳`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyDirectLink}
              title={copied ? "কপি হয়েছে!" : "কোর্স ডাইরেক্ট লিংক কপি করুন"}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                copied 
                  ? "bg-green-500/10 border-green-500/30 text-green-700" 
                  : "border-primary/10 bg-primary/5 hover:bg-primary/15 text-primary"
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-primary" />}
            </button>

            <button
              id={`course-view-btn-${course.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(course.id);
              }}
              className="bg-accent text-primary border border-primary/5 hover:bg-primary hover:text-white px-3.5 py-2.5 rounded-xl text-[11px] font-extrabold flex items-center space-x-1 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-md cursor-pointer"
            >
              <span>বিস্তারিত</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
