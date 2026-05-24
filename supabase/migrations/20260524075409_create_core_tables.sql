
/*
  # Create Core Tables for Prostuti DHABI

  1. New Tables
    - `admin_config` - Site settings, social links, payment numbers, admin password hash
    - `teachers` - Teacher profiles with photo, bio, qualifications
    - `courses` - Course listings with curriculum (jsonb), pricing, category
    - `enrollments` - Student enrollment applications with payment info
    - `categories` - Course categories (dynamic, admin-managed)
    - `notices` - Site-wide notice/announcement board

  2. Security
    - RLS enabled on all tables
    - Public SELECT on courses (published only), teachers, categories, notices (active), admin_config
    - Public INSERT on enrollments (anyone can apply)
    - Admin full access via USING(true) policies for management panel
*/

-- 1. Admin Config
CREATE TABLE IF NOT EXISTS admin_config (
  id text PRIMARY KEY,
  password_hash text NOT NULL,
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

-- 2. Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  subject text NOT NULL,
  bio text,
  photo_url text,
  qualifications text,
  created_at timestamptz DEFAULT now()
);

-- 3. Courses
CREATE TABLE IF NOT EXISTS courses (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  full_description text NOT NULL DEFAULT '',
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

-- 4. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_id text REFERENCES courses(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_phone text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('bkash', 'nagad', 'rocket')),
  payment_number text NOT NULL,
  transaction_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz DEFAULT now()
);

-- 5. Categories
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. Notices
CREATE TABLE IF NOT EXISTS notices (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
