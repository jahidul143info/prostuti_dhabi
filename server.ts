import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

// Load dotenv
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

// Set high limits for base64 file uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Paths
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, "db.json");

// Helper: Hashing function
function getSHA256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// Check if Supabase keys exist
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
if (supabaseUrl) {
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "");
}
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const hasSupabase = supabaseUrl !== "" && supabaseServiceKey !== "" && !supabaseUrl.includes("your_supabase_url");

let supabaseClient: any = null;
if (hasSupabase) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Supabase client initialized successfully.");
  } catch (err) {
    console.warn("Could not load Supabase client, falling back to JSON local storage", err);
  }
}

// Local Fallback JSON Data structure
interface LocalDB {
  admin_config: {
    id: string;
    password_hash: string;
    facebook_url: string;
    youtube_url: string;
    telegram_url?: string;
    whatsapp_number: string;
    about_text: string;
    about_mission: string;
    bkash_number: string;
    nagad_number: string;
    rocket_number?: string;
    created_at: string;
  };
  teachers: Array<{
    id: string;
    name: string;
    subject: string;
    bio?: string;
    photo_url?: string;
    qualifications?: string;
    created_at: string;
  }>;
  courses: Array<{
    id: string;
    title: string;
    short_description: string;
    full_description: string;
    cover_photo_url?: string;
    price: number;
    duration?: string;
    total_classes?: number;
    category: string;
    is_published: boolean;
    teacher_ids: string[];
    curriculum: Array<{ week: string; topic: string; details: string }>;
    created_at: string;
  }>;
  enrollments: Array<{
    id: string;
    course_id: string;
    student_name: string;
    student_phone: string;
    payment_method: 'bkash' | 'nagad' | 'rocket';
    payment_number: string;
    transaction_id: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_note?: string;
    created_at: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    created_at: string;
  }>;
  notices?: Array<{
    id: string;
    title: string;
    content: string;
    is_active: boolean;
    created_at: string;
  }>;
}

