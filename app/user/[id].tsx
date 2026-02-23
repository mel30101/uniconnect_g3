import { getOrCreateChat } from "@/services/chatService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ExternalProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const {user: authUser} = useAuth();

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/academic-profile/${id}`);
                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error("Error al obtener perfil:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [id]);

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} color="#4f46e5" />;
    if (!user) return <View style={styles.container}><Text>No se encontró el perfil.</Text></View>;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* --- BOTÓN DE REGRESO --- */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#111827" />
            </TouchableOpacity>

            <View style={styles.header}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user.userName?.charAt(0)}</Text>
                </View>

                <Text style={styles.name}>{user.userName}</Text>
                <Text style={styles.career}>{user.careerName}</Text>

                {user.isMonitor && (
                    <View style={styles.monitorBadge}>
                        <Text style={styles.monitorText}>Monitor Académico</Text>
                    </View>
                )}
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Materias que cursa:</Text>
                {user.subjectNames?.map((name: string, index: number) => (
                    <View key={index} style={styles.subjectItem}>
                        <Ionicons name="book-outline" size={18} color="#4f46e5" />
                        <Text style={styles.subjectText}>{name}</Text>
                    </View>
                ))}
            </View>

            {/* --- BOTÓN DE INICIAR CHAT (PROVISIONAL) --- */}
            <TouchableOpacity
                style={styles.chatButton}
                onPress={async () => {
                    if (!authUser?.uid || !id) return;

                    const chatId = await getOrCreateChat(
                        authUser.uid,
                        id as string
                    );

                    console.log("CHAT ID:", chatId);

                    router.push({
                        pathname: "/(tabs)/chat/[chatId]",
                        params: { chatId },
                    });
                }}
            >
                <Ionicons name="chatbubble-ellipses" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.chatButtonText}>Iniciar Chat</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f4f6f8" },
    backButton: {
        marginTop: 50,
        marginLeft: 20,
        width: 40,
        height: 40,
        justifyContent: "center"
    },
    header: {
        alignItems: "center",
        paddingHorizontal: 30, // Espacio lateral para que el texto no toque los bordes
        paddingBottom: 20
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#4f46e5",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15
    },
    avatarText: { color: "#fff", fontSize: 40, fontWeight: "bold" },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#111827",
        textAlign: "center", // Centra el texto
        width: '100%'
    },
    career: {
        fontSize: 16,
        color: "#4f46e5",
        marginTop: 10,
        textAlign: "center",
        fontWeight: "600"
    },
    monitorBadge: { backgroundColor: "#10b981", paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, marginTop: 15 },
    monitorText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
    infoCard: { backgroundColor: "#fff", margin: 20, borderRadius: 16, padding: 20, elevation: 2 },
    sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 15, color: "#374151" },
    subjectItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    subjectText: { marginLeft: 10, fontSize: 15, color: "#4b5563" },

    // Estilos del nuevo botón
    chatButton: {
        backgroundColor: "#4f46e5",
        flexDirection: "row",
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        elevation: 3
    },
    chatButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});