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
    const [memberGroups, setMemberGroups] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
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

    const fetchMemberGroups = useCallback(async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/groups/user/${user.uid}?role=student`);
            if (res.ok) {
                const data = await res.json();
                setMemberGroups(data);
            }
        } catch (e) {
            console.error("Error fetching member groups:", e);
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

    const fetchRequests = useCallback(async (groupId: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}/requests`);
            if (res.ok) setRequests(await res.json());
        } catch (e) { console.error(e); }
    }, [BACKEND_URL]);

    const joinGroup = async (groupId: string) => {
        if (!user) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, userName: user.name }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error");
            Alert.alert("¡Éxito!", "Solicitud enviada.");
            return true;
        } catch (e: any) {
            Alert.alert("Aviso", e.message);
            return false;
        }
    };

    const processRequest = async (groupId: string, requestId: string, status: 'accepted' | 'rejected') => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}/requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                Alert.alert("Éxito", `Solicitud ${status === 'accepted' ? 'aceptada' : 'rechazada'}`);
                fetchRequests(groupId);
                return true;
            }
        } catch (e) { Alert.alert("Error", "No se pudo procesar"); }
        return false;
    };

    const transferAdmin = async (groupId: string, newAdminId: string) => {
        if (!user?.uid) return false;
        try {
            const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}/transfer-admin`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: user.uid, newAdminId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al transferir administración");
            Alert.alert("¡Éxito!", "Has cedido la administración de este grupo. Ahora volverás a tu lista de grupos.");
            return true;
        } catch (e: any) {
            Alert.alert("Aviso", e.message);
            return false;
        }
    };

    const removeMember = async (groupId: string, userId: string) => {
    if (!user?.uid) return false;
    try {
        const url = `${BACKEND_URL}/api/groups/${groupId}/members/${userId}?adminId=${user.uid}`;
        
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        if (res.ok) {
            Alert.alert("Éxito", "Miembro eliminado.");
            return true;
        } else {
            Alert.alert("Error", data.error || "No se pudo eliminar al miembro.");
            return false;
        }
    } catch (e: any) {
        console.error(e);
        Alert.alert("Error", "Problema de conexión al eliminar.");
        return false;
    }
};

const [availableStudents, setAvailableStudents] = useState([]);
const fetchAvailableStudents = async (groupId: string, subjectId: string, search: string = '') => {
    const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}/available-students?subjectId=${subjectId}&search=${search}`);
    const data = await res.json();
    setAvailableStudents(data);
};
const addMemberToGroup = async (groupId: string, userId: string) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: userId,
                role: 'student' 
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return res.ok;
    } catch (e) {
        console.error("Error al añadir miembro:", e);
        return false;
    }
};

const leaveGroup = async (groupId: string, userId: string) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}/leave/${userId}`, {
            method: 'DELETE',
        });
        
        if (res.ok) {
            Alert.alert("Éxito", "Has salido del grupo.");
            return true;
        }
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};
    return {
        createGroup,
        userSubjects,
        managedGroups,
        memberGroups,
        fetchManagedGroups,
        fetchMemberGroups,
        fetchGroupDetail,
        fetchRequests,
        requests,
        loading,
        joinGroup,
        processRequest,
        transferAdmin,
        removeMember,
        addMemberToGroup,
        availableStudents,
        fetchAvailableStudents,
        setAvailableStudents,
        leaveGroup,
    };
};