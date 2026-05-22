export interface CurriculumWeek {
  week: string;
  topic: string;
  details: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  bio?: string;
  photo_url?: string;
  qualifications?: string;
  created_at?: string;
}

export interface Course {
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
  curriculum: CurriculumWeek[];
  created_at?: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  student_name: string;
  student_phone: string;
  payment_method: 'bkash' | 'nagad' | 'rocket';
  payment_number: string;
  transaction_id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at?: string;
  course_title?: string; // Hydrated for admin display
}

export interface AdminConfig {
  id: string;
  password_hash: string;
  facebook_url?: string;
  youtube_url?: string;
  telegram_url?: string;
  whatsapp_number?: string;
  about_text?: string;
  about_mission?: string;
  bkash_number?: string;
  nagad_number?: string;
  rocket_number?: string;
  created_at?: string;
}
