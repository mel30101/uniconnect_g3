import { getCareerStructure, searchStudents } from "@/services/userService";
import { useEffect, useState } from "react";
import { User } from "../types/User";

export const useSearchStudents = (userId?: string) => {
    const [users, setUsers] = useState<User[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await getCareerStructure("422");
                setSections(data);
            } catch (error) {
                console.error("Error cargando secciones", error);
            }
        };
        loadInitialData();
    }, []);

    const performSearch = async (search: string, selectedMaterias: string[], onlyMonitors: boolean) => {
        try {
            setLoading(true);
            const data = await searchStudents(
                search.trim(),
                selectedMaterias.length > 0 ? selectedMaterias : undefined,
                onlyMonitors,
                userId
            );
            setUsers(data);
        } catch (error) {
            console.error("Error al buscar", error);
        } finally {
            setLoading(false);
        }
    };

    const resetResults = () => setUsers([]);

    return { users, sections, loading, performSearch, resetResults };
};