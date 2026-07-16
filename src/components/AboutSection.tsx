import React from "react";
import { Target, Users, BookOpen, ShieldCheck } from "lucide-react";
import { AdminConfig } from "../lib/types";

interface AboutSectionProps {
  config: Partial<AdminConfig> | null;
}

export default function AboutSection({ config }: AboutSectionProps) {
  const defaultAboutText = "আমরা ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য সেরা প্রস্তুতি নিশ্চিত করি। আমাদের অভিজ্ঞ শিক্ষকমণ্ডলী ও গোছানো কারিকুলাম আপনাকে সাহায্য করবে আপনার কাঙ্ক্ষিত লক্ষ্যে পৌঁছাতে।";
  const defaultMissionText = "আমাদের মিশন হলো প্রতিটি শিক্ষার্থীর কাছে ঢাকা বিশ্ববিদ্যালয়ের স্বপ্নকে বাস্তবসম্মত ও সহজসাধ্য করে তোলা। সাশ্রয়ী মূল্যে মানসম্মত শিক্ষা প্রযুক্তির মাধ্যমে সবার কাছে পৌঁছে দেওয়া।";

  const missionPoints = [
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      title: "🎯 লক্ষ্যমুখী শিক্ষা",
      desc: "পরীক্ষার উপযুক্ত এবং গোছানো লেকচার শীট",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "👨‍🏫 অভিজ্ঞ শিক্ষকমণ্ডলী",
      desc: "ঢাকা বিশ্ববিদ্যালয়ের সাবেক ও বর্তমান কৃতি শিক্ষার্থীগণ",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      title: "📚 সম্পূর্ণ সিলেবাস",
      desc: "৩ স্তরের নিবিড় রিভিশন ও ওএমআর মডেল শেষ মডিউল",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "✅ সাফল্যের গ্যারান্টি",
      desc: "উদ্দেশ্যমূলক মেন্টরিং ও ওয়ান-টু-ওয়ান গাইডেন্স",
    },
  ];

  return (
    <section id="about" className="py-24 bg-accent/40 relative overflow-hidden">
      {/* Visual backdrops */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Detail */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-1.5 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold font-sans">
              <span>🎯 OUR BACKGROUND</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-dark tracking-tight">
              আমাদের মূল দর্শন ও <span className="text-primary">অনুপ্রেরণা</span>
            </h2>

            <p className="text-gray-700 text-sm sm:text-base leading-relaxed" id="about-text-p">
              {config?.about_text || defaultAboutText}
            </p>

            <div className="bg-white border border-primary/15 rounded-3xl p-7 shadow-[0_10px_30px_rgba(27,67,50,0.02)]">
              <h3 className="text-primary font-bold text-xl mb-3 flex items-center space-x-2">
                <span className="w-1.5 h-6 bg-secondary rounded-full" />
                <span>আমাদের মূল মিশন</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed" id="about-mission-p">
                {config?.about_mission || defaultMissionText}
              </p>
            </div>
          </div>

          {/* Right Visual cards list */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {missionPoints.map((pt, i) => (
              <div
                key={i}
                className="bg-white hover:border-primary/20 border border-primary/5 p-6 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-[0_15px_30px_rgba(27,67,50,0.05)] hover:-translate-y-1 group"
              >
                <div className="bg-primary/5 group-hover:bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                  {pt.icon}
                </div>
                <h4 className="text-dark font-extrabold text-sm sm:text-base mb-1.5 inline-block">
                  {pt.title}
                </h4>
                <p className="text-gray-500 text-xs leading-normal">
                  {pt.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
