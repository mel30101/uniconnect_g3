import { useAuthStore } from "@/store/useAuthStore";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export const useProfile = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // CORRECCIÓN: Tipado para evitar errores de 'never'
  const [careers, setCareers] = useState<Career[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [profileData, setProfileData] = useState({
    facultyId: "",
    academicLevelId: "",
    formationLevelId: "",
    careerId: "",
    subjects: [] as string[], // Guardamos solo los IDs de las materias
    biography: "",
    phone: "",
    age: "",
    studyPreference: "",
    showEmail: true,
  });

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const loadInitialData = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);

    try {
      // 1. Cargar lista de carreras y perfil del estudiante en paralelo
      const [careersRes, profileRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/careers`),
        fetch(`${BACKEND_URL}/api/academic-profile/${user.uid}`),
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
          ...data // Preservar nombres resueltos (facultyName, etc.)
        };

        setProfileData(initialProfile);
        // Only consider the user to "have a profile" if they have selected a career
        const profileExists = !!data.careerId;
        setHasProfile(profileExists);
        if (!profileExists) setIsEditing(true);

        // Sincronizar Zustand
        setUser({ ...user, ...initialProfile });

        // 2. Cargar materias si ya tiene una carrera asignada (Ej: "422")
        if (data.careerId) {
          const structRes = await fetch(
            `${BACKEND_URL}/api/career-structure/${data.careerId}`,
          );
          if (structRes.ok) {
            const structData = await structRes.json();
            setSections(structData);
          }
        }
      } else {
        // No hay documento de perfil, forzar edición para onboarding
        setHasProfile(false);
        setIsEditing(true);
      }
    } catch (e) {
      console.error("Error cargando perfil:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, BACKEND_URL, setUser]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Esta función se llama desde el Picker cuando el usuario cambia de carrera
  const updateCareer = async (id: string) => {
    setProfileData((prev) => ({ ...prev, careerId: id, subjects: [] }));
    try {
      const res = await fetch(`${BACKEND_URL}/api/career-structure/${id}`);
      const data = await res.json();
      setSections(data);
    } catch (e) {
      console.error("Error al cambiar carrera:", e);
    }
  };

  const saveProfile = async () => {
    if (!user?.uid) return;

    // Validación obligatoria: Recorrido Académico completo
    const { facultyId, academicLevelId, formationLevelId, careerId, subjects, phone, age } = profileData;

    // Validación de Celular (si se proporciona, debe tener 10 dígitos)
    if (phone && phone.length !== 10) {
      Alert.alert(
        "Celular Inválido",
        "El número de celular debe tener exactamente 10 dígitos."
      );
      return;
    }

    // Validación de Edad (si se proporciona, debe tener 2 dígitos)
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

    // Nueva validación: Al menos una materia seleccionada
    if (!subjects || subjects.length === 0) {
      Alert.alert(
        "Materias Pendientes",
        "Debes seleccionar al menos una materia para registrar tu perfil académico."
      );
      return;
    }

    try {
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

        // Sincronizar estado local y global con la respuesta completa
        // Usamos spread directo para asegurar que facultyName, careerName, etc. se mantengan
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
    }
  };

  return {
    user,
    loading,
    isEditing,
    setIsEditing,
    hasProfile,
    careers,
    sections,
    profileData,
    setProfileData,
    updateCareer,
    saveProfile,
  };
};

// Define esto fuera de la función del Hook o en un archivo de tipos
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
