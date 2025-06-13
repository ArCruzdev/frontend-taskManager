export interface CreateTaskItemCommand {
    projectId: string;
    title: string;
    description: string | null;
    dueDate: string; // YYYY-MM-DD
    assignedToUserId: string | null;
    priority?: string; // 'Low', 'Medium', 'High'
    status?: string; // 'Pending', 'InProgress', 'Completed', 'Canceled'
}

export interface UpdateTaskItemCommand {
    id: string;
    projectId: string;
    title: string;
    description: string | null;
    dueDate: string; // YYYY-MM-DD
    status: string; // 'Pending', 'InProgress', 'Completed', 'Canceled'
    priority: string; // 'Low', 'Medium', 'High'
    completionDate: string | null; // YYYY-MM-DD o null
    assignedToUserId: string | null;
}

export interface TaskItemDto {
    id: string;
    projectId: string;
    projectName: string; // Nombre del proyecto asociado, útil para visualización
    title: string;
    description: string | null;
    dueDate: string; // Cadena ISO 8601 (ej. "2025-12-31T00:00:00Z")
    status: string; // 'Pending', 'InProgress', 'Completed', 'Canceled'
    priority: string; // 'Low', 'Medium', 'High'
    completionDate: string | null; // Cadena ISO 8601 o null
    assignedToUserId: string | null;
    assignedToUserName: string | null; // Nombre del usuario asignado
    creationDate: string; // Cadena ISO 8601
    lastModifiedDate: string; // Cadena ISO 8601
}