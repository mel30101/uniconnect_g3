import { useProfile } from '@/hooks/useProfile';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { UCaldasTheme } from '../constants/Colors';

export default function ProfileScreen() {
  const {
    user,loading,isEditing,setIsEditing,hasProfile,careers,sections,profileData,setProfileData,
    updateCareer,saveProfile
  } = useProfile();

  // Pantalla de carga con identidad visual de la Universidad
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={UCaldasTheme.dorado} />
        <Text style={styles.loadingText}>Sincronizando con la U de Caldas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {hasProfile && !isEditing ? (
        /* --- VISTA DE PERFIL (SOLO LECTURA) --- */
        <View style={styles.content}>
          <View style={styles.headerCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
            </View>
            <Text style={styles.mainTitle}>{user?.name}</Text>
            <Text style={styles.careerBadge}>
              {careers.find(c => c.id === profileData.careerId)?.name || "Carrera no asignada"}
            </Text>
            {profileData.isMonitor && (
              <View style={styles.monitorBadge}>
                <Text style={styles.monitorText}>Monitor Académico</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionLabel}>Mis Materias Actuales:</Text>
          {sections.length > 0 ? (
            sections.map(section => (
              <View key={section.sectionId}>
                {section.subjects
                  .filter(s => profileData.subjects.includes(s.id))
                  .map(subject => (
                    <View key={subject.id} style={styles.subjectDisplay}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="book-outline" size={18} color={UCaldasTheme.azulOscuro} style={{ marginRight: 10 }} />
                        <Text style={styles.subjectText}>{subject.name}</Text>
                      </View>
                    </View>
                  ))}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay materias seleccionadas.</Text>
          )}

          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Ionicons name="create-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.editButtonText}>Actualizar Datos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* --- VISTA DE FORMULARIO (EDICIÓN / REGISTRO) --- */
        <View style={styles.content}>
          <Text style={styles.formTitle}>Información Académica</Text>

          <Text style={styles.label}>Carrera Universitaria:</Text>
          <View style={styles.card}>
            <Picker
              selectedValue={profileData.careerId}
              onValueChange={(itemValue) => updateCareer(itemValue)}
            >
              <Picker.Item label="Selecciona tu carrera..." value="" />
              {careers.map(career => (
                <Picker.Item key={career.id} label={career.name} value={career.id} />
              ))}
            </Picker>
          </View>

          <View style={styles.rowCard}>
            <Text style={styles.label}>¿Eres monitor este semestre?</Text>
            <Switch
              value={profileData.isMonitor}
              onValueChange={(val) => setProfileData({ ...profileData, isMonitor: val })}
              trackColor={{ false: "#767577", true: UCaldasTheme.dorado }}
              thumbColor={profileData.isMonitor ? UCaldasTheme.azulOscuro : "#f4f3f4"}
            />
          </View>

          <Text style={styles.sectionLabel}>Selecciona tus materias:</Text>
          {sections.map(section => (
            <View key={section.sectionId} style={{ marginBottom: 15 }}>
              <Text style={styles.sectionTitle}>{section.sectionName}</Text>
              {section.subjects.map(subject => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectItem,
                    profileData.subjects.includes(subject.id) && styles.selected
                  ]}
                  onPress={() => {
                    const isSelected = profileData.subjects.includes(subject.id);
                    const newSubjects = isSelected
                      ? profileData.subjects.filter(id => id !== subject.id)
                      : [...profileData.subjects, subject.id];
                    setProfileData({ ...profileData, subjects: newSubjects });
                  }}
                >
                  <Text style={profileData.subjects.includes(subject.id) ? styles.whiteText : styles.blackText}>
                    {subject.name}
                  </Text>
                  {profileData.subjects.includes(subject.id) && (
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveText}>
              {hasProfile ? "Guardar Cambios" : "Finalizar Registro"}
            </Text>
          </TouchableOpacity>

          {hasProfile && (
            <TouchableOpacity style={styles.cancelLink} onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: UCaldasTheme.azulOscuro },
  loadingText: { color: '#fff', marginTop: 15, fontWeight: '500' },
  content: { padding: 20 },
  headerCard: { backgroundColor: '#fff', padding: 25, borderRadius: 25, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: UCaldasTheme.dorado, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 35, color: '#fff', fontWeight: 'bold' },
  mainTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 15, textAlign: 'center' },
  careerBadge: { color: UCaldasTheme.azulOscuro, marginTop: 5, fontWeight: '600', opacity: 0.8 },
  monitorBadge: { backgroundColor: UCaldasTheme.dorado, marginTop: 12, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  monitorText: { color: UCaldasTheme.blanco, fontSize: 12, fontWeight: 'bold' },
  sectionLabel: { fontSize: 17, fontWeight: 'bold', color: UCaldasTheme.azulOscuro, marginTop: 25, marginBottom: 15 },
  subjectDisplay: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 8, elevation: 1 },
  subjectText: { fontWeight: '500', color: '#374151', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 10 },
  editButton: { backgroundColor: UCaldasTheme.azulOscuro, padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  rowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 20 },
  label: { fontWeight: '600', color: '#374151' },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: UCaldasTheme.azulOscuro },
  sectionTitle: { color: UCaldasTheme.dorado, fontWeight: 'bold', fontSize: 13, marginBottom: 10, textTransform: 'uppercase' },
  subjectItem: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  selected: { backgroundColor: UCaldasTheme.azulOscuro, borderColor: UCaldasTheme.azulOscuro },
  whiteText: { color: '#fff', fontWeight: '600' },
  blackText: { color: '#374151' },
  saveButton: { backgroundColor: UCaldasTheme.dorado, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveText: { color: UCaldasTheme.azulOscuro, fontWeight: 'bold', fontSize: 16 },
  cancelLink: { marginTop: 20, alignItems: 'center' },
  cancelText: { color: '#666', fontSize: 14 }
});