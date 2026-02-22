import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@apollo/client';
import { LOGOUT_MUTATION } from '../graphql/mutations';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await logoutMutation({
          variables: { token },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Pedidos Rafch</Link>
      </div>
      <ul className="navbar-menu">
        {user ? (
          <>
            <li>
              <Link to="/products">Productos</Link>
            </li>
            <li>
              <Link to="/orders">Mis Pedidos</Link>
            </li>
            {user.role === 'ADMIN' && (
              <li>
                <Link to="/admin">Admin</Link>
              </li>
            )}
            <li className="navbar-user">
              <span>Hola, {user.username}</span>
              <button onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Iniciar Sesión</Link>
            </li>
            <li>
              <Link to="/register">Registrarse</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

