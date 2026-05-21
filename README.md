# প্রস্তুতি ঢাবি — Prostuti DHABI (Dhaka University Admission Prep)

প্রস্তুতি ঢাবি (Prostuti DHABI) হলো একটি পূর্ণাঙ্গ, আধুনিক এবং অত্যন্ত দৃষ্টিনন্দন বাংলা এডটেক প্ল্যাটফর্ম, যা ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষায় অংশগ্রহণকারী বিজ্ঞান, মানবিক এবং ব্যবসায় শিক্ষা শাখার শিক্ষার্থীদের সর্বোচ্চ প্রস্তুতির লক্ষ্য নিয়ে ডিজাইন করা হয়েছে।

ভর্তিচ্ছু শিক্ষার্থীদের সুবিধার জন্য প্ল্যাটফর্মটিতে রয়েছে লাইভ ক্লাস কারিকুলাম, অভিজ্ঞ শিক্ষক মণ্ডলীর প্রোফাইল ড্যাশবোর্ড এবং সম্পূর্ণ ওএমআর ও ট্রানজেকশন ভিত্তিক নিরাপদ ভর্তি রেজিস্ট্রেশন প্রসেস।

---

## 🛠️ TECH STACK

- **Frontend core:** React 19 + TypeScript + Tailwind CSS v4 + Framer Motion
- **Full-stack Backend runtime:** Node.js Express server (`/server.ts`)
- **Database Engine:** Supabase integration (PostgreSQL + RLS Auth)
- **Local Fallback:** Filesystem Auto-reactive JSON Database (`/data/db.json`)
- **Payment Verification:** Manual transaction audit interface (bKash & Nagad)
- **Styles & Imagery:** Fluid mesh gradients, glassmorphic visual widgets, responsive layouts, and Unsplash premium fallback references.

---

## 🗄️ SUPABASE SQL SCHEMAS (Copy-Paste Ready)

আপনার Supabase প্রোজেক্টের **SQL Editor**-এ নিচের স্ক্রিপ্টটি হুবহু কপি ও পেস্ট করে রান করুন:

```sql
-- 1. Create table for Admin config and settings
CREATE TABLE admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash text NOT NULL,
  facebook_url text,
  youtube_url text,
  whatsapp_number text,
  about_text text,
  about_mission text,
  bkash_number text,
  nagad_number text,
  created_at timestamptz DEFAULT now()
);

-- Insert original default admin password 'admin123'
INSERT INTO admin_config (password_hash, facebook_url, youtube_url, whatsapp_number, about_text, about_mission, bkash_number, nagad_number) 
VALUES (
  '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- SHA-256 for 'admin123'
  'https://facebook.com/prostuti.dhabi',
  'https://youtube.com/prostuti.dhabi',
  '01712345678',
  'আমরা ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য সেরা প্রস্তুতি নিশ্চিত করি। আমাদের অভিজ্ঞ শিক্ষকমণ্ডলী ও গোছানো কারিকুলাম আপনাকে সাহায্য করবে আপনার কাঙ্ক্ষিত লক্ষ্যে পৌঁছাতে।',
  'আমাদের মিশন হলো প্রতিটি শিক্ষার্থীর কাছে ঢাকা বিশ্ববিদ্যালয়ের স্বপ্নকে বাস্তবসম্মত ও সহজসাধ্য করে তোলা। সাশ্রয়ী মূল্যে মানসম্মত শিক্ষা প্রযুক্তির মাধ্যমে সবার কাছে পৌঁছে দেওয়া।',
  '01712345678',
  '01912345678'
);

-- 2. Create table for Teachers
CREATE TABLE teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  bio text,
  photo_url text,
  qualifications text,
  created_at timestamptz DEFAULT now()
);

-- 3. Create table for Courses
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text NOT NULL,
  full_description text NOT NULL,
  cover_photo_url text,
  price numeric NOT NULL DEFAULT 0,
  duration text,
  total_classes integer,
  category text,
  is_published boolean DEFAULT false,
  teacher_ids uuid[] DEFAULT '{}',
  curriculum jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- 4. Create table for Enrollment Applications
CREATE TABLE enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_phone text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('bkash', 'nagad')),
  payment_number text NOT NULL,
  transaction_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz DEFAULT now()
);
```

### 🔒 ROW LEVEL SECURITY (RLS) POLICIES

ভর্তিচ্ছু শিক্ষার্থীদের জন্য রিড অ্যাক্সেস এবং রেজিস্ট্রেশন রাইট নিশ্চিত করতে নিচের পলিসি ব্লকগুলো রান করুন:

```sql
-- Security configuration for courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published courses" ON courses
  FOR SELECT USING (is_published = true);

-- Security configuration for teachers
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read teachers" ON teachers
  FOR SELECT USING (true);

-- Security configuration for enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert enrollment" ON enrollments
  FOR INSERT WITH CHECK (true);

-- Security configuration for public social metrics (config)
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read config" ON admin_config
  FOR SELECT USING (true);
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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Administrative Secret
ADMIN_SECRET_TOKEN=your_random_secret_for_api_routes
```