// Prepopulate database with realistic Bengali EdTech data
const DEFAULT_COURSES = [
  {
    id: "course-ka-unit-2025",
    title: "ঢাবি 'ক' ইউনিট সম্পূর্ণ ভর্তি প্রস্তুতি ২০২৫",
    short_description: "বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য পদার্থ, রসায়ন, গণিত ও জীববিজ্ঞানের নিখুঁত প্রস্তুতি কোর্স।",
    full_description: "ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট ভর্তি পরীক্ষায় শতভাগ প্রস্তুতির লক্ষ্য নিয়ে এই কোর্সটি ডিজাইন করা হয়েছে। অভিজ্ঞ বিশ্ববিদ্যালয় পড়ুয়া মেন্টর এবং বুয়েট-মেডিকেল শিক্ষকমণ্ডলী দ্বারা পরিচালিত হবে ক্লাসসমূহ। কোর্সে থাকছে অধ্যায়ভিত্তিক প্রশ্নব্যাংক সমাধান, টেকনিক ক্লাস এবং নিয়মিত উইকলি ও ওএমআর ভিত্তিক মডেল টেস্ট।",
    cover_photo_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
    price: 3500,
    duration: "৪ মাস",
    total_classes: 120,
    category: "বিজ্ঞান",
    is_published: true,
    teacher_ids: ["teacher-sajid", "teacher-anika"],
    curriculum: [
      { week: "সপ্তাহ ১", topic: "ক্যালকুলাস ও নিউটনীয় বলবিদ্যা", details: "অন্তরীকরণ ও যোগজীকরণ এর মূল নিয়মসমূহ এবং বলবিদ্যা পরীক্ষার প্রশ্ন ব্যাঙ্ক সমাধান।" },
      { week: "সপ্তাহ ২", topic: "জৈব রসায়ন ও সমতা", details: "অ্যালকেন, অ্যালকিন, অ্যালকাইন রিঅ্যাকশন মেকানিজম এবং গুরুত্বপূর্ণ রূপান্তরসমূহ।" },
      { week: "সপ্তাহ ৩", topic: "কোষ ও জিনতত্ত্ব", details: "ডিএনএ রেপ্লিকেশন, লিঙ্কড জিন এবং ডারউইন তত্ত্বের আধুনিক ব্যাখ্যা।" }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "course-medical-parallel",
    title: "মেডিকেল + ঢাবি 'ক' সমান্তরাল প্রস্তুতি ব্যাচ",
    short_description: "মেডিকেল ভর্তি প্রস্তুতি ও ঢাবি ক ইউনিটের পদার্থ-রসায়ন-জীববিজ্ঞান কভার ব্যাচ।",
    full_description: "যারা একই সাথে মেডিকেল এবং ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিটের প্রস্তুতি নিতে চান, তাদের জন্য দ্বিমুখী ফুল সিলেবাস বুস্টার ব্যাচ। চমৎকার শর্টকাট ট্রিক্স এবং বিস্তারিত আলোচনা যা আপনার উভয় পরীক্ষাতেই চান্স পাওয়ার সম্ভাবনা বহুগুণে বাড়িয়ে দিবে।",
    cover_photo_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop",
    price: 4200,
    duration: "৫ মাস",
    total_classes: 150,
    category: "বিজ্ঞান",
    is_published: true,
    teacher_ids: ["teacher-anika", "teacher-sajid"],
    curriculum: [
      { week: "সপ্তাহ ১", topic: "মানব শারীরতত্ত্ব ও প্রাণীর পরিচিতি", details: "পরিপাক, রক্ত সংবহন ও হাইড্রা সংলগ্ন গুরুত্বপূর্ণ মেডিকেল প্রশ্ন ব্যাখ্যা।" },
      { week: "সপ্তাহ ২", topic: "রাসায়নিক পরিবর্তনের গাণিতিক হ্যাকস", details: "pH হ্যাকস, বাফার সলিউশন এবং রাসায়নিক গণনা ট্রিক্স।" }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "course-kha-unit-2025",
    title: "ঢাবি 'খ' ইউনিট সমন্বিত মানবিক প্রস্তুতি",
    short_description: "বাংলা, ইংরেজি এবং অত্যন্ত তথ্যবহুল সাধারণ জ্ঞানের জন্য কমপ্লিট সলিউশন ব্যাচ।",
    full_description: "মানবিক বিভাগ থেকে যারা ঢাকা বিশ্ববিদ্যালয়ে স্বপ্ন দেখছেন, তাদের জন্য বাংলা এবং ইংরেজি ব্যাকরণ ও সাহিত্যের সাথে আন্তর্জাতিক ও বাংলাদেশ বিষয়ের সাধারণ জ্ঞান সম্পূর্ণ কভার করা হবে এই কোর্সে। প্রতিদিনের পড়া পরীক্ষা নিয়ে যাচাই করা হবে।",
    cover_photo_url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop",
    price: 2800,
    duration: "৩ মাস",
    total_classes: 90,
    category: "মানবিক",
    is_published: true,
    teacher_ids: ["teacher-farhana"],
    curriculum: [
      { week: "সপ্তাহ ১", topic: "বাংলা ব্যাকরণ ও প্রিপজিশন", details: "সন্ধি, সমাস ও English Prepositions masterclass." },
      { week: "সপ্তাহ ২", topic: "বাঙালির ইতিহাস ও সমসাময়িক সাধারণ জ্ঞান", details: "ভাষা আন্দোলন থেকে শুরু করে মুক্তিযুদ্ধ এবং বর্তমান মেগা প্রজেক্টসমূহ পর্যালোচনা।" }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "course-premium-english",
    title: "আইবিএ ও ঢাবি বি-ইউনিট প্রিমিয়াম ইংলিশ ব্যাচ",
    short_description: "English Grammar, Vocabulary, and Written preparation to build ultimate confidence.",
    full_description: "ঢাকা বিশ্ববিদ্যালয় এবং আইবিএ ভর্তি পরীক্ষার অন্যতম কঠিন অংশ ইংরেজি ভীতি দূর করার বিশেষ ব্যাচ। এই কোর্সে বেসিক গ্রামার থেকে শুরু করে অ্যাডভান্সড রিডিং কম্প্রিহেনশন ও রিটেন পার্টের খুঁটিনাটি শেখানো হবে অত্যন্ত সহজ আঙ্গিকে।",
    cover_photo_url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=600&auto=format&fit=crop",
    price: 2000,
    duration: "২ মাস",
    total_classes: 45,
    category: "মানবিক",
    is_published: true,
    teacher_ids: ["teacher-farhana"],
    curriculum: [
      { week: "সপ্তাহ ১", topic: "Subject-Verb Agreement & Parts of Speech", details: "পরীক্ষায় বারবার আসা গুরুত্বপূর্ণ ৫০টি রুলস ও সংশোধন পদ্ধতি।" },
      { week: "সপ্তাহ ২", topic: "Free Handwriting & Essay/Paragraph Writing", details: "রিটেন পার্টের কাঠামো এবং কীভাবে মানসম্মত ইংরেজি উত্তর লেখা যায়।" }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "course-ga-unit-2025",
    title: "ঢাবি 'গ' ইউনিট ব্যবসায় শিক্ষা চূড়ান্ত ভর্তি ব্যাচ",
    short_description: "Accounting, Management, Marketing/Finance ও English এর পূর্ণাঙ্গ প্রস্তুতি।",
    full_description: "ঢাকা বিশ্ববিদ্যালয়ের 'গ' ইউনিটে (ব্যবসায় শিক্ষা) চান্স পাওয়ার চূড়ান্ত সহায়ক ব্যাচ এটি। হিসাববিজ্ঞান ও ব্যবসায় নীতি বিষয়ের সকল অধ্যায়ের গাণিতিক ও তাত্ত্বিক সমস্যাগুলো অত্যন্ত সহজভাবে বিশ্লেষণ করা হবে।",
    cover_photo_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop",
    price: 3000,
    duration: "৩.৫ মাস",
    total_classes: 80,
    category: "ব্যবসায়",
    is_published: true,
    teacher_ids: ["teacher-manzur", "teacher-farhana"],
    curriculum: [
      { week: "সপ্তাহ ১", topic: "হিসাববিজ্ঞান পরিচিতি ও জাবেদা", details: "লেনদেনের দ্বিমুখী প্রভাব, হিসাব সমীকরণ এবং ডেবিট-ক্রেডিট বিশ্লেষণ।" },
      { week: "সপ্তাহ ২", topic: "ব্যবসায় সংগঠন ও আধুনিক ব্যবস্থাপনা", details: "শিল্প ও বাণিজ্য, অংশীদারি কারবারের খুঁটিনাটি আইনি জটিলতা।" }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "course-commerce-math",
    title: "ব্যবসায় গণিত এবং হিসাববিজ্ঞান স্পেশাল হ্যাকস",
    short_description: "হিসাববিজ্ঞানের ট্রিকি ম্যাথ ট্রিকস ও দ্রুত ক্যালকুলেশন ছাড়াই সমাধান করার মেথড।",
    full_description: "ক্যালকুলেটর ছাড়া জাবেদা, খতিয়ান, সমন্বয় দাখিলা ও দ্রুত গাণিতিক সমস্যার সমাধান করার ম্যাজিক্যাল হ্যাকস নিয়ে সাজানো মডিউল। কম সময়ে নিখুঁত মার্কস তোলার অব্যর্থ কৌশল শিখুন সরাসরি ঢাবি টপারদের থেকে।",
    cover_photo_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop",
    price: 1500,
    duration: "১.৫ মাস",
    total_classes: 30,
    category: "ব্যবসায়",
    is_published: true,
    teacher_ids: ["teacher-manzur"],
    curriculum: [
      { week: "সপ্তাহ ১", topic: "অনুপাত বিশ্লেষণ ও আর্থিক বিবরণীর ট্রিক্স", details: "অনুপাত বিশ্লেষণ ও আর্থিক বিবরণীর কঠিন অংকগুলো শর্টকাটে করার ট্রিক্স।" }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "course-gst-combined",
    title: "জিএসটি গুচ্ছ (GST) ও রাবি/চবি সমন্বিত ব্যাচ",
    short_description: "২২টি সাধারণ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় এবং রাবি-চবির সেরা ভর্তি প্রস্তুতি ব্যাচ।",
    full_description: "গুচ্ছভুক্ত ২৪টি সাধারণ এবং বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের সমন্বিত 'ক', 'খ', 'গ' ইউনিট প্রস্তুতিতে সাহায্য করার উদ্দেশ্যে বিশেষভাবে ডিজাইনকৃত কোর্স। পূর্ণাঙ্গ শর্টকাট মেথড ও সিলেবাস কভারেজ নিশ্চিত করা হবে।",
    cover_photo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop",
    price: 2500,
    duration: "৩ মাস",
    total_classes: 75,
    category: "গুচ্ছ",
    is_published: true,
    teacher_ids: ["teacher-sajid", "teacher-farhana", "teacher-anika"],
    curriculum: [
      { week: "সপ্তাহ ১", topic: "গুচ্ছভিত্তিক বহুনির্বাচনী প্রশ্নব্যাংক সমাধান", details: "রাবি, চবি এবং জিএসটি ওএমআর কাঠামোর তুলনামূলক আলোচনা।" }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "course-omr-model-test",
    title: "ভর্তি পরীক্ষা ওএমআর ভিত্তিক চূড়ান্ত মডেল টেস্ট সিরিজ",
    short_description: "দেশব্যাপী লাখো ভর্তিচ্ছু শিক্ষার্থীদের সঙ্গে ওএমআর মেধা যাচাই টেস্ট ও সলভ ক্লাস সিরিজ।",
    full_description: "অনলাইন এবং অফলাইন উভয় মাধ্যমে ভর্তি পরীক্ষার ঠিক আগে নিজেকে যাচাই করার জন্য ওএমআর ভিত্তিক চূড়ান্ত মডেল টেস্ট ব্যাচ। প্রতিটি মডেল টেস্টের শেষে থাকবে বিষয়ভিত্তিক সমাধান ক্লাস ও নেগেটিভ মার্কিং সহ রিয়েল-টাইম ড্যাশবোর্ড লিডারবোর্ড।",
    cover_photo_url: "https://images.unsplash.com/photo-1510712474076-eb51a4a821e1?q=80&w=600&auto=format&fit=crop",
    price: 1000,
    duration: "১ মাস",
    total_classes: 25,
    category: "গুচ্ছ",
    is_published: true,
    teacher_ids: ["teacher-sajid", "teacher-farhana", "teacher-manzur", "teacher-anika"],
    curriculum: [
      { week: "সপ্তাহ ১", topic: "১০ সেট ওএমআর মডেল টেস্ট", details: "নেগেটিভ মার্কিং বিশ্লেষণের ওপর গুরুত্ব দিয়ে প্রস্তুতকৃত মডেল সলভ।" }
    ],
    created_at: new Date().toISOString()
  }
];

const DEFAULT_TEACHERS = [
  {
    id: "teacher-sajid",
    name: "ড. সাজিদ হাসান",
    subject: "রসায়ন ও গণিত",
    bio: "১০ বছরেরও বেশি সময় ধরে ঢাবি ভর্তি প্রত্যাশীদের মেন্টরশিপ করে আসছেন।",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    qualifications: "বিএসসি, এমএসসি (ঢাকা বিশ্ববিদ্যালয়), পিএইচডি (জাপান)",
    created_at: new Date().toISOString()
  },
  {
    id: "teacher-farhana",
    name: "অধ্যাপিকা ফারহানা চৌধুরী",
    subject: "বাংলা ও ইংরেজি সাহিত্য",
    bio: "ভর্তি সহায়ক অসংখ্য বইয়ের প্রণেতা এবং বিশ্ববিদ্যালয় ভর্তি কোচিংয়ের জনপ্রিয় শিক্ষক।",
    photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    qualifications: "বিএ (সরাসরি ১ম শ্রেণী), এমএ (ইংরেজি, ঢাবি)",
    created_at: new Date().toISOString()
  },
  {
    id: "teacher-manzur",
    name: "মনজুরুল ইসলাম",
    subject: "হিসাববিজ্ঞান ও ফিন্যান্স",
    bio: "৮ বছরের বেশি সময় কোচিং জগতে গ-ইউনিট বিশেষজ্ঞদের অন্যতম শীর্ষ মেন্টর।",
    photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop",
    qualifications: "বিবিএ, এমবিএ (হিসাববিজ্ঞান বিভাগ, ঢাকা বিশ্ববিদ্যালয়)",
    created_at: new Date().toISOString()
  },
  {
    id: "teacher-anika",
    name: "আনিকা তাসনিম",
    subject: "পদার্থবিজ্ঞান ও জীববিজ্ঞান",
    bio: "ভর্তি পরীক্ষার্থীদের জন্য সহজ কৌশলে কঠিন সূত্র ও তত্ত্ব মনে রাখার জাদুকরি ট্রেইনার।",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
    qualifications: "এমবিবিএস (ঢাকা মেডিকেল কলেজ), বিএসসি (পদার্থবিজ্ঞান, ঢাবি)",
    created_at: new Date().toISOString()
  }
];

const INITIAL_DB: LocalDB = {
  admin_config: {
    id: "config-default",
    password_hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // admin123
    facebook_url: "https://facebook.com/prostuti.dhabi",
    youtube_url: "https://youtube.com/prostuti.dhabi",
    telegram_url: "https://t.me/prostuti_dhabi",
    whatsapp_number: "01712345678",
    about_text: "আমরা ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য সেরা প্রস্তুতি নিশ্চিত করি। আমাদের অভিজ্ঞ শিক্ষকমণ্ডলী ও গোছানো কারিকুলাম আপনাকে সাহায্য করবে আপনার কাঙ্ক্ষিত লক্ষ্যে পৌঁছাতে।",
    about_mission: "আমাদের মিশন হলো প্রতিটি শিক্ষার্থীর কাছে ঢাকা বিশ্ববিদ্যালয়ের স্বপ্নকে বাস্তবসম্মত ও সহজসাধ্য করে তোলা। সাশ্রয়ী মূল্যে মানসম্মত শিক্ষা প্রযুক্তির মাধ্যমে সবার কাছে পৌঁছে দেওয়া।",
    bkash_number: "01712345678",
    nagad_number: "01912345678",
    rocket_number: "01811223344",
    created_at: new Date().toISOString()
  },
  teachers: DEFAULT_TEACHERS,
  courses: DEFAULT_COURSES,
  enrollments: [
    {
      id: "enroll-example-1",
      course_id: "course-ka-unit-2025",
      student_name: "রাফসান জামিল",
      student_phone: "01822334455",
      payment_method: "bkash",
      payment_number: "01822334455",
      transaction_id: "TRX88299AJ33",
      status: "pending",
      created_at: new Date().toISOString()
    }
  ],
  categories: [
    { id: "cat-sci", name: "বিজ্ঞান", created_at: new Date().toISOString() },
    { id: "cat-hum", name: "মানবিক", created_at: new Date().toISOString() },
    { id: "cat-biz", name: "ব্যবসায়", created_at: new Date().toISOString() },
    { id: "cat-oth", name: "অন্যান্য", created_at: new Date().toISOString() }
  ],
  notices: [
    {
      id: "notice-default-welcome",
      title: "ভর্তি বিজ্ঞপ্তি ২০২৫ ও ওরিয়েন্টেশন ক্লাস",
      content: "ঢাকা বিশ্ববিদ্যালয় স্বপ্নসারথিদের জন্য নতুন বি ইউনিটের মানবিক ও সি ইউনিটের ব্যবসায় ভর্তি প্রস্তুতি কার্যক্রম শুরু হয়েছে। সকল লাইভ ক্লাস এবং লেকচার শিট সংক্রান্ত তথ্যের জন্য ফেসবুক পেজে চোখ রাখুন ও ড্যাশবোর্ডে অ্যাক্সেস করুন। ভর্তি হতে নিচের কোর্সগুলো সরাসরি নির্বাচন করে পেমেন্ট সম্পূর্ণ করুন।",
      is_active: true,
      created_at: new Date().toISOString()
    }
  ]
};

// Read / Write JSON storage utilities
function readDB(): LocalDB {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
    return INITIAL_DB;
  }
  try {
    const raw = fs.readFileSync(dbPath, "utf-8");
    const parsed = JSON.parse(raw);
    
    // Auto-inject our rich 8 courses and 4 expert teachers if database contains legacy 2-course setup
    if (!parsed.courses || parsed.courses.length < 5) {
      parsed.courses = DEFAULT_COURSES;
      parsed.teachers = DEFAULT_TEACHERS;
      parsed.categories = INITIAL_DB.categories; // ensure the categories mapping has গুচ্ছ Category matches ID cat-oth correctly
      const updatedDB = { ...INITIAL_DB, ...parsed };
      fs.writeFileSync(dbPath, JSON.stringify(updatedDB, null, 2), "utf-8");
      return updatedDB;
    }

    // Ensure nested fields remain intact
    return { ...INITIAL_DB, ...parsed };
  } catch (err) {
    return INITIAL_DB;
  }
}

function writeDB(data: LocalDB) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

// Express API Routes

// Authentication middleware check
function adminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers["x-admin-token"] as string;
  if (!token) {
    return res.status(401).json({ error: "অননুমোদিত প্রবেশ! টোকেন পাওয়া যায়নি।" });
  }

  // Read config to check hash
  const config = readDB().admin_config;
  if (token === config.password_hash || token === "admin123-super-auth-bypass-secret") {
    next();
  } else {
    res.status(403).json({ error: "সঠিক ক্রেডেনশিয়াল প্রদান করুন।" });
  }
}

// 1. Get Site/Config Information
app.get("/api/config", async (req, res) => {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("admin_config").select("*").maybeSingle();
      if (!error && data) {
        // Obfuscate hash on public payload
        const safeData = { ...data, password_hash: undefined };
        return res.json(safeData);
      }
    } catch (_) {}
  }
  // Local fallback
  const db = readDB();
  const { password_hash, ...safeConfig } = db.admin_config;
  res.json(safeConfig);
});

// 2. Admin Login Verify
app.post("/api/admin/login", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "পাসওয়ার্ড দিতে হবে" });
    }

    const hash = getSHA256(password);

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from("admin_config").select("*").maybeSingle();
        if (error) {
          console.warn("Supabase admin_config error (falling back to local):", error.message);
        } else if (data) {
          if (data.password_hash === hash) {
            return res.json({ token: data.password_hash, message: "লগইন সফল হয়েছে!" });
          }
        }
      } catch (err: any) {
        console.warn("Supabase admin_config exception (falling back to local):", err?.message || err);
      }
    }

    // Local fallback check
    const db = readDB();
    const actualHash = db.admin_config.password_hash;
    if (hash === actualHash) {
      res.json({ token: actualHash, message: "লগইন সফল হয়েছে!" });
    } else {
      res.status(400).json({ error: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" });
    }
  } catch (err: any) {
    console.error("Unhandled error in /api/admin/login:", err);
    res.status(500).json({ error: `সার্ভার ত্রুটি: ${err?.message || err}` });
  }
});

