import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap'; // Se eliminó Alert ya que no se usa en el JSX
import type { CreateTaskItemCommand, UpdateTaskItemCommand, TaskItemDto } from '../types/taskTypes';
import { validateTaskForm, type FormErrors } from '../utils/taskValidation'; // Importa la función de validación y el tipo de errores

/**
 * Define el estado interno del formulario de tareas.
 * Se exporta para que pueda ser utilizado por la función de validación externa.
 */
export type TaskFormInternalState = {
    projectId: string;
    title: string;
    dueDate: string;
    description: string | null;
    assignedToUserId: string | null;
    id?: string;
    status?: string;
    priority?: string;
    completionDate?: string | null;
};

/**
 * Propiedades para el componente TaskForm.
 */
interface TaskFormProps {
    onSubmit: (formData: CreateTaskItemCommand | UpdateTaskItemCommand) => void;
    onCancel: () => void;
    initialData?: TaskItemDto | null; // Datos iniciales para el modo edición
}

/**
 * Componente de formulario para crear o actualizar tareas.
 * Permite la validación en tiempo real y al enviar.
 */
function TaskForm({ onSubmit, onCancel, initialData }: TaskFormProps) {
    const isEditMode = !!initialData; // Determina si el formulario está en modo edición
    const statusOptions = ['Pending', 'InProgress', 'Completed', 'Canceled'];
    const priorityOptions = ['Low', 'Medium', 'High'];

    const [formData, setFormData] = useState<TaskFormInternalState>(
        initialData
            ? { // Inicialización para modo edición con datos existentes
                id: initialData.id,
                projectId: initialData.projectId,
                title: initialData.title,
                description: initialData.description,
                dueDate: initialData.dueDate.split('T')[0], // Formato YYYY-MM-DD
                status: initialData.status,
                priority: initialData.priority,
                completionDate: initialData.completionDate ? initialData.completionDate.split('T')[0] : null,
                assignedToUserId: initialData.assignedToUserId,
            }
            : { // Inicialización para modo creación con valores por defecto
                projectId: '', // Se espera que este valor sea proporcionado externamente
                title: '',
                description: null,
                dueDate: new Date().toISOString().split('T')[0], // Fecha actual por defecto
                assignedToUserId: null,
                id: undefined,
                status: undefined,
                priority: undefined,
                completionDate: null,
            }
    );

    // Estado para almacenar los errores de validación del formulario
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Efecto para reiniciar o cargar datos cuando `initialData` cambia
    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                projectId: initialData.projectId,
                title: initialData.title,
                description: initialData.description,
                dueDate: initialData.dueDate.split('T')[0],
                status: initialData.status,
                priority: initialData.priority,
                completionDate: initialData.completionDate ? initialData.completionDate.split('T')[0] : null,
                assignedToUserId: initialData.assignedToUserId,
            });
        } else {
            setFormData({
                projectId: '',
                title: '',
                description: null,
                dueDate: new Date().toISOString().split('T')[0],
                assignedToUserId: null,
                id: undefined,
                status: undefined,
                priority: undefined,
                completionDate: null,
            });
        }
        setFormErrors({}); // Siempre limpiar errores al cargar nuevos datos o reiniciar
    }, [initialData]);

    /**
     * Maneja los cambios en los campos del formulario, actualizando el estado y validando en tiempo real.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value === "" ? null : value, // Convierte cadenas vacías a null para campos opcionales
        };
        setFormData(newFormData);

        // Valida el formulario completo para obtener los errores actualizados
        const validationResult = validateTaskForm(newFormData, isEditMode);
        // Actualiza solo el error del campo que cambió, manteniendo los demás
        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: validationResult[name as keyof FormErrors],
        }));
    };

    /**
     * Maneja el envío del formulario, realizando una validación final antes de llamar a onSubmit.
     */
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Realiza una validación completa de todo el formulario
        const currentErrors = validateTaskForm(formData, isEditMode);
        setFormErrors(currentErrors); // Actualiza todos los errores en el estado

        // Si hay errores de validación, detiene el envío del formulario
        if (Object.keys(currentErrors).length > 0) {
            return;
        }

        // Si el formulario es válido, construye el comando adecuado y lo envía
        if (isEditMode) {
            // Aseguramos que 'id', 'status' y 'priority' estén presentes en modo edición
            const updateCommand: UpdateTaskItemCommand = {
                id: formData.id!,
                projectId: formData.projectId,
                title: formData.title,
                description: formData.description,
                dueDate: formData.dueDate,
                status: formData.status!,
                priority: formData.priority!,
                completionDate: formData.completionDate ?? null,
                assignedToUserId: formData.assignedToUserId,
            };
            onSubmit(updateCommand);
        } else {
            const createCommand: CreateTaskItemCommand = {
                projectId: formData.projectId,
                title: formData.title,
                description: formData.description,
                dueDate: formData.dueDate,
                assignedToUserId: formData.assignedToUserId,
            };
            onSubmit(createCommand);
        }
    };

    return (
        <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="taskTitle">
                <Form.Label>Título</Form.Label>
                <Form.Control
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    isInvalid={!!formErrors.title} // Marca el control como inválido si hay un error
                    required
                />
                <Form.Control.Feedback type="invalid">
                    {formErrors.title}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="taskDescription">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    isInvalid={!!formErrors.description}
                    maxLength={500}
                />
                <Form.Control.Feedback type="invalid">
                    {formErrors.description}
                </Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">
                <Col>
                    <Form.Group controlId="taskDueDate">
                        <Form.Label>Fecha de Vencimiento</Form.Label>
                        <Form.Control
                            type="date"
                            name="dueDate"
                            value={formData.dueDate || ''}
                            onChange={handleChange}
                            isInvalid={!!formErrors.dueDate}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.dueDate}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                {/* Solo muestra Status y Priority si estamos en modo edición */}
                {isEditMode && (
                    <>
                        <Col>
                            <Form.Group controlId="taskStatus">
                                <Form.Label>Estado</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status || ''}
                                    onChange={handleChange}
                                    isInvalid={!!formErrors.status}
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.status}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="taskPriority">
                                <Form.Label>Prioridad</Form.Label>
                                <Form.Select
                                    name="priority"
                                    value={formData.priority || ''}
                                    onChange={handleChange}
                                    isInvalid={!!formErrors.priority}
                                >
                                    {priorityOptions.map((priority) => (
                                        <option key={priority} value={priority}>{priority}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.priority}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </>
                )}
            </Row>

            {/* Campo para asignar usuario */}
            <Form.Group className="mb-3" controlId="taskAssignedTo">
                <Form.Label>Asignar a Usuario (ID)</Form.Label>
                <Form.Control
                    type="text"
                    name="assignedToUserId"
                    value={formData.assignedToUserId || ''}
                    onChange={handleChange}
                    placeholder="ID del usuario (opcional)"
                    isInvalid={!!formErrors.assignedToUserId}
                />
                <Form.Control.Feedback type="invalid">
                    {formErrors.assignedToUserId}
                </Form.Control.Feedback>
            </Form.Group>

            {/* Campo para Fecha de Completado (solo en modo edición) */}
            {isEditMode && (
                <Form.Group className="mb-3" controlId="taskCompletionDate">
                    <Form.Label>Fecha de Completado</Form.Label>
                    <Form.Control
                        type="date"
                        name="completionDate"
                        value={formData.completionDate || ''}
                        onChange={handleChange}
                    />
                </Form.Group>
            )}

            <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={onCancel} className="me-2">
                    Cancelar
                </Button>
                <Button variant="primary" type="submit">
                    {isEditMode ? 'Actualizar Tarea' : 'Crear Tarea'}
                </Button>
            </div>
        </Form>
    );
}

export default TaskForm;