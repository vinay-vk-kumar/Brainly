import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('Authorization');
    return token ? <>{children}</> : <Navigate to="/signin" replace />;
};

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('Authorization');
    const role = localStorage.getItem('role');
    if (!token) return <Navigate to="/signin" replace />;
    if (role !== 'admin') return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
};