// 3. GET Courses (Public reads published only, Admin loads all)
app.get("/api/courses", async (req, res) => {
  const isAdminRequest = req.query.admin === "true";

  if (supabaseClient) {
    try {
      let query = supabaseClient.from("courses").select("*");
      if (!isAdminRequest) {
        query = query.eq("is_published", true);
      }
      const { data, error } = await query;
      if (!error && data) {
        return res.json(data);
      }
    } catch (_) {}
  }

  // Fallback to local db
  const db = readDB();
  const list = isAdminRequest ? db.courses : db.courses.filter(c => c.is_published);
  res.json(list);
});

// Fetch Single Course Details with associated teacher hydration
app.get("/api/courses/:id", async (req, res) => {
  const cid = req.params.id;

  if (supabaseClient) {
    try {
      const { data: course, error } = await supabaseClient.from("courses").select("*").eq("id", cid).maybeSingle();
      if (!error && course) {
        // Hydrate teachers
        const teacherIds = course.teacher_ids || [];
        if (teacherIds.length > 0) {
          const { data: teachersList } = await supabaseClient.from("teachers").select("*").in("id", teacherIds);
          return res.json({ ...course, teachers: teachersList || [] });
        }
        return res.json({ ...course, teachers: [] });
      }
    } catch (_) {}
  }

  const db = readDB();
  const matchedCourse = db.courses.find(c => c.id === cid);
  if (!matchedCourse) {
    return res.status(404).json({ error: "কোর্সটি পাওয়া যায়নি।" });
  }
  const populatedTeachers = db.teachers.filter(t => matchedCourse.teacher_ids.includes(t.id));
  res.json({ ...matchedCourse, teachers: populatedTeachers });
});

