import React, { useState } from "react";
import { Search, Link, FileText, ClipboardCheck, ExternalLink, RefreshCw, FolderOpen } from "lucide-react";
import { SharedLink } from "../lib/types";

interface ResourcesSectionProps {
  links: SharedLink[];
  loading?: boolean;
}

export default function ResourcesSection({ links, loading = false }: ResourcesSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "সব রিসোর্স" },
    { id: "exam", name: "এক্সাম লিংক" },
    { id: "notes", name: "নোটস ও পিডিএফ" },
    { id: "resources", name: "সাজেশন ও শিট" },
    { id: "other", name: "অন্যান্য লিংক" },
  ];

  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case "exam":
        return {
          text: "এক্সাম",
          badgeBg: "bg-red-500/10 text-red-600 border-red-200/50",
          cardBg: "bg-gradient-to-br from-red-50/50 to-white hover:from-red-50/80",
          borderHover: "hover:border-red-300 hover:shadow-[0_12px_24px_rgba(239,68,68,0.06)]",
          iconBg: "bg-red-500/10 text-red-600"
        };
      case "notes":
        return {
          text: "নোটস ও পিডিএফ",
          badgeBg: "bg-blue-500/10 text-blue-600 border-blue-200/50",
          cardBg: "bg-gradient-to-br from-blue-50/50 to-white hover:from-blue-50/80",
          borderHover: "hover:border-blue-300 hover:shadow-[0_12px_24px_rgba(59,130,246,0.06)]",
          iconBg: "bg-blue-500/10 text-blue-600"
        };
      case "resources":
        return {
          text: "সাজেশন ও শিট",
          badgeBg: "bg-emerald-500/10 text-emerald-700 border-emerald-200/50",
          cardBg: "bg-gradient-to-br from-emerald-50/50 to-white hover:from-emerald-50/80",
          borderHover: "hover:border-emerald-300 hover:shadow-[0_12px_24px_rgba(16,185,129,0.06)]",
          iconBg: "bg-emerald-500/10 text-emerald-700"
        };
      default:
        return {
          text: "অন্যান্য লিংক",
          badgeBg: "bg-amber-500/10 text-amber-700 border-amber-200/50",
          cardBg: "bg-gradient-to-br from-amber-50/40 to-white hover:from-amber-50/70",
          borderHover: "hover:border-amber-300 hover:shadow-[0_12px_24px_rgba(245,158,11,0.06)]",
          iconBg: "bg-amber-500/10 text-amber-700"
        };
    }
  };

  const getIcon = (cat: string) => {
    switch (cat) {
      case "exam":
        return <ClipboardCheck className="h-4.5 w-4.5" />;
      case "notes":
        return <FileText className="h-4.5 w-4.5" />;
      case "resources":
        return <FolderOpen className="h-4.5 w-4.5" />;
      default:
        return <Link className="h-4.5 w-4.5" />;
    }
  };

  // Filter links
  const filteredLinks = links.filter((link) => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || link.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="important-resources" className="py-16 bg-gradient-to-b from-[#f4faf7] to-white border-b border-gray-100 font-sans relative overflow-hidden">
      {/* Dynamic graphic rings */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-primary/3 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/3 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-primary/5 text-primary border border-primary/10 tracking-wide mb-3">
            <span>⚡ রিসোর্স জোন</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tight mb-2">
            গুরুত্বপূর্ণ <span className="text-primary font-extrabold">পরীক্ষা ও লেকচার লিংকসমূহ</span>
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
            ক্লাসরুম পরীক্ষা, কুইজ গুগল ফর্ম, ড্রাইভ পিডিএফ শিট এবং সাজেশনের লিংক এক জায়গায় সহজে খুঁজে পান।
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="max-w-4xl mx-auto mb-8 bg-white/80 backdrop-blur-md border border-primary/5 p-3 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_4px_20px_rgba(27,67,50,0.02)]">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-primary text-secondary shadow-md shadow-primary/10"
                    : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="রিসোর্স খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 bg-white rounded-xl outline-none text-xs font-medium focus:border-primary transition-all font-sans"
            />
          </div>
        </div>

        {/* Content Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-gray-400">রিসোর্স লোড হচ্ছে...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-12 px-6 border border-dashed border-gray-200 rounded-2xl bg-neutral-50/50">
            <FolderOpen className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-dark text-xs sm:text-sm mb-1">
              কোনো লিংক খুঁজে পাওয়া যায়নি
            </h3>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              {searchTerm
                ? "আপনার সার্চের সাথে মিলে যায় এমন কোনো রিসোর্স নেই।"
                : "এই ক্যাটাগরিতে কোনো রিসোর্স আপলোড করা হয়নি। এডমিন শীঘ্রই লিংক শেয়ার করবে!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto" id="shared-resources-grid">
            {filteredLinks.map((link) => {
              const style = getCategoryStyles(link.category);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col justify-between p-4.5 sm:p-5 ${style.cardBg} border border-primary/5 rounded-2xl ${style.borderHover} transition-all duration-300 relative overflow-hidden`}
                >
                  <div>
                    {/* Header: Icon & Tag */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className={`p-2.5 rounded-xl ${style.iconBg} transition-transform group-hover:scale-105 duration-300`}>
                        {getIcon(link.category)}
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${style.badgeBg}`}>
                        {style.text}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-dark text-xs sm:text-sm mb-3 group-hover:text-primary transition-colors leading-relaxed line-clamp-2">
                      {link.title}
                    </h3>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-2 pt-3 border-t border-gray-100/60 flex items-center justify-between text-xs text-gray-400">
                    <span className="text-[10px] font-sans font-medium">
                      {link.created_at ? new Date(link.created_at).toLocaleDateString("bn-BD") : "সম্প্রতি"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-black text-primary text-[11px] group-hover:underline">
                      প্রবেশ করুন
                      <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
