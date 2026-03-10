import { useAuthStore } from "@/store/useAuthStore";
import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";

interface Subject {
    id: string;
    name: string;
}

export const useGroups = () => {
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [userSubjects, setUserSubjects] = useState<Subject[]>([]);
    const [managedGroups, setManagedGroups] = useState<any[]>([]);

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const fetchManagedGroups = useCallback(async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/groups/user/${user.uid}?role=admin`);
            if (res.ok) {
                const data = await res.json();
                setManagedGroups(data);
            }
        } catch (e) {
            console.error("Error fetching managed groups:", e);
        } finally {
            setLoading(false);
        }
    }, [user?.uid, BACKEND_URL]);

    const fetchGroupDetail = useCallback(async (groupId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}`);
            if (!res.ok) throw new Error("Failed to fetch group details");
            return await res.json();
        } catch (e) {
            console.error("Error fetching group detail:", e);
            return null;
        } finally {
            setLoading(false);
        }
    }, [BACKEND_URL]);

    const fetchUserSubjects = useCallback(async () => {
        if (!user?.uid || !user?.careerId) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/career-structure/${user.careerId}`);
            if (!res.ok) throw new Error("Failed to fetch career structure");

            const sectionsData = await res.json();
            const profileSubjects = user.subjects || [];

            // Aplanar materias y filtrar por las que el usuario tiene en su perfil
            const allSubjects: Subject[] = [];
            sectionsData.forEach((section: any) => {
                section.subjects.forEach((sub: any) => {
                    if (profileSubjects.includes(sub.id)) {
                        allSubjects.push({ id: sub.id, name: sub.name });
                    }
                });
            });

            setUserSubjects(allSubjects);
        } catch (e) {
            console.error("Error fetching subjects for groups:", e);
        }
    }, [user?.uid, user?.careerId, user?.subjects, BACKEND_URL]);

    useEffect(() => {
        fetchUserSubjects();
    }, [fetchUserSubjects]);

    const createGroup = async (name: string, subjectId: string, description: string) => {
        if (!user?.uid) return;
        setLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/api/groups`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    subjectId,
                    description,
                    creatorId: user.uid,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "UNKNOWN_ERROR");
            }

            return data;
        } catch (e: any) {
            console.log("Handled creation error:", e.message);
            let errorMsg = "No se pudo crear el grupo.";
            if (e.message === "GROUP_NAME_ALREADY_EXISTS") {
                errorMsg = "El nombre del grupo ya está en uso.";
            } else if (e.message === "NAME_TOO_SHORT") {
                errorMsg = "El nombre es demasiado corto (mín. 3 caracteres).";
            }
            Alert.alert("Error", errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        createGroup,
        userSubjects,
        managedGroups,
        fetchManagedGroups,
        fetchGroupDetail,
        loading,
    };
};
