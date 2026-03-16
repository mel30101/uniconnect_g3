import { IEventRepository } from '../../../domain/repositories/IEventRepository';

export class GetEvents {
  constructor(private eventRepo: IEventRepository) {}

  async execute() {
    return this.eventRepo.getEvents();
  }
}
