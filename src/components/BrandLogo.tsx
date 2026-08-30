import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light";
  showImage?: boolean;
  showSubtitle?: boolean;
  className?: string;
  id?: string;
}

export default function BrandLogo({
  size = "md",
  theme = "dark",
  showImage = true,
  showSubtitle = false,
  className = "",
  id = "brand-logo",
}: BrandLogoProps) {
  // Sizing mappings
  const imageSizeClasses = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 sm:h-11 sm:w-11 rounded-xl",
    lg: "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl",
    xl: "h-16 w-16 sm:h-20 sm:w-20 rounded-2xl",
  }[size];

  const accountingTextSize = {
    sm: "text-base sm:text-lg tracking-tight",
    md: "text-lg sm:text-xl md:text-2xl tracking-tight",
    lg: "text-2xl sm:text-3xl md:text-4xl tracking-tight",
    xl: "text-3xl sm:text-5xl md:text-6xl tracking-tight",
  }[size];

  const huntersTextSize = {
    sm: "text-xs sm:text-sm tracking-wider",
    md: "text-sm sm:text-base md:text-lg tracking-wider",
    lg: "text-lg sm:text-xl md:text-2xl tracking-wider",
    xl: "text-2xl sm:text-3xl md:text-4xl tracking-wider",
  }[size];

  const targetIconSize = {
    sm: "h-3.5 w-3.5 mx-0.5",
    md: "h-4 w-4 sm:h-5 sm:w-5 mx-0.5",
    lg: "h-6 w-6 sm:h-7 sm:w-7 mx-1",
    xl: "h-8 w-8 sm:h-11 sm:w-11 mx-1",
  }[size];

  const calcIconSize = {
    sm: "h-3 w-3 mr-1",
    md: "h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5",
    lg: "h-5 w-5 sm:h-6 sm:w-6 mr-1.5",
    xl: "h-7 w-7 sm:h-8 sm:w-8 mr-2",
  }[size];

  const isLight = theme === "light";
  const baseTextColor = isLight ? "text-gray-900" : "text-white";
  const redColor = "text-[#FF1E27]";

  return (
    <div id={id} className={`flex items-center space-x-2.5 sm:space-x-3.5 select-none ${className}`}>
      {showImage && (
        <div className="relative flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <img
            src="https://res.cloudinary.com/dli4xunsm/image/upload/v1788068781/ac._n84wzy.jpg"
            alt="Accounting Hunters Logo"
            referrerPolicy="no-referrer"
            className={`${imageSizeClasses} object-cover border ${
              isLight ? "border-black/10 shadow-sm" : "border-white/20 shadow-lg shadow-black/40"
            }`}
          />
        </div>
      )}

      <div className="flex flex-col justify-center leading-none">
        {/* Line 1: ACCOUNTING with Target 'O' and Red 'G' */}
        <div className={`font-black uppercase flex items-center ${accountingTextSize}`} style={{ fontFamily: "'Montserrat', 'Russo One', sans-serif" }}>
          <span className={baseTextColor}>ACC</span>
          
          {/* Target / Bullseye 'O' icon */}
          <span className={`inline-flex items-center justify-center ${targetIconSize} relative inline-block align-middle flex-shrink-0`}>
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              {/* Outer Red Ring */}
              <circle cx="12" cy="12" r="10" fill="#FF1E27" />
              {/* Middle White Ring */}
              <circle cx="12" cy="12" r="6.5" fill="#FFFFFF" />
              {/* Inner Red Bullseye */}
              <circle cx="12" cy="12" r="3.2" fill="#FF1E27" />
              {/* Center Dot */}
              <circle cx="12" cy="12" r="1" fill="#FFFFFF" />
              {/* Mini Target Dart Top-Right */}
              <path d="M14 6L20 2M20 2L18 5M20 2L15 4" stroke="#FF1E27" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>

          <span className={baseTextColor}>UNTIN</span>
          <span className={`${redColor} font-black drop-shadow-[0_0_8px_rgba(255,30,39,0.4)]`}>G</span>
        </div>

        {/* Line 2: Calculator icon + HUNTER + Red 'S' */}
        <div className={`font-black uppercase italic flex items-center mt-0.5 sm:mt-1 ${huntersTextSize}`} style={{ fontFamily: "'Rubik', 'Montserrat', sans-serif" }}>
          {/* Mini Calculator Vector Icon */}
          <span className={`inline-flex items-center justify-center ${calcIconSize} flex-shrink-0 not-italic`}>
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke={isLight ? "#1F2937" : "#FFFFFF"} strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="3" fill={isLight ? "#F3F4F6" : "#111827"} />
              {/* Calculator Screen */}
              <rect x="7" y="5" width="10" height="4" rx="1" fill={isLight ? "#E5E7EB" : "#374151"} stroke="none" />
              {/* Buttons */}
              <circle cx="8.5" cy="12.5" r="1" fill={isLight ? "#1F2937" : "#FFFFFF"} stroke="none" />
              <circle cx="12" cy="12.5" r="1" fill={isLight ? "#1F2937" : "#FFFFFF"} stroke="none" />
              <circle cx="15.5" cy="12.5" r="1" fill={isLight ? "#1F2937" : "#FFFFFF"} stroke="none" />
              <circle cx="8.5" cy="16" r="1" fill={isLight ? "#1F2937" : "#FFFFFF"} stroke="none" />
              <circle cx="12" cy="16" r="1" fill={isLight ? "#1F2937" : "#FFFFFF"} stroke="none" />
              <circle cx="15.5" cy="16" r="1" fill="#FF1E27" stroke="none" />
              <circle cx="8.5" cy="19.5" r="1" fill={isLight ? "#1F2937" : "#FFFFFF"} stroke="none" />
              <circle cx="12" cy="19.5" r="1" fill={isLight ? "#1F2937" : "#FFFFFF"} stroke="none" />
              <circle cx="15.5" cy="19.5" r="1" fill="#FF1E27" stroke="none" />
            </svg>
          </span>

          <span className={`${baseTextColor} font-black italic`}>HUNTER</span>
          <span className={`${redColor} font-black italic drop-shadow-[0_0_8px_rgba(255,30,39,0.4)]`}>S</span>
        </div>

        {showSubtitle && (
          <p className="text-[10px] text-gray-400 font-sans tracking-widest uppercase mt-1">
            Dhaka University Preparation
          </p>
        )}
      </div>
    </div>
  );
}
