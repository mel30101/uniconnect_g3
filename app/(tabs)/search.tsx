import { getSubjects, searchStudents } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import UserCard from "../../components/users/UserCard";
import { User } from "../../types/User";

interface Subject {
    id: string;
    name: string;
}

export default function SearchScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [search, setSearch] = useState<string>("");
    const [selectedMateria, setSelectedMateria] = useState<string | null>(null);
    const [onlyMonitors, setOnlyMonitors] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const data = await getSubjects();
            setSubjects(data);
        } catch (error) {
            console.error("Error cargando materias", error);
        }
    };

    const animatePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);

            const data = await searchStudents(
                search.trim(),
                selectedMateria || undefined,
                onlyMonitors
            );

            setUsers(data);
        } catch (error) {
            console.error("Error al buscar estudiante", error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedMateria(null);
        setOnlyMonitors(false);
        setUsers([]);
    };


    return (
        <View style={styles.container}>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9ca3af" />
                <TextInput
                    placeholder="Buscar por nombre..."
                    placeholderTextColor="#9ca3af"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.input}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch("")}>
                        <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.filterCard}>
                <View style={styles.filterHeader}>
                    <Text style={styles.filterTitle}>Filtros</Text>
                    {(selectedMateria || onlyMonitors) && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {(selectedMateria ? 1 : 0) + (onlyMonitors ? 1 : 0)}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.sectionLabel}>Materia</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {subjects.map((subject) => (
                        <TouchableOpacity
                            key={subject.id}
                            onPress={() =>
                                setSelectedMateria(
                                    selectedMateria === subject.id ? null : subject.id
                                )
                            }
                            style={[
                                styles.chip,
                                selectedMateria === subject.id && styles.chipActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    selectedMateria === subject.id && styles.chipTextActive,
                                ]}
                            >
                                {subject.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.switchRow}>
                    <Text style={styles.sectionLabel}>Solo monitores</Text>
                    <Switch
                        value={onlyMonitors}
                        onValueChange={setOnlyMonitors}
                    />
                </View>
            </View>

            <TouchableOpacity
                onPress={fetchStudents}
                style={[
                    styles.searchButton,
                    loading && { opacity: 0.7 }
                ]}
                disabled={loading}
            >
                <Text style={styles.searchButtonText}>
                    {loading ? "Buscando..." : "Buscar"}
                </Text>
            </TouchableOpacity>

            {(search || selectedMateria || onlyMonitors) && (
                <TouchableOpacity onPress={clearFilters}>
                    <Text style={styles.clearText}>Limpiar filtros</Text>
                </TouchableOpacity>
            )}

            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <UserCard user={item} />}
                contentContainerStyle={{ paddingTop: 15, paddingBottom: 30 }}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={40} color="#d1d5db" />
                            <Text style={styles.emptyTitle}>
                                No encontramos resultados
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                Intenta ajustar los filtros
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f4f6f8",
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    searchIcon: {
        marginRight: 8,
    },

    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },

    monitorContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },

    searchButton: {
        backgroundColor: "#4f46e5",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },

    searchButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },

    clearText: {
        color: "#4f46e5",
        textAlign: "center",
        marginTop: 12,
        fontWeight: "600",
    },

    emptyText: {
        textAlign: "center",
        marginTop: 30,
        color: "#777",
    },

    chip: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: "#e5e7eb",
        borderRadius: 20,
        marginRight: 10,
    },

    chipActive: {
        backgroundColor: "#4f46e5",
    },

    chipText: {
        fontSize: 14,
        color: "#333",
    },

    chipTextActive: {
        color: "#ffffff",
        fontWeight: "600",
    },

    filterCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },

    filterHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    filterTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },

    badge: {
        backgroundColor: "#4f46e5",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },

    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },

    sectionLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6b7280",
        marginBottom: 8,
    },

    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 15,
    },

    emptyContainer: {
        alignItems: "center",
        marginTop: 40,
    },

    emptyTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 10,
        color: "#374151",
    },

    emptySubtitle: {
        fontSize: 14,
        color: "#9ca3af",
        marginTop: 4,
    },
});