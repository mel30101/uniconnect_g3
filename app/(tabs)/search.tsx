import { Collapsible } from "@/components/Collapsible";
import { getCareerStructure, searchStudents } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, FlatList, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import UserCard from "../../components/users/UserCard";
import { User } from "../../types/User";
import UCaldasTheme from "../constants/Colors";
import { useAuth } from "../context/AuthContext";

interface Subject {
    id: string;
    name: string;
    sectionId: string;
}

interface CareerSection {
    sectionId: string;
    sectionName: string;
    subjects: Subject[];
}

export default function SearchScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [sections, setSections] = useState<CareerSection[]>([]);
    const [search, setSearch] = useState<string>("");
    const {user} = useAuth();
    const [selectedMaterias, setSelectedMaterias] = useState<string[]>([]);
    
    const [onlyMonitors, setOnlyMonitors] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(true);

    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        loadSection();
    }, []);

    const loadSection = async () => {
        try {
            const data = await getCareerStructure("422");
            setSections(data);
        } catch (error) {
            console.error("Error cargando secciones", error);
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
            setShowFilters(false);

            const data = await searchStudents(
                search.trim(),
                selectedMaterias.length > 0 ? selectedMaterias : undefined,
                onlyMonitors,
                user?.uid
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
        setSelectedMaterias([]); // 3. Vaciamos el arreglo al limpiar
        setOnlyMonitors(false);
        setUsers([]);
        setShowFilters(true);
    };

    // 4. Función para agregar o quitar una materia del arreglo
    const toggleMateria = (subjectId: string) => {
        setSelectedMaterias((prev) => {
            if (prev.includes(subjectId)) {
                // Si ya está seleccionada, la quitamos
                return prev.filter((id) => id !== subjectId);
            } else {
                // Si no está, la agregamos
                return [...prev, subjectId];
            }
        });
    };

    return (
        <View style={styles.container}>

            {/* BARRA DE BÚSQUEDA Y BOTÓN DE FILTROS */}
            <View style={styles.topRow}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        placeholder="Buscar por nombre..."
                        placeholderTextColor="#9ca3af"
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={fetchStudents}
                        style={styles.input}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* BOTÓN PARA ABRIR/CERRAR FILTROS */}
                <TouchableOpacity
                    style={[styles.filterIconBtn, showFilters && styles.filterIconBtnActive]}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Ionicons
                        name="options-outline"
                        size={24}
                        color={showFilters ? "#fff" : UCaldasTheme.azulOscuro}
                    />
                </TouchableOpacity>
            </View>

            {/* SECCIÓN DE FILTROS Y BOTONES (Se oculta al buscar) */}
            {showFilters && (
                <View style={styles.filtersWrapper}>
                    <View style={styles.filterCard}>
                        <View style={styles.filterHeader}>
                            <Text style={styles.filterTitle}>Filtros</Text>
                            {/* 5. Actualizamos la condición del badge para que cuente el arreglo */}
                            {(selectedMaterias.length > 0 || onlyMonitors) && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {selectedMaterias.length + (onlyMonitors ? 1 : 0)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.sectionLabel}>Secciones y Materias</Text>
                        <View style={styles.sectionsContainer}>
                            {sections.map((section) => (
                                <Collapsible key={section.sectionId} title={section.sectionName}>
                                    <View style={styles.chipsContainer}>
                                        {section.subjects.map((subject) => (
                                            <TouchableOpacity
                                                key={subject.id}
                                                onPress={() => toggleMateria(subject.id)}
                                                style={[
                                                    styles.chip,
                                                    // 6. Verificamos si el ID está en el arreglo
                                                    selectedMaterias.includes(subject.id) && styles.chipActive,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        selectedMaterias.includes(subject.id) && styles.chipTextActive,
                                                    ]}
                                                >
                                                    {subject.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </Collapsible>
                            ))}
                        </View>

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
                            {loading ? "Buscando..." : "Aplicar Filtros y Buscar"}
                        </Text>
                    </TouchableOpacity>

                    {/* 7. Actualizamos la condición para mostrar el botón de limpiar */}
                    {(search || selectedMaterias.length > 0 || onlyMonitors) && (
                        <TouchableOpacity onPress={clearFilters}>
                            <Text style={styles.clearText}>Limpiar filtros</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* LISTA DE ESTUDIANTES */}
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

    topRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 12,
    },

    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    filterIconBtn: {
        backgroundColor: "#fff",
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    filterIconBtnActive: {
        backgroundColor: UCaldasTheme.azulOscuro,
    },

    filtersWrapper: {
        marginBottom: 10,
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
        backgroundColor: UCaldasTheme.azulOscuro,
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
        color: "#374151",
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
    },

    chipActive: {
        backgroundColor: UCaldasTheme.azulOscuro,
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
        shadowColor: "#b0b0b0",
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
        backgroundColor: UCaldasTheme.azulOscuro,
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

    sectionsContainer: {
        marginTop: 5,
        marginBottom: 15,
        gap: 10,
    },

    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        paddingVertical: 10,
    },
});