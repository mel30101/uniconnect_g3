import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { getProfile, saveProfile as saveProfileUC, getCareerStructure } from '../../di/container';
import { Career } from '../../domain/entities/Career';
import { Section } from '../../domain/entities/Section';

export const useProfile = (externalUserId?: string) => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingStructure, setFetchingStructure] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [profileData, setProfileData] = useState({
    facultyId: '',
    academicLevelId: '',
    formationLevelId: '',
    careerId: '',
    subjects: [] as string[],
    biography: '',
    phone: '',
    age: '',
    studyPreference: '',
    showEmail: true,
  });

  const targetUid = externalUserId || user?.uid;
  const isExternal = !!externalUserId && externalUserId !== user?.uid;

  const loadInitialData = useCallback(async () => {
    if (!targetUid) return;
    setLoading(true);
    try {
      const result = await getProfile.execute(targetUid);
      setCareers(result.careers);

      if (result.profile) {
        const data = result.profile;
        const initialProfile = {
          facultyId: data.facultyId || '',
          academicLevelId: data.academicLevelId || '',
          formationLevelId: data.formationLevelId || '',
          careerId: data.careerId || '',
          subjects: data.subjects || [],
          biography: data.biography || '',
          phone: data.phone || '',
          age: data.age?.toString() || '',
          studyPreference: data.studyPreference || '',
          showEmail: data.showEmail !== undefined ? data.showEmail : true,
          ...data,
        };
        setProfileData(initialProfile);
        const profileExists = !!data.careerId;
        setHasProfile(profileExists);
        setSections(result.sections);

        if (!isExternal) {
          if (!profileExists) setIsEditing(true);
          setUser({ ...user, ...initialProfile } as any);
        }
      } else {
        setHasProfile(false);
        setIsEditing(true);
      }
    } catch (e) {
      console.error('Error cargando perfil:', e);
    } finally {
      setLoading(false);
    }
  }, [targetUid, isExternal]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const updateCareer = async (id: string) => {
    setProfileData((prev) => ({ ...prev, careerId: id, subjects: [] }));
    setFetchingStructure(true);
    try {
      const data = await getCareerStructure.execute(id);
      setSections(data);
    } catch (e) {
      console.error('Error al cambiar carrera:', e);
    } finally {
      setFetchingStructure(false);
    }
  };

  const saveProfileHandler = async () => {
    if (!user?.uid) return;
    try {
      setSaving(true);
      const updatedData = await saveProfileUC.execute(user.uid, profileData);
      setProfileData((prev) => ({
        ...prev,
        ...updatedData,
        age: updatedData.age?.toString() || '',
      }));
      setUser({ ...user!, ...updatedData } as any);
      setHasProfile(true);
      setIsEditing(false);
      Alert.alert('¡Éxito!', 'Perfil guardado correctamente');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  return {
    user,
    profileData,
    loading,
    saving,
    fetchingStructure,
    isEditing,
    setIsEditing,
    hasProfile,
    careers,
    sections,
    setProfileData,
    updateCareer,
    saveProfile: saveProfileHandler,
  };
};
