import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { Event } from '../../domain/entities/Event';
import apiClient from '../sources/ApiClient';

export class ApiEventRepository implements IEventRepository {
  async getEvents(): Promise<Event[]> {
    const res = await apiClient.get<Event[]>('/api/events');
    return res.data;
  }
}
