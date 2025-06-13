import apiClient from './apiClient';
import type {
    TaskItemDto,
    CreateTaskItemCommand,
    UpdateTaskItemCommand,
} from '../types/taskTypes';


//const API_BASE_URL = 'http://localhost:8080/api'; 
const TASKS_CONTROLLER_ENDPOINT = '/TaskItems';
const TASKS_BY_PROJECT_ENDPOINT = '/TaskItems/project'; 

export const taskApi = {
    
    getTasksByProjectId: async (projectId: string): Promise<TaskItemDto[]> => {
       
        return apiClient<TaskItemDto[]>(`${TASKS_BY_PROJECT_ENDPOINT}/${projectId}`, 'GET');
    },

    
    getTaskById: async (taskId: string): Promise<TaskItemDto> => {
        return apiClient<TaskItemDto>(`${TASKS_CONTROLLER_ENDPOINT}/${taskId}`, 'GET');
    },

   
    createTask: async (command: CreateTaskItemCommand): Promise<TaskItemDto> => {
       
        return apiClient<TaskItemDto>(TASKS_CONTROLLER_ENDPOINT, 'POST', command);
    },

    
    updateTask: async (taskId: string, command: UpdateTaskItemCommand): Promise<TaskItemDto> => {
        
        return apiClient<TaskItemDto>(`${TASKS_CONTROLLER_ENDPOINT}/${taskId}`, 'PUT', command);
    },

   
    deleteTask: async (taskId: string): Promise<void> => {
        await apiClient<void>(`${TASKS_CONTROLLER_ENDPOINT}/${taskId}`, 'DELETE');
    },

   
    changeTaskStatus: async (currentTask: TaskItemDto, newStatus: string): Promise<TaskItemDto> => {
        const updatedCommand: UpdateTaskItemCommand = {
            ...currentTask, // Copia todos los campos existentes
            status: newStatus, // Actualiza solo el estado
        };
        
        return taskApi.updateTask(currentTask.id, updatedCommand);
    },

   
    assignTask: async (currentTask: TaskItemDto, userId: string | null): Promise<TaskItemDto> => {
        const updatedCommand: UpdateTaskItemCommand = {
            ...currentTask, 
            assignedToUserId: userId, 
        };
       
        return taskApi.updateTask(currentTask.id, updatedCommand);
    },
};