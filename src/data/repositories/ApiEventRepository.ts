import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { Event } from '../../domain/entities/Event';
import { EventCategory } from '../../domain/entities/EventCategory';
import apiClient from '../sources/ApiClient';

export class ApiEventRepository implements IEventRepository {
  async getEvents(categoryId?: string): Promise<Event[]> {
    const url = categoryId ? `/api/events?category=${categoryId}` : '/api/events';
    const res = await apiClient.get<Event[]>(url);
    return res.data;
  }

  async getCategories(): Promise<EventCategory[]> {
    const res = await apiClient.get<EventCategory[]>('/api/events/categories');
    return res.data;
  }
}