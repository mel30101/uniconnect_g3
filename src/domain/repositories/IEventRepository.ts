import { Event } from '../entities/Event';
import { EventCategory } from '../entities/EventCategory';

export interface IEventRepository {
  getEvents(categoryId?: string): Promise<Event[]>;
  getCategories(): Promise<EventCategory[]>;
}