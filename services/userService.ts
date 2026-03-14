export const searchStudents = async (
    name?: string,
    subjectIds?: string[],
    excludeId?: string
) => {
    const params = new URLSearchParams();

    if (name) params.append("name", name);

    if (subjectIds && subjectIds.length > 0) {
        params.append("subjectId", subjectIds.join(","));
    }

    if (excludeId) params.append("excludeId", excludeId);

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/search-students?${params.toString()}`
    );

    if (!response.ok) {
        const text = await response.text();
        console.log("STATUS:", response.status);
        console.log("BODY:", text)
        throw new Error(`Backend error: ${response.status}`);
    }
    return await response.json();
};

export const searchGroups = async (name?: string, subjectId?: string, userSubjectIds?: string[], userId?: string) => {
    const params = new URLSearchParams();
    if (name) params.append("search", name);
    if (subjectId) params.append("subjectId", subjectId);
    if (userSubjectIds && userSubjectIds.length > 0) {
        params.append("userSubjectIds", userSubjectIds.join(","));
    }
    if (userId) params.append("userId", userId);

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/groups?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
    }
    return await response.json();
};

export const getSubjects = async () => {
    const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/subjects`
    );
    return response.json();
};

export const getCareerStructure = async (careerId: string) => {
    const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/career-structure/${careerId}`
    );

    if (!response.ok) {
        throw new Error("Error fetching career structure");
    }

    return await response.json();
};

export const getUserProfile = async (uid: string) => {
    const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/academic-profile/${uid}`
    );

    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Error fetching user profile");
    }

    return await response.json();
};