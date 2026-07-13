export interface CurriculumWeek {
  week: string;
  topic: string;
  details: string;
}

export interface CurriculumClass {
  id: string;
  title: string;
  duration?: string;
}

export interface CurriculumChapter {
  id: string;
  title: string;
  classes: CurriculumClass[];
}

export interface CurriculumSubject {
  id: string;
  title: string;
  chapters: CurriculumChapter[];
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
  curriculum: any[]; // Supports both old and new nested formats
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
  helpline_number?: string;
  created_at?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at?: string;
}

export function parseCurriculum(curriculum: any): CurriculumSubject[] {
  if (!curriculum || !Array.isArray(curriculum)) return [];
  
  // If it's already in the new format (has chapters/subjects)
  if (curriculum.length > 0 && ('chapters' in curriculum[0] || 'title' in curriculum[0] && Array.isArray((curriculum[0] as any).chapters))) {
    return curriculum as CurriculumSubject[];
  }

  // If it's in the old format CurriculumWeek: { week: string; topic: string; details: string }
  // We can convert it into a single subject named "কোর্স সিলেবাস" with chapters based on the weeks.
  const legacySubject: CurriculumSubject = {
    id: "legacy-subject",
    title: "কোর্স সিলেবাস",
    chapters: curriculum.map((item: any, idx: number) => {
      const weekTitle = item.week || `সপ্তাহ ${idx + 1}`;
      const topicTitle = item.topic || "টপিক";
      const details = item.details || "";
      
      return {
        id: `legacy-chapter-${idx}-${Date.now()}`,
        title: `${weekTitle}: ${topicTitle}`,
        classes: details ? [
          {
            id: `legacy-class-${idx}-${Date.now()}`,
            title: details
          }
        ] : []
      };
    })
  };

  return [legacySubject];
}
