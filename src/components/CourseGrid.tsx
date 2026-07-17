import React, { useState, useMemo } from "react";
import { Course } from "../lib/types";
import CourseCard from "./CourseCard";
import { Search, SlidersHorizontal } from "lucide-react";

interface CourseGridProps {
  courses: Course[];
  categories?: Array<{ id: string; name: string }>;
  onSelectCourse: (id: string) => void;
}

export default function CourseGrid({ courses, categories = [], onSelectCourse }: CourseGridProps) {
  const [activeCategory, setActiveCategory] = useState("সকল");
  const [searchTerm, setSearchTerm] = useState("");

  const [showAll, setShowAll] = useState(false);

  const filterCategories = useMemo(() => {
    const list = categories.length > 0 
      ? categories.map(c => c.name) 
      : ["বিজ্ঞান", "মানবিক", "ব্যবসায়", "অন্যান্য"];
    return ["সকল", ...list];
  }, [categories]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchCat = activeCategory === "সকল" || course.category === activeCategory;
      const matchSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.short_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [courses, activeCategory, searchTerm]);

  const displayedCourses = useMemo(() => {
    return showAll ? filteredCourses : filteredCourses.slice(0, 3);
  }, [showAll, filteredCourses]);

  return (
    <section id="courses" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 bg-accent text-primary px-4 py-1.5 rounded-full text-xs font-bold mb-4 font-sans uppercase tracking-widest">
            <span>📚 Course Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-dark tracking-tight mb-4">
            আমাদের <span className="text-primary">বিশেষায়িত লাইভ কোর্সসমূহ</span>
          </h2>
          <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
            ঢাকা বিশ্ববিদ্যালয়ের বিগত বছরের প্রশ্নের ধারা বিশ্লেষণ করে প্রণীত আমাদের কোর্সগুলো নিশ্চিত করবে তোমার ভর্তি পরীক্ষার সর্বোচ্চ প্রস্তুতি।
          </p>
        </div>

        {/* Filter Toolbar Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 pb-6 border-b border-primary/5">
          {/* Quick Tabs filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none" id="course-filter-panel">
            {filterCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary text-secondary shadow-md scale-102"
                    : "bg-accent/60 hover:bg-accent text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box filter */}
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="কোর্স অনুসন্ধান করুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-accent/30 focus:bg-white text-dark rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border border-primary/5 focus:border-primary/20 font-sans font-medium transition-colors placeholder:text-muted/65"
            />
          </div>
        </div>

        {/* Courses Listing Grid */}
        {filteredCourses.length > 0 ? (
          <>
            <div
              id="course-grid-catalog"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {displayedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onSelect={onSelectCourse}
                />
              ))}
            </div>

            {filteredCourses.length > 3 && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-7 py-3 rounded-2xl text-xs sm:text-sm font-black text-primary border border-primary/25 bg-white hover:bg-primary/5 hover:border-primary/45 hover:scale-102 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_16px_rgba(27,67,50,0.03)]"
                >
                  {showAll ? (
                    <>
                      <span>সংকুচিত করুন</span>
                      <span>⬆️</span>
                    </>
                  ) : (
                    <>
                      <span>সবগুলো কোর্স দেখুন ({filteredCourses.length}টি)</span>
                      <span>⬇️</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-accent/20 rounded-3xl max-w-xl mx-auto border border-primary/5">
            <SlidersHorizontal className="h-10 w-10 text-muted mx-auto mb-4" />
            <h4 className="text-lg font-bold text-dark mb-1">কোনো কোর্স পাওয়া যায়নি</h4>
            <p className="text-muted text-xs sm:text-sm">
              অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন অথবা ক্যাটাগরি ফিল্টার পরিবর্তন করুন।
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
