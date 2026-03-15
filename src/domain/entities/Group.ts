import { GroupMember } from './GroupMember';

export interface Group {
  id: string;
  name: string;
  subjectId: string;
  subjectName?: string;
  description?: string;
  creatorId: string;
  admin?: string;
  members?: GroupMember[];
  memberCount?: number;
}
