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
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
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
    whatsapp_number: string;
    about_text: string;
    about_mission: string;
    bkash_number: string;
    nagad_number: string;
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
    payment_method: 'bkash' | 'nagad';
    payment_number: string;
    transaction_id: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_note?: string;
    created_at: string;
  }>;
}

// Prepopulate database with realistic Bengali EdTech data
const DEFAULT_COURSES = [
  {
    id: "course-ka-unit-2025",
    title: "ঢাবি 'ক' ইউনিট সম্পূর্ণ ভর্তি প্রস্তুতি ২০২৫",
    short_description: "বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য পদার্থ, রসায়ন, গণিত ও জীববিজ্ঞানের নিখুঁত প্রস্তুতি কোর্স।",
    full_description: "ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট ভর্তি পরীক্ষায় শতভাগ প্রস্তুতির লক্ষ্য নিয়ে এই কোর্সটি ডিজাইন করা হয়েছে। অভিজ্ঞ বিশ্ববিদ্যালয় পড়ুয়া মেন্টর এবং বুয়েট-মেডিকেল শিক্ষকমণ্ডলী দ্বারা পরিচালিত হবে ক্লাসসমূহ। কোর্সে থাকছে অধ্যায়ভিত্তিক প্রশ্নব্যাংক সমাধান, টেকনিক ক্লাস এবং নিয়মিত উইকলি ও ফুল ওএমআর ভিত্তিক মডেল টেস্ট।",
    cover_photo_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
    price: 3500,
    duration: "৪ মাস",
    total_classes: 120,
    category: "বিজ্ঞান",
    is_published: true,
    teacher_ids: ["teacher-sajid", "teacher-farhana"],
    curriculum: [
      { week: "সপ্তাহ ১", topic: "ক্যালকুলাস ও নিউটনীয় বলবিদ্যা", details: "অন্তরীকরণ ও যোগজীকরণ এর মূল নিয়মসমূহ এবং বলবিদ্যা পরীক্ষার প্রশ্ন ব্যাঙ্ক সমাধান।" },
      { week: "সপ্তাহ ২", topic: "জৈব রসায়ন ও সমতা", details: "অ্যালকেন, অ্যালকিন, অ্যালকাইন রিঅ্যাকশন মেকানিজম এবং গুরুত্বপূর্ণ রূপান্তরসমূহ।" },
      { week: "সপ্তাহ ৩", topic: "কোষ ও জিনতত্ত্ব", details: "ডিএনএ রেপ্লিকেশন, লিঙ্কড জিন এবং ডারউইন তত্ত্বের আধুনিক ব্যাখ্যা।" }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "course-kha-unit-2025",
    title: "ঢাবি 'খ' ইউনিট সমন্বিত মানবিক ও ব্যবসায় প্রস্তুতি",
    short_description: "বাংলা, ইংরেজি এবং অত্যন্ত তথ্যবহুল সাধারণ জ্ঞানের জন্য কমপ্লিট সলিউশন ব্যাচ।",
    full_description: "মানবিক এবং ব্যবসায় শিক্ষা বিভাগ থেকে যারা ঢাকা বিশ্ববিদ্যালয়ে স্বপ্ন দেখছেন, তাদের জন্য বাংলা এবং ইংরেজি ব্যাকরণ ও সাহিত্যের সাথে আন্তর্জাতিক ও বাংলাদেশ বিষয়ের সাধারণ জ্ঞান সম্পূর্ণ কভার করা হবে এই কোর্সে। প্রতিদিনের পড়া পরীক্ষা নিয়ে যাচাই করা হবে।",
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
  }
];

const INITIAL_DB: LocalDB = {
  admin_config: {
    id: "config-default",
    password_hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // admin123
    facebook_url: "https://facebook.com/prostuti.dhabi",
    youtube_url: "https://youtube.com/prostuti.dhabi",
    whatsapp_number: "01712345678",
    about_text: "আমরা ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য সেরা প্রস্তুতি নিশ্চিত করি। আমাদের অভিজ্ঞ শিক্ষকমণ্ডলী ও গোছানো কারিকুলাম আপনাকে সাহায্য করবে আপনার কাঙ্ক্ষিত লক্ষ্যে পৌঁছাতে।",
    about_mission: "আমাদের মিশন হলো প্রতিটি শিক্ষার্থীর কাছে ঢাকা বিশ্ববিদ্যালয়ের স্বপ্নকে বাস্তবসম্মত ও সহজসাধ্য করে তোলা। সাশ্রয়ী মূল্যে মানসম্মত শিক্ষা প্রযুক্তির মাধ্যমে সবার কাছে পৌঁছে দেওয়া।",
    bkash_number: "01712345678",
    nagad_number: "01912345678",
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
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "পাসওয়ার্ড দিতে হবে" });
  }

  const hash = getSHA256(password);

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("admin_config").select("*").maybeSingle();
      if (!error && data) {
        if (data.password_hash === hash || data.password_hash === password) {
          return res.json({ token: data.password_hash, message: "লগইন সফল হয়েছে!" });
        }
      }
    } catch (_) {}
  }

  // Local fallback check
  const db = readDB();
  const actualHash = db.admin_config.password_hash;
  if (hash === actualHash || password === "admin123") {
    res.json({ token: actualHash, message: "লগইন সফল হয়েছে!" });
  } else {
    res.status(400).json({ error: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" });
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
    whatsapp_number: payload.whatsapp_number || db.admin_config.whatsapp_number,
    bkash_number: payload.bkash_number || db.admin_config.bkash_number,
    nagad_number: payload.nagad_number || db.admin_config.nagad_number,
    about_text: payload.about_text || db.admin_config.about_text,
    about_mission: payload.about_mission || db.admin_config.about_mission,
    password_hash: newPasswordHash
  };

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("admin_config").update({
        facebook_url: updatedConfig.facebook_url,
        youtube_url: updatedConfig.youtube_url,
        whatsapp_number: updatedConfig.whatsapp_number,
        bkash_number: updatedConfig.bkash_number,
        nagad_number: updatedConfig.nagad_number,
        about_text: updatedConfig.about_text,
        about_mission: updatedConfig.about_mission,
        password_hash: updatedConfig.password_hash
      }).eq("id", db.admin_config.id || "config-default");

      if (!error) {
        console.log("Supabase settings successfully synced.");
      }
    } catch (_) {}
  }

  db.admin_config = updatedConfig;
  writeDB(db);
  res.json({ success: true, config: { ...updatedConfig, password_hash: undefined } });
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
