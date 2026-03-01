import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator, Alert,
  Image,
  Platform,
  ScrollView, StyleSheet, Switch,
  Text, TouchableOpacity, View
} from 'react-native';
import { UCaldasTheme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

interface Subject { id: string; name: string; credits: number; }
interface Section { sectionId: string; sectionName: string; subjects: Subject[]; }
interface Career { id: string; name: string; }

export default function ProfileScreen() {
  const { user } = useAuth();
  const studentId = user?.uid;
  const userName = user?.name;
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isMonitor, setIsMonitor] = useState(false);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (studentId) loadInitialData();
  }, [studentId]);

  useEffect(() => {
    if (selectedCareer) fetchCareerStructure(selectedCareer);
  }, [selectedCareer]);

  // Mejora de carga: Cargar todo en paralelo para ganar velocidad
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [careersRes, profileRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/careers`),
        fetch(`${BACKEND_URL}/api/academic-profile/${studentId}`)
      ]);

      const careersData = await careersRes.json();
      setCareers(careersData);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData) {
          setSelectedCareer(profileData.careerId);
          setSelectedSubjects(profileData.subjects || []);
          setIsMonitor(profileData.isMonitor || false);
          setHasProfile(true);
        }
      }
    } catch (e) {
      console.error("Error cargando datos:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareerStructure = async (careerId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/career-structure/${careerId}`);
      const data = await response.json();
      setSections(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Selector específico para iOS (ActionSheet)
  const showCareerPickerIOS = () => {
    const options = ['Cancelar', ...careers.map(c => c.name)];
    ActionSheetIOS.showActionSheetWithOptions(
      { options, cancelButtonIndex: 0, title: 'Selecciona tu Carrera' },
      (buttonIndex) => {
        if (buttonIndex !== 0) {
          setSelectedCareer(careers[buttonIndex - 1].id);
        }
      }
    );
  };

  const saveProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/academic-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, careerId: selectedCareer, subjects: selectedSubjects, isMonitor })
      });
      if (response.ok) {
        Alert.alert("¡Éxito!", "Perfil actualizado correctamente");
        setHasProfile(true);
        setIsEditing(false);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  // Pantalla de carga Institucional (Mejora la percepción de velocidad)
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image 
          source={{ uri: 'https://www.ucaldas.edu.co/portal/wp-content/uploads/2020/05/logo_ucaldas_blanco.png' }} 
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={UCaldasTheme.dorado} />
        <Text style={styles.loadingText}>Sincronizando con la U de Caldas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {hasProfile && !isEditing ? (
        /* --- VISTA DE PERFIL --- */
        <View style={styles.content}>
          <View style={styles.headerCard}>
            <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{userName?.charAt(0)}</Text>
            </View>
            <Text style={styles.mainTitle}>{userName}</Text>
            <Text style={styles.careerBadge}>
                {careers.find(c => c.id === selectedCareer)?.name || "Carrera"}
            </Text>
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="book-outline" size={18} color={UCaldasTheme.azulOscuro} style={{ marginRight: 10 }} />
                    <Text style={styles.subjectText}>{subject.name}</Text>
                </View>
              </View>
            ))
          ))}

          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Ionicons name="create-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.editButtonText}>Actualizar Datos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* --- VISTA DE FORMULARIO --- */
        <View style={styles.content}>
          <Text style={styles.formTitle}>Información Académica</Text>
          
          <Text style={styles.label}>Carrera Universitaria:</Text>
          {Platform.OS === 'ios' ? (
            <TouchableOpacity 
              style={[styles.iosPickerBtn, hasProfile && styles.disabledCard]} 
              onPress={showCareerPickerIOS}
              disabled={hasProfile}
            >
              <Text style={{ color: selectedCareer ? '#000' : UCaldasTheme.grisClaro }}>
                {careers.find(c => c.id === selectedCareer)?.name || "Selecciona tu carrera..."}
              </Text>
              <Ionicons name="chevron-down" size={20} color={UCaldasTheme.azulOscuro} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.card, hasProfile && styles.disabledCard]}>
              <Picker
                enabled={!hasProfile}
                selectedValue={selectedCareer}
                onValueChange={(v) => setSelectedCareer(v)}
              >
                <Picker.Item label="Selecciona carrera..." value="" />
                {careers.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
              </Picker>
            </View>
          )}

          <View style={styles.rowCard}>
            <Text style={styles.label}>¿Eres monitor este semestre?</Text>
            <Switch 
                value={isMonitor} 
                onValueChange={setIsMonitor} 
                trackColor={{ false: "#767577", true: UCaldasTheme.dorado }}
                thumbColor={isMonitor ? UCaldasTheme.azulOscuro : "#f4f3f4"}
            />
          </View>

          <Text style={styles.sectionLabel}>Selecciona tus materias:</Text>
          {sections.map(section => (
            <View key={section.sectionId} style={{ marginBottom: 15 }}>
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
                  {selectedSubjects.includes(subject.id) && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveText}>{hasProfile ? "Guardar Cambios" : "Finalizar Registro"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: UCaldasTheme.azulOscuro },
  loadingLogo: { width: 100, height: 100, marginBottom: 20 },
  loadingText: { color: '#fff', marginTop: 15, fontWeight: '500' },
  customHeader: {
    backgroundColor: UCaldasTheme.azulOscuro,
    height: 130,
    paddingTop: 60,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomRightRadius: 30,
  },
  headerLogo: { width: 35, height: 35, marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  headerCard: { backgroundColor: '#fff', padding: 25, borderRadius: 25, alignItems: 'center', marginTop: -30, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: UCaldasTheme.dorado, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 35, color: '#fff', fontWeight: 'bold' },
  mainTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 15, textAlign: 'center' },
  careerBadge: { color: UCaldasTheme.azulOscuro, marginTop: 5, fontWeight: '600', opacity: 0.8 },
  monitorBadge: { backgroundColor: UCaldasTheme.azulOscuro, marginTop: 12, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  monitorText: { color: UCaldasTheme.blanco, fontSize: 12, fontWeight: 'bold' },
  sectionLabel: { fontSize: 17, fontWeight: 'bold', color: UCaldasTheme.azulOscuro, marginTop: 25, marginBottom: 15 },
  subjectDisplay: { backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 10, elevation: 2 },
  subjectText: { fontWeight: '500', color: '#374151', fontSize: 15 },
  editButton: { backgroundColor: UCaldasTheme.azulOscuro, padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  iosPickerBtn: { backgroundColor: '#fff', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  disabledCard: { backgroundColor: '#f0f0f0', opacity: 0.6 },
  rowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 20, elevation: 1 },
  label: { fontWeight: '600', color: '#374151', marginBottom: 8 },
  sectionTitle: { color: UCaldasTheme.dorado, fontWeight: 'bold', fontSize: 14, marginBottom: 10, textTransform: 'uppercase' },
  subjectItem: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  selected: { backgroundColor: UCaldasTheme.azulOscuro },
  whiteText: { color: '#fff', fontWeight: '600' },
  blackText: { color: '#374151' },
  saveButton: { backgroundColor: UCaldasTheme.dorado, padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  saveText: { color: UCaldasTheme.azulOscuro, fontWeight: 'bold', fontSize: 17 },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: UCaldasTheme.azulOscuro }
});