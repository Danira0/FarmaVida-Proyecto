import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Auth/auth.jsx';

function ProtectedRoute() {
    const { loading, isAuthenticated } = useAuth();
    console.log('Loading:', loading, 'Authenticated:', isAuthenticated);

    if (loading) return <h1>Cargando...</h1>;

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}

export default ProtectedRoute;
