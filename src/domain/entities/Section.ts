import { Subject } from './Subject';

export interface Section {
  sectionId: string;
  sectionName: string;
  subjects: Subject[];
}
