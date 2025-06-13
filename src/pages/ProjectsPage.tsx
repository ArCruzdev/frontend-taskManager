import { Container, Button, ListGroup, Badge, Modal, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../api';
import type { ProjectDto, CreateProjectCommand, UpdateProjectCommand } from '../types/projectTypes';
import ProjectForm from '../components/ProjectForm';

function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal, ] = useState<boolean>(false);
    const [selectedProject, setSelectedProject] = useState<ProjectDto | null>(null);

    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const navigate = useNavigate();

    // Función para cargar los proyectos desde la API
    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectApi.getProjects();
            setProjects(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Carga inicial de proyectos al montar el componente
    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null); // Limpia el mensaje de éxito después de X segundos
            }, 5000); 

            return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta o el mensaje cambia
        }
    }, [successMessage]); // Este efecto se ejecuta cada vez que successMessage cambia

    useEffect(() => {
        if (submissionError) {
            const timer = setTimeout(() => {
                setSubmissionError(null); // Limpia el mensaje de error después de X segundos
            }, 7000); 

            return () => clearTimeout(timer); // Limpia el temporizador
        }
    }, [submissionError]); 
    // Manejadores del Modal de Creación
    const handleShowCreateModal = () => {
        setSubmissionError(null);
        setSuccessMessage(null);
        setShowCreateModal(true);
    };
    const handleCloseCreateModal = () => setShowCreateModal(false);

    const handleCreateProject = async (formData: CreateProjectCommand | UpdateProjectCommand) => {
        setSubmissionError(null);
        setSuccessMessage(null);
        try {
            if (!('id' in formData)) {
                await projectApi.createProject(formData as CreateProjectCommand);
                setSuccessMessage('Proyecto creado exitosamente!');
                handleCloseCreateModal();
                fetchProjects();
            } else {
                console.error("Error: Intentando crear un proyecto con datos de actualización.");
                setSubmissionError("Error interno: Tipo de datos incorrecto para la creación.");
            }
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || 'Error desconocido al crear el proyecto.';
            setSubmissionError(`Error al crear el proyecto: ${errorMessage}`);
        }
    };

    // Manejadores del Modal de Edición
    const handleShowEditModal = (project: ProjectDto) => {
        setSelectedProject(project);
        setSubmissionError(null);
        setSuccessMessage(null);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedProject(null);
    };

    const handleUpdateProject = async (formData: CreateProjectCommand | UpdateProjectCommand) => {
        setSubmissionError(null);
        setSuccessMessage(null);
        try {
            if ('id' in formData) {
                await projectApi.updateProject(formData.id, formData as UpdateProjectCommand);
                setSuccessMessage('Proyecto actualizado exitosamente!');
                handleCloseEditModal();
                fetchProjects();
            } else {
                console.error("Error: Intentando actualizar un proyecto sin un ID.");
                setSubmissionError("Error interno: Tipo de datos incorrecto para la actualización.");
            }
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || 'Error desconocido al actualizar el proyecto.';
            setSubmissionError(`Error al actualizar el proyecto: ${errorMessage}`);
        }
    };

    // Manejador de Eliminación de Proyectos
    const handleDeleteProject = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${name}"? Esta acción no se puede deshacer.`)) {
            setSubmissionError(null);
            setSuccessMessage(null);
            try {
                await projectApi.deleteProject(id);
                setSuccessMessage('Proyecto eliminado exitosamente!');
                fetchProjects();
            } catch (e: any) {
                const errorMessage = e.response?.data?.message || e.message || 'Error desconocido al eliminar el proyecto.';
                setSubmissionError(`Error al eliminar el proyecto: ${errorMessage}`);
            }
        }
    };

    // Renderizado Condicional: Carga, Error, Lista
    if (loading) {
        return <Container className="mt-4">Cargando proyectos...</Container>;
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">Error al cargar proyectos: {error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Gestión de Proyectos</h1>

            {/* Los mensajes de alerta se renderizan condicionalmente */}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {submissionError && <Alert variant="danger">{submissionError}</Alert>}

            <Button variant="primary" className="mb-3" onClick={handleShowCreateModal}>
                Crear Nuevo Proyecto
            </Button>

            {projects.length === 0 ? (
                <p>No hay proyectos disponibles. ¡Crea uno nuevo!</p>
            ) : (
                <ListGroup>
                    {projects.map((project) => (
                        <ListGroup.Item key={project.id} className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5>{project.name} <Badge bg="secondary" className="ms-2">{project.status}</Badge></h5>
                                <p className="mb-1">{project.description || 'Sin descripción'}</p>
                                <small>Inicio: {new Date(project.startDate).toLocaleDateString()}
                                    {project.endDate && ` | Fin: ${new Date(project.endDate).toLocaleDateString()}`}
                                </small>
                            </div>
                            <div>
                                <Button
                                    variant="info"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    Ver
                                </Button>
                                <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEditModal(project)}>
                                    Editar
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteProject(project.id, project.name)}>
                                    Eliminar
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {/* Modales */}
            <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Nuevo Proyecto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ProjectForm onSubmit={handleCreateProject} onCancel={handleCloseCreateModal} />
                </Modal.Body>
            </Modal>

            <Modal show={showEditModal} onHide={handleCloseEditModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Proyecto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProject && (
                        <ProjectForm
                            initialData={selectedProject}
                            onSubmit={handleUpdateProject}
                            onCancel={handleCloseEditModal}
                        />
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default ProjectsPage;