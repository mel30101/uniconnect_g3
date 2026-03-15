export interface User {
  uid: string;
  name: string;
  email: string;
  photo?: string;
  careerId?: string;
  subjects?: string[];
  biography?: string;
  phone?: string;
  age?: string;
  studyPreference?: string;
  showEmail?: boolean;
  facultyId?: string;
  academicLevelId?: string;
  formationLevelId?: string;
}
