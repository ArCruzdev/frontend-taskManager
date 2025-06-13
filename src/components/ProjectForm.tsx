import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import type { CreateProjectCommand, ProjectDto, UpdateProjectCommand } from '../types/projectTypes';

interface ProjectFormProps {
  initialData?: ProjectDto;
  onSubmit: (data: CreateProjectCommand | UpdateProjectCommand) => Promise<void>;
  onCancel: () => void;
}

function ProjectForm({ initialData, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState<CreateProjectCommand | UpdateProjectCommand>(() => {
    if (initialData) {
      // Si estamos en modo edición, inicializamos con los datos del proyecto
      return {
        id: initialData.id,
        name: initialData.name,
        description: initialData.description,
        startDate: new Date(initialData.startDate).toISOString().split('T')[0],
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : null,
        status: initialData.status, // Mantener el estado si se edita
      };
    }
    // Si estamos en modo creación, inicializamos con valores por defecto
    return {
      name: '',
      description: null,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value === '' ? null : value,
    }));
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData); 
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="projectName">
        <Form.Label>Nombre del Proyecto</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="projectDescription">
        <Form.Label>Descripción</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
        />
      </Form.Group>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="projectStartDate">
          <Form.Label>Fecha de Inicio</Form.Label>
          <Form.Control
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group as={Col} controlId="projectEndDate">
          <Form.Label>Fecha de Fin (Opcional)</Form.Label>
          <Form.Control
            type="date"
            name="endDate"
            value={formData.endDate || ''}
            onChange={handleChange}
          />
        </Form.Group>
      </Row>

      <div className="d-flex justify-content-end">
        <Button variant="secondary" onClick={onCancel} className="me-2">
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {initialData ? 'Actualizar Proyecto' : 'Crear Proyecto'}
        </Button>
      </div>
    </Form>
  );
}

export default ProjectForm;