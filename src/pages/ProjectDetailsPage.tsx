import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Button, Badge, ListGroup, Modal, Stack, Dropdown } from 'react-bootstrap';
import { taskApi } from '../api/taskApi';
import { projectApi } from '../api';
import type { ProjectDto } from '../types/projectTypes';
import type { TaskItemDto, CreateTaskItemCommand, UpdateTaskItemCommand } from '../types/taskTypes';
import TaskForm from '../components/TaskForm';

function ProjectDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [project, setProject] = useState<ProjectDto | null>(null);
    const [tasks, setTasks] = useState<TaskItemDto[]>([]);
    const [loadingProject, setLoadingProject] = useState<boolean>(true);
    const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
    const [projectError, setProjectError] = useState<string | null>(null);
    const [tasksError, setTasksError] = useState<string | null>(null);

    const [showCreateTaskModal, setShowCreateTaskModal] = useState<boolean>(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState<boolean>(false);
    const [showViewTaskModal, setShowViewTaskModal] = useState<boolean>(false);
    const [selectedTask, setSelectedTask] = useState<TaskItemDto | null>(null);

    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Lista de estados de tarea enum
    const taskStatuses = ['Pending', 'InProgress', 'Completed', 'Canceled'];

    // --- useEffects para limpiar mensajes automáticamente ---
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (submissionError) {
            const timer = setTimeout(() => {
                setSubmissionError(null);
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, [submissionError]);

    // --- Fetchers ---
    const fetchProjectDetails = async () => {
        if (!id) {
            setProjectError("ID del proyecto no proporcionado en la URL.");
            setLoadingProject(false);
            return;
        }
        try {
            setLoadingProject(true);
            setProjectError(null);
            const data = await projectApi.getProjectById(id);
            setProject(data);
        } catch (e: any) {
            setProjectError(`Error al cargar el proyecto: ${e.response?.data?.message || e.message}`);
        } finally {
            setLoadingProject(false);
        }
    };

    const fetchTasks = async () => {
        if (!id) {
            setTasksError("ID del proyecto no proporcionado para cargar tareas.");
            setLoadingTasks(false);
            return;
        }
        try {
            setLoadingTasks(true);
            setTasksError(null);
            const data = await taskApi.getTasksByProjectId(id);
            setTasks(data);
        } catch (e: any) {
            setTasksError(`Error al cargar las tareas: ${e.response?.data?.message || e.message}`);
        } finally {
            setLoadingTasks(false);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    useEffect(() => {
        if (project) {
            fetchTasks();
        }
    }, [project?.id]);

    // --- Manejadores del Modal de Creación de Tarea ---
    const handleShowCreateTaskModal = () => {
        setSubmissionError(null);
        setSuccessMessage(null);
        setSelectedTask(null); // Asegurarse de que no haya tarea seleccionada para creación
        setShowCreateTaskModal(true);
    };
    const handleCloseCreateTaskModal = () => setShowCreateTaskModal(false);

    const handleCreateTask = async (formData: CreateTaskItemCommand | UpdateTaskItemCommand) => {
        const createCommand = formData as CreateTaskItemCommand;

        if (!id) {
            setSubmissionError("No se puede crear la tarea: ID de proyecto desconocido.");
            return;
        }
        setSubmissionError(null);
        setSuccessMessage(null);
        try {
            const taskWithProjectId: CreateTaskItemCommand = {
                ...createCommand,
                projectId: id // Asegura que el projectId de la URL se use
            };
            await taskApi.createTask(taskWithProjectId);
            setSuccessMessage('Tarea creada exitosamente!');
            handleCloseCreateTaskModal();
            fetchTasks();
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || 'Error desconocido al crear la tarea.';
            setSubmissionError(`Error al crear la tarea: ${errorMessage}`);
        }
    };

    // --- Manejadores para Ver Detalle de Tarea ---
    const handleShowViewTaskModal = (task: TaskItemDto) => {
        setSelectedTask(task);
        setShowViewTaskModal(true);
    };
    const handleCloseViewTaskModal = () => {
        setShowViewTaskModal(false);
        setSelectedTask(null);
    };

    // --- Manejadores para Editar Tarea ---
    const handleShowEditTaskModal = (task: TaskItemDto) => {
        // Formatear las fechas de TaskItemDto a YYYY-MM-DD para el input type="date"
        // Este formateo es para el TaskForm, que usa un input HTML type="date"
        const formattedTask: TaskItemDto = {
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            completionDate: task.completionDate ? new Date(task.completionDate).toISOString().split('T')[0] : null,
        };
        setSelectedTask(formattedTask);
        setSubmissionError(null);
        setSuccessMessage(null);
        setShowEditTaskModal(true);
    };
    const handleCloseEditTaskModal = () => {
        setShowEditTaskModal(false);
        setSelectedTask(null);
    };

    const handleUpdateTask = async (formData: CreateTaskItemCommand | UpdateTaskItemCommand) => {
        // En este punto, formData es un UpdateTaskItemCommand porque initialData está presente en TaskForm
        const updateCommand = formData as UpdateTaskItemCommand;

        if (!updateCommand.id) {
            setSubmissionError("No se puede actualizar la tarea: ID de tarea desconocido.");
            return;
        }
        setSubmissionError(null);
        setSuccessMessage(null);
        try {
            await taskApi.updateTask(updateCommand.id, updateCommand);
            setSuccessMessage('Tarea actualizada exitosamente!');
            handleCloseEditTaskModal();
            fetchTasks(); // Recargar las tareas después de actualizar
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || 'Error desconocido al actualizar la tarea.';
            setSubmissionError(`Error al actualizar la tarea: ${errorMessage}`);
        }
    };

    // --- Manejador para Cambiar Estado de Tarea ---
    const handleChangeTaskStatus = async (task: TaskItemDto, newStatus: string) => {
        if (task.status === newStatus) return; // No hacer nada si el estado es el mismo

        setSubmissionError(null);
        setSuccessMessage(null);
        try {
            // Prepara un UpdateTaskItemCommand con el nuevo estado
            const updatedCommand: UpdateTaskItemCommand = {
                id: task.id,
                projectId: task.projectId,
                title: task.title,
                description: task.description,
                // Formatear dueDate a YYYY-MM-DD
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                status: newStatus, 
                priority: task.priority,
                // Formatear completionDate a YYYY-MM-DD o null
                completionDate: task.completionDate ? new Date(task.completionDate).toISOString().split('T')[0] : null,
                assignedToUserId: task.assignedToUserId
            };

            // Llama a la API para actualizar la tarea con el comando modificado
            await taskApi.updateTask(task.id, updatedCommand);
            setSuccessMessage(`Estado de la tarea "${task.title}" actualizado a "${newStatus}"!`);
            fetchTasks(); // Recargar las tareas después de actualizar
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || 'Error desconocido al cambiar el estado de la tarea.';
            setSubmissionError(`Error al cambiar el estado de la tarea: ${errorMessage}`);
        }
    };

    // --- Manejador de Eliminación de Tareas ---
    const handleDeleteTask = async (taskId: string, taskTitle: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la tarea "${taskTitle}"?`)) {
            setSubmissionError(null);
            setSuccessMessage(null);
            try {
                await taskApi.deleteTask(taskId);
                setSuccessMessage('Tarea eliminada exitosamente!');
                fetchTasks(); // Recargar las tareas después de eliminar
            } catch (e: any) {
                const errorMessage = e.response?.data?.message || e.message || 'Error desconocido al eliminar la tarea.';
                setSubmissionError(`Error al eliminar la tarea: ${errorMessage}`);
            }
        }
    };

    if (loadingProject) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando proyecto...</span>
                </Spinner>
                <p className="mt-2">Cargando detalles del proyecto...</p>
            </Container>
        );
    }

    if (projectError) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{projectError}</Alert>
                <Button variant="secondary" onClick={() => navigate('/')}>Volver a Proyectos</Button>
            </Container>
        );
    }

    if (!project) {
        return (
            <Container className="mt-5">
                <Alert variant="info">El proyecto no fue encontrado o no existe.</Alert>
                <Button variant="secondary" onClick={() => navigate('/')}>Volver a Proyectos</Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Button variant="secondary" className="mb-3" onClick={() => navigate('/')}>
                ← Volver a Proyectos
            </Button>

            {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>{successMessage}</Alert>}
            {submissionError && <Alert variant="danger" onClose={() => setSubmissionError(null)} dismissible>{submissionError}</Alert>}

            <h1 className="mb-3">
                {project.name} <Badge bg="secondary" className="ms-2">{project.status}</Badge>
            </h1>
            <p><strong>Descripción:</strong> {project.description || 'N/A'}</p>
            <p>
                <strong>Fecha de Inicio:</strong> {new Date(project.startDate).toLocaleDateString()}
                {project.endDate && ` | `}
                {project.endDate && <strong>Fecha de Fin:</strong>} {project.endDate && new Date(project.endDate).toLocaleDateString()}
            </p>

            <hr />

            <Stack direction="horizontal" className="align-items-center mb-3">
                <h2>Tareas del Proyecto</h2>
                <Button variant="primary" className="ms-auto" onClick={handleShowCreateTaskModal}>
                    Añadir Tarea
                </Button>
            </Stack>

            {loadingTasks ? (
                <p>Cargando tareas...</p>
            ) : tasksError ? (
                <Alert variant="danger">{tasksError}</Alert>
            ) : tasks.length === 0 ? (
                <Alert variant="info">No hay tareas para este proyecto. ¡Añade una!</Alert>
            ) : (
                <ListGroup className="mt-3">
                    {tasks.map((task) => (
                        <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5>
                                    {task.title}
                                    {/* Dropdown para cambiar el estado */}
                                    <Dropdown as={Badge} className="ms-1">
                                        <Dropdown.Toggle variant={
                                            task.status === 'Completed' ? 'success' :
                                            task.status === 'InProgress' ? 'primary' :
                                            task.status === 'Canceled' ? 'danger' : 'info' // Usar 'info' para Pending
                                        } id={`dropdown-status-${task.id}`}>
                                            {task.status}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {taskStatuses.map((status) => (
                                                <Dropdown.Item
                                                    key={status}
                                                    onClick={() => handleChangeTaskStatus(task, status)}
                                                    active={task.status === status}
                                                >
                                                    {status}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </h5>
                                <p className="mb-1">{task.description || 'Sin descripción'}</p>
                                <small>
                                    Vencimiento: {new Date(task.dueDate).toLocaleDateString()}
                                    {task.assignedToUserName && ` | Asignada a: ${task.assignedToUserName}`}
                                    {task.priority && ` | Prioridad: ${task.priority}`}
                                </small>
                            </div>
                            <div>
                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowViewTaskModal(task)}>Ver Detalle Tarea</Button>
                                <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleShowEditTaskModal(task)}>Editar</Button>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteTask(task.id, task.title)}>Eliminar</Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {/* Modal para Crear Tarea */}
            <Modal show={showCreateTaskModal} onHide={handleCloseCreateTaskModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Nueva Tarea para "{project.name}"</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* initialData es null porque estamos creando */}
                    <TaskForm onSubmit={handleCreateTask} onCancel={handleCloseCreateTaskModal} initialData={null} />
                </Modal.Body>
            </Modal>

            {/* Modal para Editar Tarea */}
            <Modal show={showEditTaskModal} onHide={handleCloseEditTaskModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Tarea: "{selectedTask?.title}"</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTask && (
                        <TaskForm
                            initialData={selectedTask} // Pasamos la tarea seleccionada para poblar el formulario
                            onSubmit={handleUpdateTask}
                            onCancel={handleCloseEditTaskModal}
                        />
                    )}
                </Modal.Body>
            </Modal>

            {/* Modal para Ver Detalle de Tarea */}
            <Modal show={showViewTaskModal} onHide={handleCloseViewTaskModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de la Tarea: "{selectedTask?.title}"</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTask && (
                        <>
                            <p><strong>Proyecto:</strong> {selectedTask.projectName}</p>
                            <p><strong>Título:</strong> {selectedTask.title}</p>
                            <p><strong>Descripción:</strong> {selectedTask.description || 'N/A'}</p>
                            <p><strong>Fecha de Vencimiento:</strong> {new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                            <p><strong>Estado:</strong> <Badge bg={
                                selectedTask.status === 'Completed' ? 'success' :
                                selectedTask.status === 'InProgress' ? 'primary' :
                                selectedTask.status === 'Canceled' ? 'danger' : 'info'
                            }>{selectedTask.status}</Badge></p>
                            <p><strong>Prioridad:</strong> {selectedTask.priority}</p>
                            <p><strong>Asignada a:</strong> {selectedTask.assignedToUserName || 'N/A'}</p>
                            {selectedTask.completionDate && <p><strong>Fecha de Completado:</strong> {new Date(selectedTask.completionDate).toLocaleDateString()}</p>}
                            <p><strong>Fecha de Creación:</strong> {new Date(selectedTask.creationDate).toLocaleDateString()}</p>
                            {selectedTask.lastModifiedDate && <p><strong>Última Modificación:</strong> {new Date(selectedTask.lastModifiedDate).toLocaleDateString()}</p>}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseViewTaskModal}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ProjectDetailsPage;