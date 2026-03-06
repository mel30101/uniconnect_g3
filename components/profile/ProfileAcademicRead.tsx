import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { UCaldasTheme } from "../../app/constants/Colors";
import { profileStyles as styles } from "./ProfileStyles";

interface ProfileAcademicReadProps {
    profileData: any;
    sections: any[];
}

export function ProfileAcademicRead({
    profileData,
    sections,
}: ProfileAcademicReadProps) {
    return (
        <>

            <View style={styles.sectionCard}>
                <Text style={[styles.formTitle, { marginTop: 10 }]}>
                    Información Académica
                </Text>

                <Text style={styles.sectionLabel}>Mis Materias Actuales:</Text>
                {sections.length > 0 ? (
                    sections.map((section) => (
                        <View key={section.sectionId}>
                            {section.subjects
                                .filter((s: any) => profileData.subjects.includes(s.id))
                                .map((subject: any) => (
                                    <View key={subject.id} style={styles.subjectDisplay}>
                                        <View
                                            style={{ flexDirection: "row", alignItems: "center" }}
                                        >
                                            <Ionicons
                                                name="book-outline"
                                                size={18}
                                                color={UCaldasTheme.azulOscuro}
                                                style={{ marginRight: 10 }}
                                            />
                                            <Text style={styles.subjectText}>{subject.name}</Text>
                                        </View>
                                    </View>
                                ))}
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No hay materias seleccionadas.</Text>
                )}
            </View>
        </>
    );
}
