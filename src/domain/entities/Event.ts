export interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  description: string;
  type: 'Cultural' | 'Deportivo' | 'Académico' | 'Social';
  imageUrl?: string;
}
