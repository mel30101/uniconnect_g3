import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface Subject { id: string; name: string; credits: number; }
interface Section { sectionId: string; sectionName: string; subjects: Subject[]; }
interface Career { id: string; name: string; }

export default function ProfileScreen() {
  const { user } = useAuth();
  const studentId = user?.uid; // <--- AQUÍ YA NO SERÁ UNDEFINED
  const userName = user?.name;
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // Datos del Perfil
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isMonitor, setIsMonitor] = useState(false);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (studentId) {
      checkExistingProfile();
      fetchCareers();
    }
  }, [studentId]);

  useEffect(() => {
    if (selectedCareer) fetchCareerStructure(selectedCareer);
  }, [selectedCareer]);

  // 1. Verificar si el usuario ya tiene perfil
  const checkExistingProfile = async () => {
    console.log("Consultando perfil para ID:", studentId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/academic-profile/${studentId}`);
      console.log("Status de respuesta:", response.status);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSelectedCareer(data.careerId);
          setSelectedSubjects(data.subjects || []);
          setIsMonitor(data.isMonitor || false);
          setHasProfile(true);
        }
      }
    } catch (e) {
      console.log("Aún no hay perfil creado");
    } finally {
      setLoading(false);
    }
  };

  const fetchCareers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/careers`);
      const data = await response.json();
      setCareers(data);
      
      // Una vez cargadas las carreras, intentamos cargar el perfil
      // para que los nombres coincidan de inmediato
      await checkExistingProfile(); 
    } catch (e) {
      console.error("Error cargando carreras:", e);
    }
  };

  const fetchCareerStructure = async (careerId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/career-structure/${careerId}`);
      const data = await response.json();
      setSections(data);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/academic-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, careerId: selectedCareer, subjects: selectedSubjects, isMonitor })
      });
      if (response.ok) {
        Alert.alert("¡Éxito!", "Perfil actualizado");
        setHasProfile(true);
        setIsEditing(false);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar");
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#1a73e8" style={{ flex: 1 }} />;

  // --- VISTA DE PERFIL GUARDADO ---
  if (hasProfile && !isEditing) {
    const careerName = careers.find(c => c.id === selectedCareer)?.name || "Cargando...";
    
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerCard}>
          <Ionicons name="school" size={50} color="#1a73e8" />
          <Text style={styles.mainTitle}>{userName}</Text>
          <Text style={styles.careerBadge}>{careerName}</Text>
          {isMonitor && (
            <View style={styles.monitorBadge}>
              <Text style={styles.monitorText}>Monitor Académico</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>Mis Materias Actuales:</Text>
        {sections.map(section => (
          section.subjects.filter(s => selectedSubjects.includes(s.id)).map(subject => (
            <View key={subject.id} style={styles.subjectDisplay}>
              <Text style={styles.subjectText}>{subject.name}</Text>
              <Text style={styles.subjectId}>{subject.id}</Text>
            </View>
          ))
        ))}

        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.editButtonText}>Actualizar Materias / Monitoría</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // --- VISTA DE FORMULARIO (NUEVO O EDITANDO) ---
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.formTitle}>{hasProfile ? "Actualizar mi semestre" : "Configura tu perfil"}</Text>
      
      {/* Carrera Bloqueada si ya tiene perfil */}
      <View style={[styles.card, hasProfile && styles.disabledCard]}>
        <Text style={styles.label}>Carrera:</Text>
        <Picker
          enabled={!hasProfile}
          selectedValue={selectedCareer}
          onValueChange={(v) => setSelectedCareer(v)}
        >
          <Picker.Item label="Selecciona carrera..." value="" />
          {careers.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
        </Picker>
      </View>

      <View style={styles.rowCard}>
        <Text style={styles.label}>¿Eres monitor este semestre?</Text>
        <Switch value={isMonitor} onValueChange={setIsMonitor} />
      </View>

      <Text style={styles.sectionLabel}>Selecciona tus materias:</Text>
      {sections.map(section => (
        <View key={section.sectionId}>
          <Text style={styles.sectionTitle}>{section.sectionName}</Text>
          {section.subjects.map(subject => (
            <TouchableOpacity 
              key={subject.id} 
              style={[styles.subjectItem, selectedSubjects.includes(subject.id) && styles.selected]}
              onPress={() => {
                const newSelection = selectedSubjects.includes(subject.id) 
                  ? selectedSubjects.filter(id => id !== subject.id)
                  : [...selectedSubjects, subject.id];
                setSelectedSubjects(newSelection);
              }}
            >
              <Text style={selectedSubjects.includes(subject.id) ? styles.whiteText : styles.blackText}>{subject.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveText}>{hasProfile ? "Guardar Cambios" : "Crear Perfil"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
  headerCard: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 20, elevation: 4 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  careerBadge: { backgroundColor: '#e8f0fe', color: '#1a73e8', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10, marginTop: 5, fontWeight: '600' },
  monitorBadge: { backgroundColor: '#34a853', marginTop: 10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  monitorText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#5f6368', marginVertical: 15 },
  subjectDisplay: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectText: { fontWeight: '500', color: '#3c4043' },
  subjectId: { fontSize: 10, color: '#9aa0a6' },
  editButton: { backgroundColor: '#1a73e8', padding: 18, borderRadius: 15, alignItems: 'center', marginVertical: 30 },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 5, marginBottom: 15 },
  disabledCard: { backgroundColor: '#e9e9e9', opacity: 0.7 },
  rowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20 },
  label: { fontWeight: 'bold' },
  sectionTitle: { color: '#1a73e8', fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  subjectItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 8 },
  selected: { backgroundColor: '#1a73e8' },
  whiteText: { color: '#fff' },
  blackText: { color: '#000' },
  saveButton: { backgroundColor: '#1e8e3e', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 50 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  formTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1a73e8' }
});