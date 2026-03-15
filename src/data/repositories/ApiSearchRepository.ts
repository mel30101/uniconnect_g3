import { ISearchRepository } from '../../domain/repositories/ISearchRepository';
import { User } from '../../domain/entities/User';
import { Group } from '../../domain/entities/Group';
import apiClient from '../sources/ApiClient';

export class ApiSearchRepository implements ISearchRepository {
  async searchStudents(name?: string, subjectIds?: string[], excludeId?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (subjectIds && subjectIds.length > 0) {
      params.append('subjectId', subjectIds.join(','));
    }
    if (excludeId) params.append('excludeId', excludeId);

    const res = await apiClient.get(`/api/search-students?${params.toString()}`);
    return res.data;
  }

  async searchGroups(name?: string, subjectId?: string, userSubjectIds?: string[], userId?: string): Promise<Group[]> {
    const params = new URLSearchParams();
    if (name) params.append('search', name);
    if (subjectId) params.append('subjectId', subjectId);
    if (userSubjectIds && userSubjectIds.length > 0) {
      params.append('userSubjectIds', userSubjectIds.join(','));
    }
    if (userId) params.append('userId', userId);

    const res = await apiClient.get(`/api/groups?${params.toString()}`);
    return res.data;
  }
}
