# প্রস্তুতি ঢাবি — Prostuti DHABI (Dhaka University Admission Prep)

প্রস্তুতি ঢাবি (Prostuti DHABI) হলো একটি পূর্ণাঙ্গ, আধুনিক এবং অত্যন্ত দৃষ্টিনন্দন বাংলা এডটেক প্ল্যাটফর্ম, যা ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষায় অংশগ্রহণকারী বিজ্ঞান, মানবিক এবং ব্যবসায় শিক্ষা শাখার শিক্ষার্থীদের সর্বোচ্চ প্রস্তুতির লক্ষ্য নিয়ে ডিজাইন করা হয়েছে।

ভর্তিচ্ছু শিক্ষার্থীদের সুবিধার জন্য প্ল্যাটফর্মটিতে রয়েছে লাইভ ক্লাস কারিকুলাম, অভিজ্ঞ শিক্ষক মণ্ডলীর## 🗄️ SUPABASE SQL SCHEMAS (Copy-Paste Ready)

আপনার Supabase প্রোজেক্টের **SQL Editor**-এ নিচের স্ক্রিপ্টটি হুবহু কপি ও পেস্ট করে রান করুন। 

> ⚠️ **গুরুত্বপূর্ণ নোট:** এডমিন পাসওয়ার্ড মূলত `admin_config` টেবিলের `password_hash` কলামে সংরক্ষিত থাকে। পাসওয়ার্ড সরাসরি প্লেইন টেক্সট হিসেবে না রেখে নিরাপত্তার স্বার্থে তার SHA-256 হ্যাশ (Hash) রাখা হয়। নিচের স্ক্রিপ্টে ডিফল্ট পাসওয়ার্ড `marufvai19` এর হ্যাশ ভ্যালু দেওয়া আছে, যা দিয়ে আপনি সরাসরি লগইন করতে পারবেন। এছাড়া পূর্ববর্তী কোডের টাইপ কনভার্সন ইরর এড়াতে কপি-পেস্ট করার আগে আগের টেবিলগুলো ড্রপ করার কোড অবশ্যই রান করবেন:

