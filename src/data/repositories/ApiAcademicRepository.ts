import { IAcademicRepository } from '../../domain/repositories/IAcademicRepository';
import { Career } from '../../domain/entities/Career';
import { Section } from '../../domain/entities/Section';
import { Subject } from '../../domain/entities/Subject';
import apiClient from '../sources/ApiClient';

export class ApiAcademicRepository implements IAcademicRepository {
  async getCareers(): Promise<Career[]> {
    const res = await apiClient.get('/api/careers');
    return res.data;
  }

  async getCareerStructure(careerId: string): Promise<Section[]> {
    const res = await apiClient.get(`/api/career-structure/${careerId}`);
    return res.data;
  }

  async getSubjects(): Promise<Subject[]> {
    const res = await apiClient.get('/api/subjects');
    return res.data;
  }
}
