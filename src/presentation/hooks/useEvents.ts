import { useEffect, useState } from 'react';
import { getEvents } from '../../di/container';
import { Event } from '../../domain/entities/Event';
import { getValidSortedEvents } from '@/utils/dateUtils';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getEvents.execute();
      const sortedEvents = getValidSortedEvents(data);
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error cargando los eventos desde la BD:', error);
    } finally {
      setLoading(false);
    }
  };

  return { events, loading };
};
