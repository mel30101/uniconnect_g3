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

  async subscribeToCategory(userId: string, categoryId: string): Promise<void> {
    await apiClient.post('/api/events/suscribir', { userId, categoryId });
  }

  async unsubscribeFromCategory(userId: string, categoryId: string): Promise<void> {
    await apiClient.delete('/api/events/suscribir', { params: { userId, categoryId } });
  }

  async getSubscribedCategories(userId: string): Promise<string[]> {
    const res = await apiClient.get<string[]>(`/api/events/suscripciones/${userId}`);
    return res.data;
  }

}