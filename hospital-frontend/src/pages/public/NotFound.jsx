/// Est e componente es una página de error 404 que se muestra cuando el usuario intenta acceder a una ruta que no existe en la aplicación. Se muestra un mensaje de error y un botón para volver al inicio de la aplicación.

import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Página no encontrada
        </h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Lo sentimos, la página que estás buscando no existe.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
