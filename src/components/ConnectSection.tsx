import React from "react";
import { Facebook, Youtube, PhoneCall, ExternalLink, Send } from "lucide-react";
import { AdminConfig } from "../lib/types";

interface ConnectSectionProps {
  config: Partial<AdminConfig> | null;
}

export default function ConnectSection({ config }: ConnectSectionProps) {
  // Default fallbacks in case settings are deleted/empty
  const fbUrl = config?.facebook_url || "https://facebook.com/prostuti.dhabi";
  const ytUrl = config?.youtube_url || "https://youtube.com/prostuti.dhabi";
  const tgUrl = config?.telegram_url || "https://t.me/prostuti_dhabi";
  const waNum = config?.whatsapp_number || "01712345678";

  const cleanWa = waNum.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanWa.startsWith("88") ? cleanWa : `88${cleanWa}`}`;

  const channels = [
    {
      name: "ফেসবুক গ্রুপ ও পেইজ",
      label: "কমিউিনিটিতে যুক্ত হোন",
      icon: <Facebook className="h-5.5 w-5.5" />,
      bgClass: "bg-[#1877F2]/5 text-[#1877F2] border-[#1877F2]/10 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/20",
      url: fbUrl,
    },
    {
      name: "ইউটিউব চ্যানেল",
      label: "ফ্রি ক্লাস ও সমাধান",
      icon: <Youtube className="h-5.5 w-5.5" />,
      bgClass: "bg-[#FF0000]/5 text-[#FF0000] border-[#FF0000]/10 hover:bg-[#FF0000]/10 hover:border-[#FF0000]/20",
      url: ytUrl,
    },
    {
      name: "টেলিগ্রাম চ্যানেল",
      label: "লেকচার শিট ও পিডিএফ",
      icon: <Send className="h-5.5 w-5.5 rotate-[315deg]" />,
      bgClass: "bg-[#229ED9]/5 text-[#229ED9] border-[#229ED9]/10 hover:bg-[#229ED9]/10 hover:border-[#229ED9]/20",
      url: tgUrl,
    },
    {
      name: "হোয়াটসঅ্যাপ হেল্পলাইন",
      label: "যেকোনো সাহায্য বা জিজ্ঞাসা",
      icon: <PhoneCall className="h-5.5 w-5.5" />,
      bgClass: "bg-[#25D366]/5 text-[#25D366] border-[#25D366]/10 hover:bg-[#25D366]/10 hover:border-[#25D366]/20",
      url: waUrl,
    },
  ];

  return (
    <section id="connect" className="py-12 bg-neutral-50/60 border-y border-gray-150 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight mb-1.5">
            আমাদের সাথে <span className="text-primary">যুক্ত থাকুন</span>
          </h2>
          <p className="text-muted text-xs">
            ফ্রি ক্লাস, লেকচার শিট এবং সাপোর্ট পেতে সামাজিক যোগাযোগ মাধ্যমে আমাদের সাথে যুক্ত হয়ে যান।
          </p>
        </div>

        {/* Compact Grid of Small Icon Row/Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto" id="social-connect-grid">
          {channels.map((ch, i) => (
            <a
              key={i}
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-3.5 p-3.5 rounded-2xl border transition-all duration-300 hover:scale-[1.015] hover:shadow-sm ${ch.bgClass}`}
            >
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
                {ch.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[#111827] text-xs sm:text-sm tracking-tight truncate">
                  {ch.name}
                </h3>
                <span className="text-[10px] text-gray-500 font-medium block truncate">
                  {ch.label}
                </span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 opacity-45 flex-shrink-0" />
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