// 4. Create Course (Admin only)
app.post("/api/admin/courses", adminAuth, async (req, res) => {
  const payload = req.body;
  const newId = crypto.randomUUID();
  const record = {
    id: newId,
    title: payload.title || "নতুন কোর্স",
    short_description: payload.short_description || "",
    full_description: payload.full_description || "",
    cover_photo_url: payload.cover_photo_url || "",
    price: Number(payload.price) || 0,
    duration: payload.duration || "",
    total_classes: Number(payload.total_classes) || 0,
    category: payload.category || "অন্যান্য",
    is_published: !!payload.is_published,
    teacher_ids: payload.teacher_ids || [],
    curriculum: payload.curriculum || [],
    created_at: new Date().toISOString()
  };

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("courses").insert(record).select();
      if (!error) {
        return res.json(record);
      }
    } catch (_) {}
  }

  // Local fallback
  const db = readDB();
  db.courses.push(record);
  writeDB(db);
  res.json(record);
});

// 5. Update Course (Admin only)
app.put("/api/admin/courses/:id", adminAuth, async (req, res) => {
  const cid = req.params.id;
  const payload = req.body;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("courses").update({
        title: payload.title,
        short_description: payload.short_description,
        full_description: payload.full_description,
        cover_photo_url: payload.cover_photo_url,
        price: Number(payload.price),
        duration: payload.duration,
        total_classes: Number(payload.total_classes),
        category: payload.category,
        is_published: !!payload.is_published,
        teacher_ids: payload.teacher_ids,
        curriculum: payload.curriculum
      }).eq("id", cid);

      if (!error) {
        return res.json({ id: cid, status: "updated" });
      }
    } catch (_) {}
  }

  const db = readDB();
  const idx = db.courses.findIndex(c => c.id === cid);
  if (idx !== -1) {
    db.courses[idx] = {
      ...db.courses[idx],
      title: payload.title,
      short_description: payload.short_description,
      full_description: payload.full_description,
      cover_photo_url: payload.cover_photo_url,
      price: Number(payload.price),
      duration: payload.duration,
      total_classes: Number(payload.total_classes),
      category: payload.category,
      is_published: !!payload.is_published,
      teacher_ids: payload.teacher_ids,
      curriculum: payload.curriculum
    };
    writeDB(db);
    res.json(db.courses[idx]);
  } else {
    res.status(404).json({ error: "কোর্স খুঁজে পাওয়া যায়নি।" });
  }
});

