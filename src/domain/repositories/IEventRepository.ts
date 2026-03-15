import { Event } from '../entities/Event';

export interface IEventRepository {
  getEvents(): Promise<Event[]>;
}
