import { useSearchStudents } from "@/hooks/useSearchStudents";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FilterSection } from "../../components/search/FilterSection";
import UserCard from "../../components/users/UserCard";
import { UCaldasTheme } from "../constants/Colors";

export default function SearchScreen() {
    const user = useAuthStore((state) => state.user);

    const { users, sections, loading, performSearch, resetResults, hasCareer } = useSearchStudents(
        user?.uid,
        user?.careerId
    );

    const [search, setSearch] = useState("");
    const [selectedMaterias, setSelectedMaterias] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false); // Empezamos con filtros cerrados para ver resultados generales

    const handleSearch = () => {
        setShowFilters(false);
        performSearch(search, selectedMaterias);
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedMaterias([]);
        resetResults();
        setShowFilters(true);
    };

    const toggleMateria = (id: string) => {
        setSelectedMaterias(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
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
                        placeholderTextColor="#9ca3af"
                        onSubmitEditing={handleSearch}
                        style={styles.input}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" style={{ marginRight: 5 }} />
                        </TouchableOpacity>
                    )}
                </View>

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

            {showFilters && (
                <FilterSection
                    sections={sections}
                    selectedMaterias={selectedMaterias}
                    onToggleMateria={toggleMateria}
                    onApply={handleSearch}
                    onClear={clearFilters}
                    loading={loading}
                    showClear={!!(search || selectedMaterias.length > 0)}
                />
            )}

            <FlatList
                data={users}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => <UserCard user={item} />}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 30 }}
                ListEmptyComponent={!loading ? (
                    <View style={styles.emptyContainer}>
                        {/* Cambiamos el icono y texto para que sea una invitación en lugar de "sin resultados" */}
                        <Ionicons name="search-circle-outline" size={80} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Encuentra compañeros</Text>
                        <Text style={styles.emptySubtitle}>
                            Usa la barra de búsqueda o los filtros para empezar.
                        </Text>
                    </View>
                ) : (
                    <View style={{ marginTop: 20 }}>
                        <ActivityIndicator size="large" color={UCaldasTheme.azulOscuro} />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#f4f6f8" },
    topRow: { flexDirection: "row", alignItems: "center", marginBottom: 15, gap: 12, marginTop: 40 },
    searchContainer: {
        flex: 1, flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, height: 50, elevation: 2,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3
    },
    filterIconBtn: {
        backgroundColor: "#fff", width: 50, height: 50,
        borderRadius: 12, justifyContent: "center", alignItems: "center", elevation: 2
    },
    filterIconBtnActive: { backgroundColor: UCaldasTheme.azulOscuro },
    input: { flex: 1, marginLeft: 8, fontSize: 16, color: "#1f2937" },
    emptyContainer: { alignItems: "center", marginTop: 60, paddingHorizontal: 20 },
    emptyTitle: { fontSize: 18, fontWeight: "bold", marginTop: 15, color: "#374151" },
    emptySubtitle: { fontSize: 14, color: "#6b7280", marginTop: 5, textAlign: "center" },
});