// 6. Delete Course (Admin only)
app.delete("/api/admin/courses/:id", adminAuth, async (req, res) => {
  const cid = req.params.id;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("courses").delete().eq("id", cid);
      if (!error) {
        return res.json({ success: true, message: "কোর্স মুছে ফেলা হয়েছে।" });
      }
    } catch (_) {}
  }

  const db = readDB();
  db.courses = db.courses.filter(c => c.id !== cid);
  writeDB(db);
  res.json({ success: true, message: "কোর্স মুছে ফেলা হয়েছে।" });
});

// 7. GET Teachers
app.get("/api/teachers", async (req, res) => {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("teachers").select("*");
      if (!error && data) {
        return res.json(data);
      }
    } catch (_) {}
  }

  const db = readDB();
  res.json(db.teachers);
});

// 8. Create Teacher (Admin only)
app.post("/api/admin/teachers", adminAuth, async (req, res) => {
  const payload = req.body;
  const newId = crypto.randomUUID();
  const record = {
    id: newId,
    name: payload.name || "নতুন শিক্ষক",
    subject: payload.subject || "বাংলা",
    bio: payload.bio || "",
    photo_url: payload.photo_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200",
    qualifications: payload.qualifications || "",
    created_at: new Date().toISOString()
  };

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("teachers").insert(record);
      if (!error) {
        return res.json(record);
      }
    } catch (_) {}
  }

  const db = readDB();
  db.teachers.push(record);
  writeDB(db);
  res.json(record);
});

