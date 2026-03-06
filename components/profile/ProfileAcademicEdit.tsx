import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Collapsible } from "../Collapsible";
import { UCaldasTheme } from "../../app/constants/Colors";
import { profileStyles as styles } from "./ProfileStyles";

interface ProfileAcademicEditProps {
    profileData: any;
    setProfileData: (data: any) => void;
    careers: any[];
    updateCareer: (id: string) => void;
    sections: any[];
}

export function ProfileAcademicEdit({
    profileData,
    setProfileData,
    careers,
    updateCareer,
    sections,
}: ProfileAcademicEditProps) {
    const selectedCareer = careers.find(c => c.id === profileData.careerId);

    return (
        <>
            <View style={styles.card}>
                <Collapsible title={selectedCareer?.name || "Selecciona tu carrera..."}>
                    <View style={{ paddingVertical: 10 }}>
                        {careers.map((career) => (
                            <TouchableOpacity
                                key={career.id}
                                style={[
                                    styles.subjectItem,
                                    profileData.careerId === career.id && styles.selected,
                                ]}
                                onPress={() => updateCareer(career.id)}
                            >
                                <Text
                                    style={
                                        profileData.careerId === career.id
                                            ? styles.whiteText
                                            : styles.blackText
                                    }
                                >
                                    {career.name}
                                </Text>
                                {profileData.careerId === career.id && (
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Collapsible>
            </View>

            <Text style={styles.sectionLabel}>Selecciona tus materias:</Text>
            {sections.map((section) => (
                <View key={section.sectionId} style={{ marginBottom: 10 }}>
                    <Collapsible title={section.sectionName}>
                        <View style={{ paddingVertical: 10 }}>
                            {section.subjects.map((subject: any) => (
                                <TouchableOpacity
                                    key={subject.id}
                                    style={[
                                        styles.subjectItem,
                                        profileData.subjects.includes(subject.id) && styles.selected,
                                    ]}
                                    onPress={() => {
                                        const isSelected = profileData.subjects.includes(subject.id);
                                        const newSubjects = isSelected
                                            ? profileData.subjects.filter((id: string) => id !== subject.id)
                                            : [...profileData.subjects, subject.id];
                                        setProfileData({
                                            ...profileData,
                                            subjects: newSubjects,
                                        });
                                    }}
                                >
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Text
                                            style={[
                                                styles.subjectText,
                                                profileData.subjects.includes(subject.id) && { color: '#fff' }
                                            ]}
                                        >
                                            {subject.name}
                                        </Text>
                                    </View>
                                    {profileData.subjects.includes(subject.id) && (
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Collapsible>
                </View>
            ))}
        </>
    );
}
