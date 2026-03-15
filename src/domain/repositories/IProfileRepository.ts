import { AcademicProfile } from '../entities/AcademicProfile';

export interface IProfileRepository {
  getProfile(uid: string): Promise<AcademicProfile | null>;
  saveProfile(studentId: string, profileData: Partial<AcademicProfile>): Promise<AcademicProfile>;
}
