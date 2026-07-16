import React from "react";
import { BookOpen, Calendar, ArrowUpRight } from "lucide-react";
import { Course } from "../lib/types";

interface CourseCardProps {
  course: Course;
  onSelect: (id: string) => void;
  key?: string;
}

export default function CourseCard({ course, onSelect }: CourseCardProps) {
  const isFree = course.price === 0;

  return (
    <div
      id={`course-card-${course.id}`}
      className="group bg-white rounded-3xl overflow-hidden border border-primary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(27,67,50,0.08)] hover:border-primary/20 flex flex-col h-full cursor-pointer"
      onClick={() => onSelect(course.id)}
    >
      {/* Cover Photo with overlay */}
      <div className="relative aspect-[16/10] bg-primary/20 overflow-hidden w-full">
        {course.cover_photo_url ? (
          <img
            src={course.cover_photo_url}
            alt={course.title}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center p-6 text-white text-center font-bold">
            {course.title}
          </div>
        )}
        <div className="absolute top-4 left-4 bg-primary text-secondary text-xs font-bold px-3.5 py-1 rounded-xl border border-secondary/30 shadow-md uppercase tracking-wider font-sans">
          {course.category}
        </div>
      </div>

      {/* Card Contents */}
      <div className="p-6 sm:p-7 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-dark text-lg sm:text-xl font-bold mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Short description */}
        <p className="text-gray-500 text-xs sm:text-sm mb-6 leading-relaxed flex-grow line-clamp-2">
          {course.short_description}
        </p>

        {/* Course specs icons */}
        <div className="grid grid-cols-2 gap-3 py-3.5 border-t border-b border-primary/5 text-gray-600 text-xs font-semibold mb-5">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4.5 w-4.5 text-primary" />
            <span>সময়কাল: {course.duration || "N/A"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4.5 w-4.5 text-primary" />
            <span>লেকচার: {course.total_classes ? `${course.total_classes}টি` : "উন্মুক্ত"}</span>
          </div>
        </div>

        {/* Price & Primary Action */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <span className="text-[10px] text-gray-400 block -mb-1 uppercase tracking-wider">কোর্স ফি</span>
            <span className="text-primary text-2xl font-black font-sans">
              {isFree ? "বিনামূল্যে" : `${course.price.toLocaleString("en-BD")} ৳`}
            </span>
          </div>

          <button
            id={`course-view-btn-${course.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(course.id);
            }}
            className="bg-accent/80 hover:bg-primary text-primary hover:text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition-all group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(27,67,50,0.15)]"
          >
            <span>বিস্তারিত দেখুন</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
