
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
        const text= await response.text();
        console.log("STATUS:", response.status);
        console.log("BODY:", text)
        throw new Error(`Backend error: ${response.status}`);
    }
    return await response.json();
};