import { searchStudents } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
    Animated,
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import UserCard from "../../components/users/UserCard";
import { User } from "../../types/User";

export default function SearchScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedMateria, setSelectedMateria] = useState<string | null>(null);
  const [onlyMonitors, setOnlyMonitors] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

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

      <View style={styles.monitorContainer}>
        <Text style={styles.sectionTitle}>Solo monitores</Text>
        <Switch
          value={onlyMonitors}
          onValueChange={setOnlyMonitors}
        />
      </View>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => {
            animatePress();
            fetchStudents();
          }}
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>
            {loading ? "Buscando..." : "Buscar"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity onPress={clearFilters}>
        <Text style={styles.clearText}>Limpiar filtros</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserCard user={item} />}
        contentContainerStyle={{ paddingTop: 15 }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              No se encontraron resultados
            </Text>
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
});