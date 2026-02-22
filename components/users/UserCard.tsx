import { StyleSheet, Text, View } from "react-native";
import { User } from "../../types/User";

interface Props {
    user: User;
}

export default function UserCard({user}: Props) {
    return (
        <View style={styles.card}>
            <Text style={styles.name}>{user.name}</Text>
            <Text>{user.carrera}</Text>
            {user.esMonitor && <Text style={styles.monitor}>Monitor</Text>}
        </View>
    )
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