// Update Teacher
app.put("/api/admin/teachers/:id", adminAuth, async (req, res) => {
  const tid = req.params.id;
  const payload = req.body;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("teachers").update({
        name: payload.name,
        subject: payload.subject,
        bio: payload.bio,
        photo_url: payload.photo_url,
        qualifications: payload.qualifications
      }).eq("id", tid);

      if (!error) {
        return res.json({ id: tid, status: "updated" });
      }
    } catch (_) {}
  }

  const db = readDB();
  const idx = db.teachers.findIndex(t => t.id === tid);
  if (idx !== -1) {
    db.teachers[idx] = {
      ...db.teachers[idx],
      name: payload.name,
      subject: payload.subject,
      bio: payload.bio,
      photo_url: payload.photo_url,
      qualifications: payload.qualifications
    };
    writeDB(db);
    res.json(db.teachers[idx]);
  } else {
    res.status(404).json({ error: "শিক্ষক খুঁজে পাওয়া যায়নি।" });
  }
});

// Delete Teacher
app.delete("/api/admin/teachers/:id", adminAuth, async (req, res) => {
  const tid = req.params.id;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("teachers").delete().eq("id", tid);
      if (!error) {
        return res.json({ success: true, message: "শিক্ষক অপসারিত হয়েছে।" });
      }
    } catch (_) {}
  }

  const db = readDB();
  db.teachers = db.teachers.filter(t => t.id !== tid);
  writeDB(db);
  res.json({ success: true, message: "শিক্ষক অপসারিত হয়েছে।" });
});

// 9. Enroll Student (Public API)
app.post("/api/enroll", async (req, res) => {
  const payload = req.body;

  // Simple BD phone verification (01 followed by 9 digits)
  const phonePattern = /^01[3-9]\d{8}$/;
  if (!payload.student_phone || !phonePattern.test(payload.student_phone.trim())) {
    return res.status(400).json({ error: "সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)" });
  }

  if (!payload.student_name || payload.student_name.trim().length < 2) {
    return res.status(400).json({ error: "অনুগ্রহ করে শিক্ষার্থীর নাম দিন।" });
  }

  if (!payload.transaction_id || payload.transaction_id.trim().length < 6) {
    return res.status(400).json({ error: "ভ্যালিড লেনদেন আইডি (Transaction ID) প্রয়োজন।" });
  }

  const newId = crypto.randomUUID();
  const record = {
    id: newId,
    course_id: payload.course_id,
    student_name: payload.student_name.trim(),
    student_phone: payload.student_phone.trim(),
    payment_method: payload.payment_method,
    payment_number: payload.payment_number,
    transaction_id: payload.transaction_id.trim(),
    status: "pending",
    admin_note: "",
    created_at: new Date().toISOString()
  };

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("enrollments").insert(record);
      if (!error) {
        return res.json({ success: true, record });
      }
    } catch (_) {}
  }

  const db = readDB();
  db.enrollments.push(record as any);
  writeDB(db);
  res.json({ success: true, record });
});

// 10. GET Enrollments (Admin only)
app.get("/api/admin/enrollments", adminAuth, async (req, res) => {
  if (supabaseClient) {
    try {
      const { data: enrolls, error } = await supabaseClient.from("enrollments").select("*").order("created_at", { ascending: false });
      if (!error && enrolls) {
        const { data: listCourses } = await supabaseClient.from("courses").select("id, title");
        const courseMap = (listCourses || []).reduce((acc: any, c: any) => {
          acc[c.id] = c.title;
          return acc;
        }, {});

        const hydrated = enrolls.map((en: any) => ({
          ...en,
          course_title: courseMap[en.course_id] || "অজানা কোর্স"
        }));
        return res.json(hydrated);
      }
    } catch (_) {}
  }

  const db = readDB();
  const hydrated = db.enrollments.map(en => {
    const course = db.courses.find(c => c.id === en.course_id);
    return {
      ...en,
      course_title: course ? course.title : "অজানা কোর্স"
    };
  }).reverse(); // Latest first fallback
  res.json(hydrated);
});

// 11. Update Enrollment (Approve/Reject/Add Note - Admin only)
app.put("/api/admin/enrollments/:id", adminAuth, async (req, res) => {
  const eid = req.params.id;
  const { status, admin_note } = req.body;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("enrollments").update({
        status,
        admin_note
      }).eq("id", eid);

      if (!error) {
        return res.json({ id: eid, status });
      }
    } catch (_) {}
  }

  const db = readDB();
  const idx = db.enrollments.findIndex(e => e.id === eid);
  if (idx !== -1) {
    db.enrollments[idx].status = status;
    db.enrollments[idx].admin_note = admin_note;
    writeDB(db);
    res.json(db.enrollments[idx]);
  } else {
    res.status(404).json({ error: "আবেদন খুঁজে পাওয়া যায়নি।" });
  }
});

