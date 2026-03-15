import { Career } from '../entities/Career';
import { Section } from '../entities/Section';
import { Subject } from '../entities/Subject';

export interface IAcademicRepository {
  getCareers(): Promise<Career[]>;
  getCareerStructure(careerId: string): Promise<Section[]>;
  getSubjects(): Promise<Subject[]>;
  getFaculties?(): Promise<any[]>;
  getAcademicLevels?(): Promise<any[]>;
  getFormationLevels?(): Promise<any[]>;
}
