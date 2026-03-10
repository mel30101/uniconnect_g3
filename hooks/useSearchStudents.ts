import { db } from "@/config/firebase";
import { getCareerStructure, searchStudents } from "@/services/userService";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { User } from "../types/User";

export const useSearchStudents = (userId?: string, initialCareerId?: string) => {
    const [users, setUsers] = useState<User[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeCareerId, setActiveCareerId] = useState<string | undefined>(initialCareerId);

    useEffect(() => {
        const verifyAcademicProfile = async () => {
            if (!userId) return;

            if (initialCareerId) {
                setActiveCareerId(initialCareerId);
                return;
            }

            try {
                const docRef = doc(db, "academic_profiles", userId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setActiveCareerId(data.careerId);
                }
            } catch (error) {
                console.error("Error verificando perfil académico:", error);
            }
        };

        verifyAcademicProfile();
    }, [userId, initialCareerId]);

    useEffect(() => {
        if (!activeCareerId) return;

        const loadSections = async () => {
            try {
                const data = await getCareerStructure(activeCareerId);
                setSections(data);
            } catch (error) {
                console.error("Error al cargar secciones:", error);
            }
        };
        loadSections();
    }, [activeCareerId]);

    const performSearch = async (search: string, selectedMaterias: string[]) => {
        try {
            setLoading(true);
            const data = await searchStudents(
                search.trim(),
                selectedMaterias.length > 0 ? selectedMaterias : undefined,
                userId
            );
            setUsers(data);
        } catch (error) {
            console.error("Error en búsqueda:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetResults = () => setUsers([]);

    return { users, sections, loading, performSearch, resetResults, hasCareer: !!activeCareerId };
};