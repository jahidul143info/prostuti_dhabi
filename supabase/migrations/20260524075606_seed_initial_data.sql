
/*
  # Seed Initial Data for Prostuti DHABI

  Inserts:
  - Default admin config (password: marufvai19, SHA-256 hash stored)
  - 4 teachers with photos and qualifications
  - 8 published courses covering Ka, Kha, Ga units and more
  - 4 default categories
  - 1 welcome notice
*/

-- Admin Config (default password: marufvai19)
INSERT INTO admin_config (id, password_hash, facebook_url, youtube_url, telegram_url, whatsapp_number, bkash_number, nagad_number, rocket_number, about_text, about_mission)
VALUES (
  'config-default',
  'a17d5f47c353ab7d0e3ddc0e21511eb0664fdcf5e78be6ac1965872881cead81',
  'https://www.facebook.com/share/1EuqVi7L7k/',
  'https://youtube.com/@prostuti-dhabi?si=YsK9AqNowX8shbXn',
  'https://t.me/prostutidhabii',
  '01570238312',
  '01570238312',
  '01570238312',
  '01570238312',
  'আমরা ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য সেরা প্রস্তুতি নিশ্চিত করি। আমাদের অভিজ্ঞ শিক্ষকমণ্ডলী ও গোছানো কারিকুলাম আপনাকে সাহায্য করবে আপনার কাঙ্ক্ষিত লক্ষ্যে পৌঁছাতে।',
  'আমাদের মিশন হলো প্রতিটি শিক্ষার্থীর কাছে ঢাকা বিশ্ববিদ্যালয়ের স্বপ্নকে বাস্তবসম্মত ও সহজসাধ্য করে তোলা। সাশ্রয়ী মূল্যে মানসম্মত শিক্ষা প্রযুক্তির মাধ্যমে সবার কাছে পৌঁছে দেওয়া।'
) ON CONFLICT (id) DO NOTHING;

