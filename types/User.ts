export interface User {
    id: string;
    name: string;
    carrera: string;
    materiasIds: string[];
    habilidadesIds: string[];
    esMonitor: boolean;
}