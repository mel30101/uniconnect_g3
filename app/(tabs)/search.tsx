import { useSearchStudents } from "@/hooks/useSearchStudents";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FilterSection } from "../../components/search/FilterSection";
import UserCard from "../../components/users/UserCard";
import UCaldasTheme from "../constants/Colors";

export default function SearchScreen() {
    const user = useAuthStore((state => state.user));

    const { users, sections, loading, performSearch, resetResults } = useSearchStudents(user?.id);

    const [search, setSearch] = useState("");
    const [selectedMaterias, setSelectedMaterias] = useState<string[]>([]);
    const [onlyMonitors, setOnlyMonitors] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    const handleSearch = () => {
        setShowFilters(false);
        performSearch(search, selectedMaterias, onlyMonitors);
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedMaterias([]);
        setOnlyMonitors(false);
        resetResults();
        setShowFilters(true);
    };

    const toggleMateria = (id: string) => {
        setSelectedMaterias(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={handleSearch}
                        style={styles.input}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.filterIconBtn, showFilters && styles.filterIconBtnActive]}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Ionicons name="options-outline" size={24} color={showFilters ? "#fff" : UCaldasTheme.azulOscuro} />
                </TouchableOpacity>
            </View>

            {showFilters && (
                <FilterSection
                    sections={sections}
                    selectedMaterias={selectedMaterias}
                    onlyMonitors={onlyMonitors}
                    onToggleMateria={toggleMateria}
                    onToggleMonitors={setOnlyMonitors}
                    onApply={handleSearch}
                    onClear={clearFilters}
                    loading={loading}
                    showClear={!!(search || selectedMaterias.length > 0 || onlyMonitors)}
                />
            )}

            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <UserCard user={item} />}
                contentContainerStyle={{ paddingTop: 15, paddingBottom: 30 }}
                ListEmptyComponent={!loading ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={40} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>No encontramos resultados</Text>
                    </View>
                ) : null}
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

    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
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
});