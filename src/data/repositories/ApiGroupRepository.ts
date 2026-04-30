import { IGroupRepository } from '../../domain/repositories/IGroupRepository';
import { Group } from '../../domain/entities/Group';
import apiClient from '../sources/ApiClient';

export class ApiGroupRepository implements IGroupRepository {
  
  async getUserGroups(userId: string, role: 'admin' | 'student'): Promise<Group[]> {
    const res = await apiClient.get<Group[]>(`/api/groups/user/${userId}?role=${role}`);
    return res.data;
  }

  async getGroupDetail(groupId: string): Promise<Group | null> {
    try {
      const res = await apiClient.get<Group>(`/api/groups/${groupId}`);
      return res.data;
    } catch {
      return null;
    }
  }

  async createGroup(name: string, subjectId: string, description: string, creatorId: string): Promise<any> {
    const res = await apiClient.post<any>('/api/groups', { name, subjectId, description, creatorId });
    return res.data;
  }

  async sendJoinRequest(groupId: string, userId: string, userName: string): Promise<any> {
    const res = await apiClient.post<any>(`/api/groups/${groupId}/requests`, { userId, userName });
    return res.data;
  }

  async getRequests(groupId: string): Promise<any[]> {
    const res = await apiClient.get<any[]>(`/api/groups/${groupId}/requests`);
    return res.data;
  }

  async processRequest(groupId: string, requestId: string, status: 'accepted' | 'rejected'): Promise<boolean> {
    const res = await apiClient.put(`/api/groups/${groupId}/requests/${requestId}`, { status });
    return res.status === 200;
  }

  async removeMember(groupId: string, userId: string, adminId: string): Promise<any> {
    const res = await apiClient.delete<any>(`/api/groups/${groupId}/members/${userId}?adminId=${adminId}`);
    return res.data;
  }

  async transferAdmin(groupId: string, adminId: string, newAdminId: string): Promise<any> {
    const res = await apiClient.put<any>(`/api/groups/${groupId}/transfer-admin`, { adminId, newAdminId });
    return res.data;
  }

  async addMember(groupId: string, userId: string, role: string): Promise<boolean> {
    const res = await apiClient.post(`/api/groups/${groupId}/members`, { userId, role });
    return res.status === 200 || res.status === 201;
  }

  async leaveGroup(groupId: string, userId: string): Promise<boolean> {
    const res = await apiClient.delete(`/api/groups/${groupId}/leave/${userId}`);
    return res.status === 200;
  }

  async getAvailableStudents(groupId: string, subjectId: string, search: string = ''): Promise<any[]> {
    const res = await apiClient.get<any[]>(`/api/groups/${groupId}/available-students?subjectId=${subjectId}&search=${search}`);
    return res.data;
  }

  async deleteUserRequests(groupId: string, userId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/api/groups/${groupId}/requests/${userId}`);
      return response.status === 200;
    } catch (error) {
      console.error("Error eliminando solicitudes viejas:", error);
      return false;
    }
  }

  async respondToAdminTransfer(groupId: string, candidateId: string, action: 'accept' | 'reject'): Promise<boolean> {
    const res = await apiClient.post(`/api/groups/${groupId}/transfer-admin/response`, { candidateId, action });
    return res.status === 200;
  }

  async requestAdminTransfer(groupId: string, adminId: string, candidateId: string): Promise<boolean> {
    const res = await apiClient.post(`/api/groups/${groupId}/transfer-admin/request`, { adminId, candidateId });
    return res.status === 200;
  }
}