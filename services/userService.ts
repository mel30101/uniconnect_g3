import { User } from "../types/User";

const mockUsers: User[] = [
    {
        id: "1",
        name: "Mafw",
        carrera: "Ingeniería de sistemas",
        materiasIds: ["calculo1"],
        habilidadesIds: ["java"],
        esMonitor: true,
    },
    {
    id: "2",
    name: "Laura Gómez",
    carrera: "Ingeniería Industrial",
    materiasIds: ["fisica1"],
    habilidadesIds: ["excel"],
    esMonitor: false,
  },
];

export const getUsers = async (): Promise<User[]> => {
    return mockUsers;
};