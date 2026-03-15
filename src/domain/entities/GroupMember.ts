export interface GroupMember {
  id: string;
  name: string;
  role: 'admin' | 'student';
  joinedAt?: any;
}
