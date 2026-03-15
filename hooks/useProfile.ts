import { useAuthStore } from "@/store/useAuthStore";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

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
    facultyId: "",
    academicLevelId: "",
    formationLevelId: "",
    careerId: "",
    subjects: [] as string[], 
    biography: "",
    phone: "",
    age: "",
    studyPreference: "",
    showEmail: true,
  });
  const targetUid = externalUserId || user?.uid;
  const isExternal = !!externalUserId && externalUserId !== user?.uid;
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const loadInitialData = useCallback(async () => {
    if (!targetUid) return;
    setLoading(true);

    try {
      const [careersRes, profileRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/careers`),
        fetch(`${BACKEND_URL}/api/academic-profile/${targetUid}`),
      ]);

      const careersData = await careersRes.json();
      setCareers(careersData);

      if (profileRes.ok) {
        const data = await profileRes.json();
        const initialProfile = {
          facultyId: data.facultyId || "",
          academicLevelId: data.academicLevelId || "",
          formationLevelId: data.formationLevelId || "",
          careerId: data.careerId || "",
          subjects: data.subjects || [],
          biography: data.biography || "",
          phone: data.phone || "",
          age: data.age?.toString() || "",
          studyPreference: data.studyPreference || "",
          showEmail: data.showEmail !== undefined ? data.showEmail : true,
          ...data 
        };
        setProfileData(initialProfile);
        const profileExists = !!data.careerId;
        setHasProfile(profileExists);
        if (!isExternal) {
          if (!profileExists) setIsEditing(true);
          setUser({ ...user, ...initialProfile });
        } 

        if (data.careerId) {
          setFetchingStructure(true);
          const structRes = await fetch(`${BACKEND_URL}/api/career-structure/${data.careerId}`);
          if (structRes.ok) {
            const structData = await structRes.json();
            setSections(structData);
          }
          setFetchingStructure(false);
        }
      } else {
        setHasProfile(false);
        setIsEditing(true);
      }
    } catch (e) {
      console.error("Error cargando perfil:", e);
    } finally {
      setLoading(false);
    }
  }, [targetUid, isExternal, BACKEND_URL]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const updateCareer = async (id: string) => {
    setProfileData((prev) => ({ ...prev, careerId: id, subjects: [] }));
    setFetchingStructure(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/career-structure/${id}`);
      const data = await res.json();
      setSections(data);
    } catch (e) {
      console.error("Error al cambiar carrera:", e);
    } finally {
      setFetchingStructure(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.uid) return;
    const { facultyId, academicLevelId, formationLevelId, careerId, subjects, phone, age } = profileData;
    if (phone && phone.length !== 10) {
      Alert.alert(
        "Celular Inválido",
        "El número de celular debe tener exactamente 10 dígitos."
      );
      return;
    }
    if (age && age.length !== 2) {
      Alert.alert(
        "Edad Inválida",
        "La edad debe tener exactamente 2 dígitos."
      );
      return;
    }
    if (!facultyId || !academicLevelId || !formationLevelId || !careerId) {
      Alert.alert(
        "Información Incompleta",
        "Para continuar, es obligatorio completar todo tu recorrido académico (Facultad, Niveles y Carrera)."
      );
      return;
    }
    if (!subjects || subjects.length === 0) {
      Alert.alert(
        "Materias Pendientes",
        "Debes seleccionar al menos una materia para registrar tu perfil académico."
      );
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(`${BACKEND_URL}/api/academic-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.uid,
          ...profileData,
        }),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setProfileData((prev) => ({
          ...prev,
          ...updatedData,
          age: updatedData.age?.toString() || "",
        }));
        setUser({ ...user!, ...updatedData });
        setHasProfile(true);
        setIsEditing(false);
        Alert.alert("¡Éxito!", "Perfil guardado correctamente");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar el perfil");
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
    saveProfile,
  };
};
interface Subject {
  id: string; // Ej: "59G8F"
  name: string; // Ej: "Análisis y Diseño..."
  credits: number;
  sectionId: string;
}
interface Section {
  sectionId: string; // Ej: "INFO_TEORICA"
  sectionName: string; // Ej: "Informática Teórica"
  subjects: Subject[];
}
interface Career {
  id: string; // Ej: "422"
  name: string; // Ej: "Ingeniería de Sistemas..."
}