-- Teachers
INSERT INTO teachers (id, name, subject, bio, photo_url, qualifications) VALUES
('teacher-sajid', 'ড. সাজিদ হাসান', 'রসায়ন ও গণিত', '১০ বছরেরও বেশি সময় ধরে ঢাবি ভর্তি প্রত্যাশীদের মেন্টরশিপ করে আসছেন।', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop', 'বিএসসি, এমএসসি (ঢাকা বিশ্ববিদ্যালয়), পিএইচডি (জাপান)'),
('teacher-farhana', 'অধ্যাপিকা ফারহানা চৌধুরী', 'বাংলা ও ইংরেজি সাহিত্য', 'ভর্তি সহায়ক অসংখ্য বইয়ের প্রণেতা এবং বিশ্ববিদ্যালয় ভর্তি কোচিংয়ের জনপ্রিয় শিক্ষক।', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop', 'বিএ (সরাসরি ১ম শ্রেণী), এমএ (ইংরেজি, ঢাবি)'),
('teacher-manzur', 'মনজুরুল ইসলাম', 'হিসাববিজ্ঞান ও ফিন্যান্স', '৮ বছরের বেশি সময় কোচিং জগতে গ-ইউনিট বিশেষজ্ঞদের অন্যতম শীর্ষ মেন্টর।', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop', 'বিবিএ, এমবিএ (হিসাববিজ্ঞান বিভাগ, ঢাকা বিশ্ববিদ্যালয়)'),
('teacher-anika', 'আনিকা তাসনিম', 'পদার্থবিজ্ঞান ও জীববিজ্ঞান', 'ভর্তি পরীক্ষার্থীদের জন্য সহজ কৌশলে কঠিন সূত্র ও তত্ত্ব মনে রাখার জাদুকরি ট্রেইনার।', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop', 'এমবিবিএস (ঢাকা মেডিকেল কলেজ), বিএসসি (পদার্থবিজ্ঞান, ঢাবি)')
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (id, name) VALUES
('cat-sci', 'বিজ্ঞান'),
('cat-hum', 'মানবিক'),
('cat-biz', 'ব্যবসায়'),
('cat-gst', 'গুচ্ছ'),
('cat-oth', 'অন্যান্য')
ON CONFLICT (id) DO NOTHING;

-- Courses
INSERT INTO courses (id, title, short_description, full_description, cover_photo_url, price, duration, total_classes, category, is_published, teacher_ids, curriculum) VALUES
(
  'course-ka-unit-2025',
  'ঢাবি ''ক'' ইউনিট সম্পূর্ণ ভর্তি প্রস্তুতি ২০২৫',
  'বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য পদার্থ, রসায়ন, গণিত ও জীববিজ্ঞানের নিখুঁত প্রস্তুতি কোর্স।',
  'ঢাকা বিশ্ববিদ্যালয় ''ক'' ইউনিট ভর্তি পরীক্ষায় শতভাগ প্রস্তুতির লক্ষ্য নিয়ে এই কোর্সটি ডিজাইন করা হয়েছে। অভিজ্ঞ বিশ্ববিদ্যালয় পড়ুয়া মেন্টর এবং বুয়েট-মেডিকেল শিক্ষকমণ্ডলী দ্বারা পরিচালিত হবে ক্লাসসমূহ।',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
  3500, '৪ মাস', 120, 'বিজ্ঞান', true,
  ARRAY['teacher-sajid', 'teacher-anika'],
  '[{"week":"সপ্তাহ ১","topic":"ক্যালকুলাস ও নিউটনীয় বলবিদ্যা","details":"অন্তরীকরণ ও যোগজীকরণ এর মূল নিয়মসমূহ এবং বলবিদ্যা পরীক্ষার প্রশ্ন ব্যাঙ্ক সমাধান।"},{"week":"সপ্তাহ ২","topic":"জৈব রসায়ন ও সমতা","details":"অ্যালকেন, অ্যালকিন, অ্যালকাইন রিঅ্যাকশন মেকানিজম এবং গুরুত্বপূর্ণ রূপান্তরসমূহ।"},{"week":"সপ্তাহ ৩","topic":"কোষ ও জিনতত্ত্ব","details":"ডিএনএ রেপ্লিকেশন, লিঙ্কড জিন এবং ডারউইন তত্ত্বের আধুনিক ব্যাখ্যা।"}]'::jsonb
),
(
  'course-medical-parallel',
  'মেডিকেল + ঢাবি ''ক'' সমান্তরাল প্রস্তুতি ব্যাচ',
  'মেডিকেল ভর্তি প্রস্তুতি ও ঢাবি ক ইউনিটের পদার্থ-রসায়ন-জীববিজ্ঞান কভার ব্যাচ।',
  'যারা একই সাথে মেডিকেল এবং ঢাকা বিশ্ববিদ্যালয় ''ক'' ইউনিটের প্রস্তুতি নিতে চান, তাদের জন্য দ্বিমুখী ফুল সিলেবাস বুস্টার ব্যাচ।',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop',
  4200, '৫ মাস', 150, 'বিজ্ঞান', true,
  ARRAY['teacher-anika', 'teacher-sajid'],
  '[{"week":"সপ্তাহ ১","topic":"মানব শারীরতত্ত্ব ও প্রাণীর পরিচিতি","details":"পরিপাক, রক্ত সংবহন ও হাইড্রা সংলগ্ন গুরুত্বপূর্ণ মেডিকেল প্রশ্ন ব্যাখ্যা।"},{"week":"সপ্তাহ ২","topic":"রাসায়নিক পরিবর্তনের গাণিতিক হ্যাকস","details":"pH হ্যাকস, বাফার সলিউশন এবং রাসায়নিক গণনা ট্রিক্স।"}]'::jsonb
),
(
  'course-kha-unit-2025',
  'ঢাবি ''খ'' ইউনিট সমন্বিত মানবিক প্রস্তুতি',
  'বাংলা, ইংরেজি এবং অত্যন্ত তথ্যবহুল সাধারণ জ্ঞানের জন্য কমপ্লিট সলিউশন ব্যাচ।',
  'মানবিক বিভাগ থেকে যারা ঢাকা বিশ্ববিদ্যালয়ে স্বপ্ন দেখছেন, তাদের জন্য বাংলা এবং ইংরেজি ব্যাকরণ ও সাহিত্যের সাথে সাধারণ জ্ঞান সম্পূর্ণ কভার করা হবে।',
  'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop',
  2800, '৩ মাস', 90, 'মানবিক', true,
  ARRAY['teacher-farhana'],
  '[{"week":"সপ্তাহ ১","topic":"বাংলা ব্যাকরণ ও প্রিপজিশন","details":"সন্ধি, সমাস ও English Prepositions masterclass."},{"week":"সপ্তাহ ২","topic":"বাঙালির ইতিহাস ও সমসাময়িক সাধারণ জ্ঞান","details":"ভাষা আন্দোলন থেকে শুরু করে মুক্তিযুদ্ধ এবং বর্তমান মেগা প্রজেক্টসমূহ পর্যালোচনা।"}]'::jsonb
),
(
  'course-premium-english',
  'আইবিএ ও ঢাবি বি-ইউনিট প্রিমিয়াম ইংলিশ ব্যাচ',
  'English Grammar, Vocabulary, and Written preparation to build ultimate confidence.',
  'ঢাকা বিশ্ববিদ্যালয় এবং আইবিএ ভর্তি পরীক্ষার অন্যতম কঠিন অংশ ইংরেজি ভীতি দূর করার বিশেষ ব্যাচ।',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=600&auto=format&fit=crop',
  2000, '২ মাস', 45, 'মানবিক', true,
  ARRAY['teacher-farhana'],
  '[{"week":"সপ্তাহ ১","topic":"Subject-Verb Agreement & Parts of Speech","details":"পরীক্ষায় বারবার আসা গুরুত্বপূর্ণ ৫০টি রুলস ও সংশোধন পদ্ধতি।"},{"week":"সপ্তাহ ২","topic":"Free Handwriting & Essay/Paragraph Writing","details":"রিটেন পার্টের কাঠামো এবং কীভাবে মানসম্মত ইংরেজি উত্তর লেখা যায়।"}]'::jsonb
),
(
  'course-ga-unit-2025',
  'ঢাবি ''গ'' ইউনিট ব্যবসায় শিক্ষা চূড়ান্ত ভর্তি ব্যাচ',
  'Accounting, Management, Marketing/Finance ও English এর পূর্ণাঙ্গ প্রস্তুতি।',
  'ঢাকা বিশ্ববিদ্যালয়ের ''গ'' ইউনিটে (ব্যবসায় শিক্ষা) চান্স পাওয়ার চূড়ান্ত সহায়ক ব্যাচ এটি।',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
  3000, '৩.৫ মাস', 80, 'ব্যবসায়', true,
  ARRAY['teacher-manzur', 'teacher-farhana'],
  '[{"week":"সপ্তাহ ১","topic":"হিসাববিজ্ঞান পরিচিতি ও জাবেদা","details":"লেনদেনের দ্বিমুখী প্রভাব, হিসাব সমীকরণ এবং ডেবিট-ক্রেডিট বিশ্লেষণ।"},{"week":"সপ্তাহ ২","topic":"ব্যবসায় সংগঠন ও আধুনিক ব্যবস্থাপনা","details":"শিল্প ও বাণিজ্য, অংশীদারি কারবারের খুঁটিনাটি আইনি জটিলতা।"}]'::jsonb
),
(
  'course-commerce-math',
  'ব্যবসায় গণিত এবং হিসাববিজ্ঞান স্পেশাল হ্যাকস',
  'হিসাববিজ্ঞানের ট্রিকি ম্যাথ ট্রিকস ও দ্রুত ক্যালকুলেশন ছাড়াই সমাধান করার মেথড।',
  'ক্যালকুলেটর ছাড়া জাবেদা, খতিয়ান, সমন্বয় দাখিলা ও দ্রুত গাণিতিক সমস্যার সমাধান করার ম্যাজিক্যাল হ্যাকস।',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop',
  1500, '১.৫ মাস', 30, 'ব্যবসায়', true,
  ARRAY['teacher-manzur'],
  '[{"week":"সপ্তাহ ১","topic":"অনুপাত বিশ্লেষণ ও আর্থিক বিবরণীর ট্রিক্স","details":"অনুপাত বিশ্লেষণ ও আর্থিক বিবরণীর কঠিন অংকগুলো শর্টকাটে করার ট্রিক্স।"}]'::jsonb
),
(
  'course-gst-combined',
  'জিএসটি গুচ্ছ (GST) ও রাবি/চবি সমন্বিত ব্যাচ',
  '২২টি সাধারণ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় এবং রাবি-চবির সেরা ভর্তি প্রস্তুতি ব্যাচ।',
  'গুচ্ছভুক্ত ২৪টি সাধারণ এবং বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের সমন্বিত ভর্তি প্রস্তুতির উদ্দেশ্যে বিশেষভাবে ডিজাইনকৃত কোর্স।',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop',
  2500, '৩ মাস', 75, 'গুচ্ছ', true,
  ARRAY['teacher-sajid', 'teacher-farhana', 'teacher-anika'],
  '[{"week":"সপ্তাহ ১","topic":"গুচ্ছভিত্তিক বহুনির্বাচনী প্রশ্নব্যাংক সমাধান","details":"রাবি, চবি এবং জিএসটি ওএমআর কাঠামোর তুলনামূলক আলোচনা।"}]'::jsonb
),
(
  'course-omr-model-test',
  'ভর্তি পরীক্ষা ওএমআর ভিত্তিক চূড়ান্ত মডেল টেস্ট সিরিজ',
  'দেশব্যাপী লাখো ভর্তিচ্ছু শিক্ষার্থীদের সঙ্গে ওএমআর মেধা যাচাই টেস্ট ও সলভ ক্লাস সিরিজ।',
  'অনলাইন এবং অফলাইন উভয় মাধ্যমে ভর্তি পরীক্ষার ঠিক আগে নিজেকে যাচাই করার জন্য ওএমআর ভিত্তিক চূড়ান্ত মডেল টেস্ট ব্যাচ।',
  'https://images.unsplash.com/photo-1510712474076-eb51a4a821e1?q=80&w=600&auto=format&fit=crop',
  1000, '১ মাস', 25, 'গুচ্ছ', true,
  ARRAY['teacher-sajid', 'teacher-farhana', 'teacher-manzur', 'teacher-anika'],
  '[{"week":"সপ্তাহ ১","topic":"১০ সেট ওএমআর মডেল টেস্ট","details":"নেগেটিভ মার্কিং বিশ্লেষণের ওপর গুরুত্ব দিয়ে প্রস্তুতকৃত মডেল সলভ।"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Welcome Notice
INSERT INTO notices (id, title, content, is_active, created_at) VALUES
(
  'notice-welcome',
  'ঢাকা বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি প্ল্যাটফর্মে আপনাকে স্বাগতম!',
  'প্রিয় শিক্ষার্থী বন্ধুরা, ঢাকা বিশ্ববিদ্যালয় ২০২৫ শিক্ষাবর্ষের ভর্তি পরীক্ষা প্রস্তুতির জন্য আমাদের বিশেষ লাইভ ক্লাস, ওএমআর ভিত্তিক উইকলি মডেল টেস্ট ও ঢাবি প্রশ্নব্যাংক কভারিং ব্যাচে ভর্তি চলছে! যেকোনো প্রয়োজনে আমাদের হেল্পলাইন অথবা হোয়াটসঅ্যাপ নম্বরে সরাসরি যোগাযোগ করতে পারো।',
  true,
  '2026-05-22T19:00:00.000Z'
) ON CONFLICT (id) DO NOTHING;

-- Sample enrollment
INSERT INTO enrollments (id, course_id, student_name, student_phone, payment_method, payment_number, transaction_id, status) VALUES
('enroll-example-1', 'course-ka-unit-2025', 'রাফসান জামিল', '01822334455', 'bkash', '01822334455', 'TRX88299AJ33', 'pending')
ON CONFLICT (id) DO NOTHING;
