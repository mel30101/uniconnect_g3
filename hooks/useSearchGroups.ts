import { searchGroups } from "@/services/userService";
import { useState } from "react";

export const useSearchGroups = () => {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const performSearch = async (search: string, subjectId?: string, userSubjectIds?: string[]) => {
        try {
            setLoading(true);
            const data = await searchGroups(search.trim(), subjectId, userSubjectIds);
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
