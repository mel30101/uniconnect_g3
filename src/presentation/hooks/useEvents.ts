import { useEffect, useState, useCallback } from 'react';
import { getEvents, getEventCategories } from '../../di/container';
import { Event } from '../../domain/entities/Event';
import { EventCategory } from '../../domain/entities/EventCategory';
import { getValidSortedEvents } from '@/utils/dateUtils';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setLoadingCategories(true);
    try {
      const [eventsData, categoriesData] = await Promise.all([
        getEvents.execute(),
        getEventCategories.execute()
      ]);

      // Ordenar por categoría (type) y luego por fecha
      const sorted = [...eventsData].sort((a, b) => {
        const catCompare = a.type.localeCompare(b.type);
        if (catCompare !== 0) return catCompare;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setEvents(sorted);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando los datos iniciales de eventos:', error);
    } finally {
      setLoading(false);
      setLoadingCategories(false);
    }
  };

  const fetchEvents = useCallback(async (categoryId?: string) => {
    try {
      setLoading(true);
      const data = await getEvents.execute(categoryId);

      // Si hay filtro por categoría, solo ordenamos por fecha
      // Si no hay filtro, ordenamos por categoría y luego por fecha
      const sorted = [...data].sort((a, b) => {
        if (!categoryId) {
          const catCompare = a.type.localeCompare(b.type);
          if (catCompare !== 0) return catCompare;
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setEvents(sorted);
    } catch (error) {
      console.error('Error cargando los eventos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, categories, loading, loadingCategories, fetchEvents };
};