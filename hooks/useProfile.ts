import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';

export const useProfile = () => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [careers, setCareers] = useState([]);
  const [sections, setSections] = useState([]);
  const [profileData, setProfileData] = useState({
    careerId: '',
    subjects: [],
    isMonitor: false
  });

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (user?.id) loadInitialData();
  }, [user?.id]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [careersRes, profileRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/careers`),
        fetch(`${BACKEND_URL}/api/academic-profile/${user?.id}`)
      ]);
      const careersData = await careersRes.json();
      setCareers(careersData);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfileData({
          careerId: data.careerId,
          subjects: data.subjects || [],
          isMonitor: data.isMonitor || false
        });
        setHasProfile(true);
        fetchCareerStructure(data.careerId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareerStructure = async (id: string) => {
    const res = await fetch(`${BACKEND_URL}/api/career-structure/${id}`);
    const data = await res.json();
    setSections(data);
  };

  return { 
    user, loading, isEditing, setIsEditing, hasProfile, setHasProfile,
    careers, sections, profileData, setProfileData, fetchCareerStructure 
  };
};