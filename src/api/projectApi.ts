import apiClient from './apiClient';
import type { ProjectDto, CreateProjectCommand, UpdateProjectCommand } from '../types/projectTypes';

const ENDPOINT_PREFIX = '/Projects'; 

export const projectApi = {
  // Obtener todos los proyectos
  getProjects: async (): Promise<ProjectDto[]> => {
    return apiClient<ProjectDto[]>(ENDPOINT_PREFIX); 
  },

  // Obtener un proyecto por ID
  getProjectById: async (id: string): Promise<ProjectDto> => {
    return apiClient<ProjectDto>(`${ENDPOINT_PREFIX}/${id}`); 
  },

  // Crear un nuevo proyecto
  createProject: async (data: CreateProjectCommand): Promise<ProjectDto> => {
    return apiClient<ProjectDto>(ENDPOINT_PREFIX, 'POST', data);
  },

  // Actualizar un proyecto existente
  updateProject: async (id: string, data: UpdateProjectCommand): Promise<ProjectDto> => {
    return apiClient<ProjectDto>(`${ENDPOINT_PREFIX}/${id}`, 'PUT', data); // Usa backticks y ${}
  },

  // Eliminar un proyecto
  deleteProject: async (id: string): Promise<void> => {
    await apiClient<void>(`${ENDPOINT_PREFIX}/${id}`, 'DELETE'); // Usa backticks y ${}
  },
};