```sql
-- 0. Clean up existing tables if migrating (WARNING: this deletes existing remote data! Back up first if needed)
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS admin_config CASCADE;

-- 1. Create table for Admin config and settings
CREATE TABLE admin_config (
  id text PRIMARY KEY, -- config-default হিসেবে থাকবে
  password_hash text NOT NULL, -- এটিই এডমিন পাসওয়ার্ড রাখার কলাম (SHA-256 হ্যাশ)
  facebook_url text,
  youtube_url text,
  telegram_url text,
  whatsapp_number text,
  bkash_number text,
  nagad_number text,
  rocket_number text,
  about_text text,
  about_mission text,
  created_at timestamptz DEFAULT now()
);

-- Insert original default admin configuration and SHA-256 password hash for 'marufvai19'
INSERT INTO admin_config (id, password_hash, facebook_url, youtube_url, whatsapp_number, about_text, about_mission, bkash_number, nagad_number, rocket_number) 
VALUES (
  'config-default',
  'a17d5f47c353ab7d0e3ddc0e21511eb0664fdcf5e78be6ac1965872881cead81', -- SHA-256 for 'marufvai19'
  'https://facebook.com/prostuti.dhabi',
  'https://youtube.com/prostuti.dhabi',
  '01712345678',
  'আমরা ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য সেরা প্রস্তুতি নিশ্চিত করি। আমাদের অভিজ্ঞ শিক্ষকমণ্ডলী ও গোছানো কারিকুলাম আপনাকে সাহায্য করবে আপনার কাঙ্ক্ষিত লক্ষ্যে পৌঁছাতে।',
  'আমাদের মিশন হলো প্রতিটি শিক্ষার্থীর কাছে ঢাকা বিশ্ববিদ্যালয়ের স্বপ্নকে বাস্তবসম্মত ও সহজসাধ্য করে তোলা। সাশ্রয়ী মূল্যে মানসম্মত শিক্ষা প্রযুক্তির মাধ্যমে সবার কাছে পৌঁছে দেওয়া।',
  '01712345678',
  '01912345678',
  '01811223344'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create table for Teachers
CREATE TABLE teachers (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  subject text NOT NULL,
  bio text,
  photo_url text,
  qualifications text,
  created_at timestamptz DEFAULT now()
);

-- 3. Create table for Courses
CREATE TABLE courses (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  short_description text NOT NULL,
  full_description text NOT NULL,
  cover_photo_url text,
  price numeric NOT NULL DEFAULT 0,
  duration text,
  total_classes integer,
  category text,
  is_published boolean DEFAULT false,
  teacher_ids text[] DEFAULT '{}',
  curriculum jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- 4. Create table for Enrollment Applications
CREATE TABLE enrollments (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_id text REFERENCES courses(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_phone text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('bkash', 'nagad')),
  payment_number text NOT NULL,
  transaction_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz DEFAULT now()
);

-- 5. Create table for Course Categories
CREATE TABLE categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. Create table for Notices (IMPORTANT: support notice alerts)
CREATE TABLE notices (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```��সায়ন ও সমতা", "details": "অ্যালকেন, অ্যালকিন, অ্যালকাইন রিঅ্যাকশন মেকানিজম এবং গুরুত্বপূর্ণ রূপান্তরসমূহ।"}, {"week": "সপ্তাহ ৩", "topic": "কোষ ও জিনতত্ত্ব", "details": "ডিএনএ রেপ্লিকেশন, লিঙ্কড জিন এবং ডারউইন তত্ত্বের আধুনিক ব্যাখ্যা।"}]'::jsonb),
('course-kha-unit-2025', 'ঢাবি ''খ'' ইউনিট মানবিক পূর্ণাঙ্গ প্রস্তুতি ২০২৫', 'মানবিক অনুষদের বাংলা, ইংরেজি ও সাধারণ জ্ঞান এর প্রশ্নব্যাংক সমাধান সহ স্পেশাল ব্যাচ।', 'ঢাকা বিশ্ববিদ্যালয় ''খ'' ইউনিট (কলা, সামাজিক বিজ্ঞান ও আইন অনুষদ) ভর্তিচ্ছু বন্ধুদের জন্য অত্যন্ত গোছানো সিলেবাস অনুযায়ী এই কোর্সটি সাজানো হয়েছে। ১০০% কার্যকরী শর্টকাট কৌশল এবং নিয়মিত মডেল টেস্টের মাধ্যমে নিজেকে গড়ে তুলুন অন্যদের থেকে সেরা।', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop', 3000, '৩.৫ মাস', 100, 'মানবিক', true, ARRAY['teacher-nasir'], '[{"week": "সপ্তাহ ১", "topic": "বাংলা ব্যাকরণ ও প্রমিত নিয়োমাবলী", "details": "বাংলা বানান, ধ্বনি পরিবর্তন ও নত্ব-ষত্ব বিধান এর সহজ কৌশল।"}, {"week": "সপ্তাহ ২", "topic": "ইংরেজি পার্টস অফ স্পিচ ও ভোকাবুলারি", "details": "ভর্তি পরীক্ষায় সবচেয়ে বেশি আসা ইংরেজি পার্টস অফ স্পিচ ও প্রিপজিশন এর নিখুঁত ব্যবহার।"}, {"week": "সপ্তাহ ৩", "topic": "সাম্প্রতিক সাধারণ জ্ঞান ও ভূ-রাজনীতি", "details": "চলতি বছরের জাতীয় ও আন্তর্জাতিক গুরুত্ত্বপূর্ণ ঘটনাবলী এবং সাধারণ জ্ঞান শর্টকাট টেকনিক।"}]'::jsonb),
('course-ga-unit-2025', 'ঢাবি ''গ'' ইউনিট ব্যবসায় শিক্ষা প্রস্তুতি ২০২৫', 'হিসাববিজ্ঞান, ফিন্যান্স, মার্কেটিং ও ম্যানেজমেন্ট বিষয়ের ওপর ১০০% প্রস্তুতি সহ লাইভ ডাউট সলভ ক্যাবিন।', 'ব্যবসা শিক্ষা অনুষদের ভর্তি প্রস্তুতি একদম গোড়া থেকে তৈরি করুন আমাদের স্পেশাল ক্লাস ও ঢাবি প্রশ্নব্যাংক কভারিং লেকচারের মাধ্যমে। প্রতিটি বিষয়ের বেসিক ক্লিয়ারিং ক্লাস এবং ভর্তি পরীক্ষার স্পেশাল সাজেশন সিট পেয়ে যাবে কোর্সে এনরোল করার সাথে সাথেই।', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop', 3200, '৪ মাস', 110, 'ব্যবসায়', true, ARRAY['teacher-nasir', 'teacher-sajid'], '[{"week": "সপ্তাহ ১", "topic": "হিসাববিজ্ঞান ও দ্বৈত সত্তা নীতি", "details": "জার্নাল পোস্টিং এবং ফাইনান্সিয়াল স্টেটমেন্ট সম্পর্কিত কনফিউশন ক্লিয়ারিং সেশন।"}, {"week": "সপ্তাহ ২", "topic": "ফিন্যান্স ও সময় মূল্য নীতি", "details": "অর্থের সময় মূল্যের জটিল সূত্র ও ক্যালকুলেটর ছাড়াই সমাধান করার দ্রুত ট্রিকস।"}, {"week": "সপ্তাহ ৩", "topic": "ম্যানেজমেন্ট প্রিন্সিপাল ও সিদ্ধান্ত গ্রহণ", "details": "ব্যবস্থাপনার নীতিসমূহ, টেলরিজম এবং এডমিশনের অতি প্রয়োজনীয় টপিকস।"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 4. Create table for Enrollment Applications
CREATE TABLE enrollments (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_id text REFERENCES courses(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_phone text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('bkash', 'nagad')),
  payment_number text NOT NULL,
  transaction_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz DEFAULT now()
);

-- 5. Create table for Course Categories
CREATE TABLE categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert default categories
INSERT INTO categories (id, name) VALUES 
('cat-sci', 'বিজ্ঞান'),
('cat-hum', 'মানবিক'),
('cat-bus', 'ব্যবসায়'),
('cat-oth', 'অন্যান্য')
ON CONFLICT (id) DO NOTHING;

-- 6. Create table for Notices (IMPORTANT: support notice alerts)
CREATE TABLE notices (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert default notice
INSERT INTO notices (id, title, content, is_active, created_at) VALUES
(
  'notice-welcome',
  'ঢাকা বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি প্ল্যাটফর্মে আপনাকে স্বাগতম!',
  'প্রিয় শিক্ষার্থী বন্ধুরা, ঢাকা বিশ্ববিদ্যালয় ২০২৫ শিক্ষাবর্ষের ভর্তি পরীক্ষা প্রস্তুতির জন্য আমাদের বিশেষ লাইভ ক্লাস, ওএমআর ভিত্তিক উইকলি মডেল টেস্ট ও ঢাবি প্রশ্নব্যাংক কভারিং ব্যাচে ভর্তি চলছে! যেকোনো প্রয়োজনে আমাদের হেল্পলাইন অথবা হোয়াটসঅ্যাপ নম্বরে সরাসরি যোগাযোগ করতে পারো।',
  true,
  '2026-05-22T19:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;
```

### 🔒 ROW LEVEL SECURITY (RLS) POLICIES

ভর্তিচ্ছু শিক্ষার্থীদের জন্য রিড অ্যাক্সেস এবং রেজিস্ট্রেশন রাইট নিশ্চিত করতে নিচের পলিসি ব্লকগুলো রান করুন:

```sql
-- Disable existing RLS first to avoid conflicts, then define complete permissive select/insert access
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read courses" ON courses;
DROP POLICY IF EXISTS "Public can read published courses" ON courses;
CREATE POLICY "Public can read courses" ON courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage courses" ON courses;
CREATE POLICY "Admin can manage courses" ON courses FOR ALL USING (true);

-- Security configuration for teachers
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read teachers" ON teachers;
CREATE POLICY "Public can read teachers" ON teachers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage teachers" ON teachers;
CREATE POLICY "Admin can manage teachers" ON teachers FOR ALL USING (true);

-- Security configuration for enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert enrollment" ON enrollments;
CREATE POLICY "Anyone can insert enrollment" ON enrollments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin can manage enrollments" ON enrollments;
CREATE POLICY "Admin can manage enrollments" ON enrollments FOR ALL USING (true);

-- Security configuration for public social metrics (config)
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read config" ON admin_config;
CREATE POLICY "Public can read config" ON admin_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage config" ON admin_config;
CREATE POLICY "Admin can manage config" ON admin_config FOR ALL USING (true);

-- Security configuration for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
CREATE POLICY "Admin can manage categories" ON categories FOR ALL USING (true);

-- Security configuration for notices
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read notices" ON notices;
CREATE POLICY "Public can read notices" ON notices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage notices" ON notices;
CREATE POLICY "Admin can manage notices" ON notices FOR ALL USING (true);
```

### 🗂️ SUPABASE STORAGE BUCKETS

ক্ষুদে শিক্ষার্থীদের জন্য বা অ্যাডমিন কভার ও ইমেজ আপলোডের জন্য নিচের বালতিগুলো **Public** সিলেক্ট করে তৈরি করুন:
1. `course-covers` (Public)
2. `teacher-photos` (Public)

---

## 🚀 LOCAL PERSISTENCE FALLBACK

আমাদের সিস্টেম সম্পূর্ণ রিয়্যাক্টিভ। যদি পরিবেশের ভেরিয়েবল (Environment variables) `NEXT_PUBLIC_SUPABASE_URL` এবং `SUPABASE_SERVICE_ROLE_KEY` সেট করা নাও থাকে, তবে প্ল্যাটফর্মটি ক্র্যাশ না করে স্বয়ংক্রিয়ভাবে একটি লোকাল JSON ফাইলব্যাক ডেটাবেস (`/data/db.json`) সার্ভার-সাইডে অ্যাক্টিভেট করে দেয়। এতে ভর্তি আবেদন পাঠানো, শিক্ষকদের সংযোজন ও অপসারণ করা, নতুন কোর্স তৈরি করা এবং অ্যাডমিন কন্ট্রোল প্যানেল থেকে শিক্ষার্থীদের পেমেন্ট অনুমোদন বা বাতিল করা যাবে যেকোনো সময় ও স্থানে।

---

## 🔑 ENVIRONMENT CONFIGURATION (`.env.local`)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ziydyorjdctwisatbvwp.supabase.co/rest/v1/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeWR5b3JqZGN0d2lzYXRidndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDQ4MjEsImV4cCI6MjA5NDkyMDgyMX0.GMUdTTKLrvaqIQWygsu-EPHcVAbnGngLiSl0E5Ns69o
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeWR5b3JqZGN0d2lzYXRidndwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM0NDgyMSwiZXhwIjoyMDk0OTIwODIxfQ.ShZ-2Zhpomt0_7WCpzqvjfHlvNwwJ0wlXcz-r2eft1M

 
