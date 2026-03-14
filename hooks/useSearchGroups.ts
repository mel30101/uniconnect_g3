import { searchGroups } from "@/services/userService";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";

export const useSearchGroups = () => {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const user = useAuthStore((state) => state.user);

    const performSearch = async (search: string, subjectId?: string, userSubjectIds?: string[]) => {
        if (!user?.uid) return;
        try {
            setLoading(true);
            const data = await searchGroups(search.trim(), subjectId, userSubjectIds, user.uid);
            setGroups(data);
        } catch (error) {
            console.error("Error searching groups:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetResults = () => setGroups([]);

    return { groups, loading, performSearch, resetResults };
};
