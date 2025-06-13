// src/utils/taskValidation.ts

import type { TaskFormInternalState } from '../components/TaskForm'; // Importa el tipo desde el componente

/**
 * Define la estructura de los errores de validación para el formulario de tareas.
 */
export type FormErrors = {
    title?: string;
    dueDate?: string;
    description?: string;
    assignedToUserId?: string;
    status?: string;
    priority?: string;
};

/**
 * Valida los datos de un formulario de tarea.
 * @param formData El objeto con los datos actuales del formulario.
 * @param isEditMode Un booleano que indica si el formulario está en modo edición.
 * @returns Un objeto `FormErrors` con los mensajes de error, si los hay.
 */
export const validateTaskForm = (formData: TaskFormInternalState, isEditMode: boolean): FormErrors => {
    const errors: FormErrors = {};

    // Validar Título
    if (!formData.title || formData.title.trim() === '') {
        errors.title = 'El título no puede estar vacío.';
    } else {
        const titleRegex = /^[a-zA-Z0-9\s.,;:_!?()&'-]*$/;
        if (!titleRegex.test(formData.title)) {
            errors.title = 'El título solo puede contener letras, números, espacios y símbolos como . , ; : _ ! ? ( ) & \' -.';
        } else if (formData.title.length > 100) {
            errors.title = 'El título no puede exceder los 100 caracteres.';
        }
    }

    // Validar Fecha de Vencimiento
    const today = new Date().toISOString().split('T')[0];
    if (!formData.dueDate) {
        errors.dueDate = 'La fecha de vencimiento es requerida.';
    } else if (formData.dueDate < today) {
        errors.dueDate = 'La fecha de vencimiento no puede ser anterior a hoy.';
    }

    // Validar Descripción (si aplica)
    if (formData.description && formData.description.length > 500) {
        errors.description = 'La descripción no puede exceder los 500 caracteres.';
    }

    // Validar AssignedToUserId (si no es nulo y debe ser GUID)
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (formData.assignedToUserId && !guidRegex.test(formData.assignedToUserId)) {
        errors.assignedToUserId = 'El ID de usuario asignado debe ser un formato GUID válido.';
    }

    // Validar Status y Priority si estamos en modo edición
    if (isEditMode) {
        const statusOptions = ['Pending', 'InProgress', 'Completed', 'Canceled'];
        const priorityOptions = ['Low', 'Medium', 'High'];

        if (!formData.status || !statusOptions.includes(formData.status)) {
            errors.status = 'Estado inválido.';
        }
        if (!formData.priority || !priorityOptions.includes(formData.priority)) {
            errors.priority = 'Prioridad inválida.';
        }
    }

    return errors;
};