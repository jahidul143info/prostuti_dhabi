import React from "react";
import { Facebook, Youtube, PhoneCall, ExternalLink } from "lucide-react";
import { AdminConfig } from "../lib/types";

interface ConnectSectionProps {
  config: Partial<AdminConfig> | null;
}

export default function ConnectSection({ config }: ConnectSectionProps) {
  // Default fallbacks in case settings are deleted/empty
  const fbUrl = config?.facebook_url || "https://facebook.com/prostuti.dhabi";
  const ytUrl = config?.youtube_url || "https://youtube.com/prostuti.dhabi";
  const waNum = config?.whatsapp_number || "01712345678";

  const cleanWa = waNum.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanWa.startsWith("88") ? cleanWa : `88${cleanWa}`}`;

  const channels = [
    {
      name: "ফেসবুক গ্রুপ ও পেইজ",
      label: "যোগ দিন আমাদের কমিউিনিটিতে",
      icon: <Facebook className="h-8 w-8 text-white" />,
      colorClass: "from-blue-600 to-indigo-700 shadow-blue-500/10",
      btnClass: "bg-white hover:bg-white/95 text-blue-700",
      url: fbUrl,
    },
    {
      name: "ইউটিউব চ্যানেল",
      label: "চলমান ফ্রি লাইভ ক্লাস ও সলভ ক্লাসসমূহ",
      icon: <Youtube className="h-8 w-8 text-white" />,
      colorClass: "from-red-600 to-rose-700 shadow-red-500/10",
      btnClass: "bg-white hover:bg-white/95 text-red-700",
      url: ytUrl,
    },
    {
      name: "হোয়াটসঅ্যাপ হেল্পলাইন",
      label: "যেকোনো সাপোর্ট বা পরামর্শের জন্য বার্তা পাঠান",
      icon: <PhoneCall className="h-8 w-8 text-white" />,
      colorClass: "from-green-600 to-emerald-700 shadow-green-500/10",
      btnClass: "bg-white hover:bg-white/95 text-green-700",
      url: waUrl,
    },
  ];

  return (
    <section id="connect" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 bg-accent text-primary px-4 py-1.5 rounded-full text-xs font-bold mb-4 font-sans uppercase">
            <span>📞 Direct Support Channels</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-dark tracking-tight mb-4">
            আমাদের সাথে <span className="text-primary">সম্পৃক্ত হোন</span>
          </h2>
          <p className="text-muted text-xs sm:text-sm max-w-md mx-auto">
            ক্লাসের নোটিফিকেশন, ফ্রি রিসোর্স ডাউনলোড এবং যেকোনো জিজ্ঞাসা তাৎক্ষণিক সমাধান করতে আমাদের সোশ্যাল প্লাটফর্মগুলোতে যুক্ত হয়ে যাও।
          </p>
        </div>

        {/* 3 cards grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto" id="social-connect-grid">
          {channels.map((ch, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${ch.colorClass} p-8 rounded-2xl flex flex-col justify-between h-full transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl shadow-lg border border-white/10`}
            >
              <div>
                <div className="bg-white/15 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20 mb-6">
                  {ch.icon}
                </div>
                <h3 className="text-white text-xl font-bold mb-2 tracking-tight">
                  {ch.name}
                </h3>
                <p className="text-white/85 text-xs sm:text-sm leading-relaxed mb-8">
                  {ch.label}
                </p>
              </div>

              <a
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-center flex items-center justify-center space-x-2 transition-transform duration-300 hover:translate-y-[-2px] tracking-wide`}
              >
                <span>যুক্ত হন</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
