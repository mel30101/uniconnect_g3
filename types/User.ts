export interface User {
    uid: string;         // ID de Google/Firestore
    name: string;        // Nombre completo
    email: string;       // Correo @ucaldas
    photo?: string;      // URL de la foto
    
    // Datos del Perfil Académico
    careerId?: string;   
    subjects?: string[]; 
    isMonitor?: boolean; 
}