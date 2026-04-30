import { IProfileRepository } from '../../domain/repositories/IProfileRepository';
import { AcademicProfile } from '../../domain/entities/AcademicProfile';
import apiClient from '../sources/ApiClient';

export class ApiProfileRepository implements IProfileRepository {
  async getProfile(uid: string): Promise<AcademicProfile | null> {
    try {
      const res = await apiClient.get<AcademicProfile>(`/api/academic-profile/${uid}`);
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  async getFullProfile(uid: string): Promise<AcademicProfile | null> {
    try {
      const res = await apiClient.get<AcademicProfile>(`/api/academic-profile/estadisticas/${uid}?vista=completa`);
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }


  async saveProfile(studentId: string, profileData: Partial<AcademicProfile>): Promise<AcademicProfile> {
    const res = await apiClient.post<AcademicProfile>('/api/academic-profile', {
      studentId,
      ...profileData,
    });

    return res.data;
  }
}