export interface ProjectDto {
  id: string; // Guid en C#
  name: string;
  description: string | null;
  startDate: string; // DateTime en C# (formato ISO 8601 string)
  endDate: string | null; // DateTime? en C#
  status: string; // string que representa el enum o el estado
}

// DTO para la creación de un nuevo proyecto 
export interface CreateProjectCommand {
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
}

// DTO para la actualización de un proyecto 
export interface UpdateProjectCommand {
  id: string; // Para identificar qué proyecto actualizar
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
}