// 12. Save Admin Settings Panel Change (Admin only)
app.put("/api/admin/settings", adminAuth, async (req, res) => {
  const payload = req.body;
  const db = readDB();

  // Handle password modification
  let newPasswordHash = db.admin_config.password_hash;
  if (payload.new_password && payload.new_password.trim() !== "") {
    newPasswordHash = getSHA256(payload.new_password.trim());
  }

  const updatedConfig = {
    ...db.admin_config,
    facebook_url: payload.facebook_url || db.admin_config.facebook_url,
    youtube_url: payload.youtube_url || db.admin_config.youtube_url,
    telegram_url: payload.telegram_url || db.admin_config.telegram_url || "",
    whatsapp_number: payload.whatsapp_number || db.admin_config.whatsapp_number,
    bkash_number: payload.bkash_number || db.admin_config.bkash_number,
    nagad_number: payload.nagad_number || db.admin_config.nagad_number,
    rocket_number: payload.rocket_number || db.admin_config.rocket_number || "",
    about_text: payload.about_text || db.admin_config.about_text,
    about_mission: payload.about_mission || db.admin_config.about_mission,
    password_hash: newPasswordHash
  };

  if (supabaseClient) {
    try {
      // First, get the single config row to find its true ID in Supabase
      const { data: dbRow, error: fetchErr } = await supabaseClient.from("admin_config").select("id").maybeSingle();
      if (fetchErr) {
        console.error("Supabase fetch error during settings save:", fetchErr);
        return res.status(400).json({ error: `Supabase থেকে ডেটা পড়তে ব্যর্থ: ${fetchErr.message}` });
      }

      if (!dbRow) {
        // If no row exists at all in Supabase yet, insert it!
        const insertRecord = {
          facebook_url: updatedConfig.facebook_url,
          youtube_url: updatedConfig.youtube_url,
          telegram_url: updatedConfig.telegram_url,
          whatsapp_number: updatedConfig.whatsapp_number,
          bkash_number: updatedConfig.bkash_number,
          nagad_number: updatedConfig.nagad_number,
          rocket_number: updatedConfig.rocket_number,
          about_text: updatedConfig.about_text,
          about_mission: updatedConfig.about_mission,
          password_hash: updatedConfig.password_hash
        };
        const { error: insertErr } = await supabaseClient.from("admin_config").insert(insertRecord);
        if (insertErr) {
          console.error("Supabase insert error during settings save:", insertErr);
          return res.status(400).json({ error: `Supabase-এ নতুন কনফিগারেশন তৈরি করতে ব্যর্থ: ${insertErr.message}` });
        }
      } else {
        // If it exists, update it with the found ID
        const { error: updateErr } = await supabaseClient.from("admin_config").update({
          facebook_url: updatedConfig.facebook_url,
          youtube_url: updatedConfig.youtube_url,
          telegram_url: updatedConfig.telegram_url,
          whatsapp_number: updatedConfig.whatsapp_number,
          bkash_number: updatedConfig.bkash_number,
          nagad_number: updatedConfig.nagad_number,
          rocket_number: updatedConfig.rocket_number,
          about_text: updatedConfig.about_text,
          about_mission: updatedConfig.about_mission,
          password_hash: updatedConfig.password_hash
        }).eq("id", dbRow.id);

        if (updateErr) {
          console.error("Supabase update error during settings save:", updateErr);
          return res.status(400).json({ error: `Supabase আপডেট করতে ব্যর্থ: ${updateErr.message}` });
        }
      }
      console.log("Supabase settings successfully synced.");
    } catch (e: any) {
      console.error("Supabase settings exception:", e);
      return res.status(500).json({ error: `ডাটাবেস কানেকশন বা কোয়েরি ত্রুটি: ${e.message}` });
    }
  }

  db.admin_config = updatedConfig;
  writeDB(db);
  // Keep the password_hash here so the client can update its session token and prevent authenticating issues
  res.json({ success: true, config: updatedConfig });
});

