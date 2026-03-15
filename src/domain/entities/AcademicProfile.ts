export interface AcademicProfile {
  studentId: string;
  userName?: string;
  email?: string;
  facultyId: string;
  facultyName?: string;
  academicLevelId: string;
  academicLevelName?: string;
  formationLevelId: string;
  formationLevelName?: string;
  careerId: string;
  careerName?: string;
  subjects: string[];
  subjectNames?: string[];
  biography?: string;
  phone?: string;
  age?: number | string;
  studyPreference?: string;
  showEmail?: boolean;
}
