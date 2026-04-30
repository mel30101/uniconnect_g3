import { Event } from '../entities/Event';
import { EventCategory } from '../entities/EventCategory';

export interface IEventRepository {
  getEvents(categoryId?: string): Promise<Event[]>;
  getCategories(): Promise<EventCategory[]>;
  subscribeToCategory(userId: string, categoryId: string): Promise<void>;
  unsubscribeFromCategory(userId: string, categoryId: string): Promise<void>;
  getSubscribedCategories(userId: string): Promise<string[]>;

}