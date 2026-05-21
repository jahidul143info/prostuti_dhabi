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
      className="group bg-white rounded-2xl overflow-hidden border border-primary/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_15px_30px_rgba(27,67,50,0.1)] hover:border-secondary flex flex-col h-full cursor-pointer"
      onClick={() => onSelect(course.id)}
    >
      {/* Cover Photo with overlay */}
      <div className="relative aspect-[16/10] bg-primary/20 overflow-hidden w-full">
        {course.cover_photo_url ? (
          <img
            src={course.cover_photo_url}
            alt={course.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center p-6 text-white text-center font-bold">
            {course.title}
          </div>
        )}
        <div className="absolute top-4 left-4 bg-primary text-secondary text-[11px] font-bold px-3 py-1 rounded-full border border-secondary shadow-md uppercase tracking-wider font-sans">
          {course.category}
        </div>
      </div>

      {/* Card Contents */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-dark text-lg font-bold mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Short description */}
        <p className="text-muted text-xs sm:text-sm mb-5 leading-relaxed flex-grow line-clamp-2">
          {course.short_description}
        </p>

        {/* Course specs icons */}
        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-primary/5 text-gray-500 text-xs font-medium mb-4">
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            <span>সময়কাল: {course.duration || "N/A"}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>লেকচার: {course.total_classes ? `${course.total_classes}টি` : "উন্মুক্ত"}</span>
          </div>
        </div>

        {/* Price & Primary Action */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="text-[10px] text-muted block -mb-1">কোর্স ফি</span>
            <span className="text-primary text-xl font-extrabold font-sans">
              {isFree ? "বিনামূল্যে" : `${course.price.toLocaleString("en-BD")} ৳`}
            </span>
          </div>

          <button
            id={`course-view-btn-${course.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(course.id);
            }}
            className="bg-accent hover:bg-primary text-primary hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all group-hover:bg-primary group-hover:text-white"
          >
            <span>বিস্তারিত দেখুন</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
