import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage'; 

import 'bootstrap/dist/css/bootstrap.min.css'; // Importa el CSS de Bootstrap para los estilos

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          {/* Enlace al home/página de proyectos */}
          <Link className="navbar-brand" to="/">TaskManager</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                {/* Enlace a la página de proyectos */}
                <Link className="nav-link" to="/">Proyectos</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Definición de las rutas de la aplicación */}
      <Routes>
        {/* Ruta para la página principal de proyectos */}
        <Route path="/" element={<ProjectsPage />} />
        {/* Ruta para la página de detalles de un proyecto específico
            :id es un parámetro de URL que capturaremos en ProjectDetailsPage */}
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
        {/* Opcional: Ruta comodín para manejar URLs no encontradas */}
        {/* <Route path="*" element={<div><h1>404</h1><p>Página no encontrada</p></div>} /> */}
      </Routes>
    </Router>
  );
}

export default App;