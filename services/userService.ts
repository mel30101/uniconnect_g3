
export const searchStudents = async (
    name?: string,
    subjectId?: string,
    isMonitor?: boolean
) => {
    const params = new URLSearchParams();

    if (name) params.append("name", name);
    if (subjectId) params.append("subjectId", subjectId);
    if (isMonitor) params.append("isMonitor", "true");

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/search-students?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error("Error al buscar estudiante");
    }
    return await response.json();
};