const API_BASE_URL = "https://gentle-wave-0b31d0310.1.azurestaticapps.net/";

/**
 * Función genérica para realizar solicitudes HTTP.
 * @param endpoint El endpoint de la API (ej. "/projects", "/tasks/123").
 * @param method El método HTTP (GET, POST, PUT, DELETE).
 * @param data Los datos a enviar en el cuerpo de la solicitud (para POST/PUT).
 * @returns La respuesta parseada como JSON.
 * @throws Error si la respuesta HTTP no es exitosa.
 */
async function apiClient<TResponse>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  data?: any
): Promise<TResponse> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Algunas respuestas (como DELETE exitoso) pueden no tener cuerpo JSON
  if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as TResponse; // Devuelve null para respuestas vacías
  }

  return response.json() as Promise<TResponse>;
}

export default apiClient;