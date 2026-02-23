import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function UserCard({ user }: { user: any }) {
    const router = useRouter();
    return (
        <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push(`../user/${user.id}`)}
        >
            <Text style={styles.name}>{user.name}</Text>
            {/* Otros datos rápidos del usuario */}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
        elevation: 3,
    },
    name: {
        fontWeight: "bold",
        fontSize: 16,
    },
    monitor: {
        color: "green",
        fontWeight: "bold",
    } ,

});