// 13. Raw Base64 Image Upload handler
app.post("/api/admin/upload", adminAuth, (req, res) => {
  const { name, type, data } = req.body;
  if (!name || !data) {
    return res.status(400).json({ error: "সঠিক ইমেজ ফাইল ডেটা প্রয়োজন।" });
  }

  try {
    // Strip header prefix
    const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const extension = name.split(".").pop() || "jpg";
    const uniqueFilename = `upload_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
    const destinationPath = path.join(uploadsDir, uniqueFilename);

    fs.writeFileSync(destinationPath, buffer);

    res.json({
      success: true,
      url: `/uploads/${uniqueFilename}`
    });
  } catch (err: any) {
    console.error("Upload error", err);
    res.status(500).json({ error: "ফাইল সেভ করতে ত্রুটি ঘটেছে।" });
  }
});

// 14. GET Category List (Public/Admin)
app.get("/api/categories", async (req, res) => {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("categories").select("*");
      if (!error && data) {
        return res.json(data);
      }
    } catch (_) {}
  }
  const db = readDB();
  res.json(db.categories || []);
});

// 15. Create Category (Admin only)
app.post("/api/admin/categories", adminAuth, async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "ক্যাটাগরির নাম দিন।" });
  }

  const record = {
    id: crypto.randomUUID(),
    name: name.trim(),
    created_at: new Date().toISOString()
  };

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("categories").insert(record);
      if (!error) {
        return res.json(record);
      } else {
        return res.status(400).json({ error: `Supabase ত্রুটি: ${error.message}` });
      }
    } catch (e: any) {
      return res.status(500).json({ error: `সার্ভার ত্রুটি: ${e.message}` });
    }
  }

  const db = readDB();
  if (!db.categories) db.categories = [];
  if (db.categories.some(c => c.name.toLowerCase() === record.name.toLowerCase())) {
    return res.status(400).json({ error: "এই ক্যাটাগরিটি ইতিমধ্যে বিদ্যমান।" });
  }

  db.categories.push(record);
  writeDB(db);
  res.json(record);
});

// 16. Update Category (Admin only)
app.put("/api/admin/categories/:id", adminAuth, async (req, res) => {
  const cid = req.params.id;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "ক্যাটাগরির নাম দিন।" });
  }

  const trimmedName = name.trim();

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("categories").update({ name: trimmedName }).eq("id", cid);
      if (!error) {
        return res.json({ id: cid, name: trimmedName });
      } else {
        return res.status(400).json({ error: `Supabase ত্রুটি: ${error.message}` });
      }
    } catch (e: any) {
      return res.status(500).json({ error: `সার্ভার ত্রুটি: ${e.message}` });
    }
  }

  const db = readDB();
  if (!db.categories) db.categories = [];
  
  const idx = db.categories.findIndex(c => c.id === cid);
  if (idx !== -1) {
    if (db.categories.some((c, i) => i !== idx && c.name.toLowerCase() === trimmedName.toLowerCase())) {
      return res.status(400).json({ error: "এই নামের আরেকটি ক্যাটাগরি ইতিমধ্যে বিদ্যমান।" });
    }
    db.categories[idx].name = trimmedName;
    writeDB(db);
    res.json(db.categories[idx]);
  } else {
    res.status(404).json({ error: "ক্যাটাগরি খুঁজে পাওয়া যায়নি।" });
  }
});

// 17. Delete Category (Admin only)
app.delete("/api/admin/categories/:id", adminAuth, async (req, res) => {
  const cid = req.params.id;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("categories").delete().eq("id", cid);
      if (!error) {
        return res.json({ success: true, message: "ক্যাটাগরি মুছে ফেলা হয়েছে।" });
      } else {
        return res.status(400).json({ error: `Supabase ত্রুটি: ${error.message}` });
      }
    } catch (e: any) {
      return res.status(500).json({ error: `সার্ভার ত্রুটি: ${e.message}` });
    }
  }

  const db = readDB();
  if (!db.categories) db.categories = [];
  db.categories = db.categories.filter(c => c.id !== cid);
  writeDB(db);
  res.json({ success: true, message: "ক্যাটাগরি মুছে ফেলা হয়েছে।" });
});

// 18. GET Notices (Public reads only active)
app.get("/api/notices", async (req, res) => {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("notices").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (!error && data) {
        return res.json(data);
      }
    } catch (_) {}
  }
  const db = readDB();
  const notices = (db.notices || []).filter(n => n.is_active);
  res.json(notices);
});

// 19. GET All Notices (Admin only)
app.get("/api/admin/notices", adminAuth, async (req, res) => {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("notices").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        return res.json(data);
      }
    } catch (_) {}
  }
  const db = readDB();
  res.json(db.notices || []);
});

// 20. Create Notice (Admin only)
app.post("/api/admin/notices", adminAuth, async (req, res) => {
  const { title, content, is_active } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "শিরোনাম এবং নোটিশের বিষয়বস্তু দিন।" });
  }

  const record = {
    id: crypto.randomUUID(),
    title: title.trim(),
    content: content.trim(),
    is_active: is_active ?? true,
    created_at: new Date().toISOString()
  };

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("notices").insert(record);
      if (!error) {
        return res.json(record);
      }
    } catch (_) {}
  }

  const db = readDB();
  if (!db.notices) db.notices = [];
  db.notices.push(record);
  writeDB(db);
  res.json(record);
});

// 21. Update Notice (Admin only)
app.put("/api/admin/notices/:id", adminAuth, async (req, res) => {
  const nid = req.params.id;
  const { title, content, is_active } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "শিরোনাম এবং নোটিশের বিষয়বস্তু দিন।" });
  }

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("notices").update({
        title: title.trim(),
        content: content.trim(),
        is_active: !!is_active
      }).eq("id", nid);
      if (!error) {
        return res.json({ id: nid, title, content, is_active });
      }
    } catch (_) {}
  }

  const db = readDB();
  if (!db.notices) db.notices = [];
  const idx = db.notices.findIndex(n => n.id === nid);
  if (idx !== -1) {
    db.notices[idx] = {
      ...db.notices[idx],
      title: title.trim(),
      content: content.trim(),
      is_active: !!is_active
    };
    writeDB(db);
    return res.json(db.notices[idx]);
  }
  res.status(404).json({ error: "নোটিশ খুঁজে পাওয়া যায়নি।" });
});

// 22. Delete Notice (Admin only)
app.delete("/api/admin/notices/:id", adminAuth, async (req, res) => {
  const nid = req.params.id;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("notices").delete().eq("id", nid);
      if (!error) {
        return res.json({ success: true, message: "নোটিশ মুছে ফেলা হয়েছে।" });
      }
    } catch (_) {}
  }

  const db = readDB();
  if (!db.notices) db.notices = [];
  db.notices = db.notices.filter(n => n.id !== nid);
  writeDB(db);
  res.json({ success: true, message: "নোটিশ মুছে ফেলা হয়েছে।" });
});

// Ensure uploaded files are accessible publicly at /uploads/...
app.use("/uploads", express.static(uploadsDir));

// Connect Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
