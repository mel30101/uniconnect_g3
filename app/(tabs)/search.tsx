import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Animated, FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import UserCard from "../../components/users/UserCard";
import { getUsers } from "../../services/userService";
import { User } from "../../types/User";

export default function SearchScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState<string>("");
    const [selectedMateria, setSelectedMateria] = useState<string | null>(null);
    const [onlyMonitors, setOnlyMonitors] = useState<boolean>(false);

    // simulación Materias mock
    const materias = [
        { id: "calculo1", nombre: "Cálculo I" },
        { id: "fisica1", nombre: "Física I" },
    ];

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    const filteredUsers = users.filter((user) => {
        const matchesName = search === "" || user.name.toLowerCase().includes(search.toLowerCase());

        const matchesMateria = !selectedMateria || user.materiasIds.includes(selectedMateria);

        const matchesMonitor = !onlyMonitors || user.esMonitor;

        return matchesName && matchesMateria && matchesMonitor

    });

    const scaleAnim = new Animated.Value(1);

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

    return (
        <View style={styles.container}>

            <View style={styles.searchContainer}>
                <Ionicons
                    name="search"
                    size={20}
                    color="#999"
                    style={styles.searchIcon}
                />
                <TextInput
                    placeholder="Buscar compañeros..."
                    placeholderTextColor="#999"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.input}
                />
            </View>

            <View>
                <Text style={styles.sectionTitle}>Filtrar por materia</Text>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={materias}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <Pressable
                                onPress={() => {
                                    animatePress();
                                    setSelectedMateria(
                                        selectedMateria === item.id ? null : item.id
                                    );
                                }}
                                style={[
                                    styles.chip,
                                    selectedMateria === item.id && styles.chipActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedMateria === item.id && styles.chipTextActive,
                                    ]}
                                >
                                    {item.nombre}
                                </Text>
                            </Pressable>
                        </Animated.View>
                    )}
                />
            </View>

            <View style={styles.monitorContainer}>
                <Text style={styles.sectionTitle}>Solo monitores</Text>
                <Switch
                    value={onlyMonitors}
                    onValueChange={setOnlyMonitors}
                />
            </View>

            {/* 📋 Resultados */}
            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <UserCard user={item} />}
                contentContainerStyle={{ paddingTop: 10 }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        No se encontraron resultados
                    </Text>
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

    clearButton: {
        alignSelf: "flex-end",
        marginTop: 10,
    },

    clearText: {
        color: "#4f46e5",
        fontWeight: "600",
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        color: "#333",
    },

    chip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: "#e0e0e0",
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
        color: "#fff",
        fontWeight: "600",
    },

    monitorContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 20,
    },

    emptyText: {
        textAlign: "center",
        marginTop: 30,
        color: "#777",
    },
});

