import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { REGISTER_MUTATION, REGISTER_ADMIN_MUTATION } from '../graphql/mutations';
import './Auth.css';

const Register = () => {
  const { isAdmin: currentUserIsAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [registerAdminMutation] = useMutation(REGISTER_ADMIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      if (isAdmin) {
        if (!adminToken) {
          setError('Token de administrador requerido');
          setLoading(false);
          return;
        }
        await registerAdminMutation({
          variables: { username, password, adminToken },
        });
      } else {
        await registerMutation({
          variables: { username, password },
        });
      }

      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Registrarse</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Ingresa tu usuario"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirma tu contraseña"
            />
          </div>
          {currentUserIsAdmin && (
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                Registrar como Administrador
              </label>
            </div>
          )}
          {isAdmin && currentUserIsAdmin && (
            <div className="form-group">
              <label htmlFor="adminToken">Token de Administrador</label>
              <input
                type="text"
                id="adminToken"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Ingresa el token de admin"
              />
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        {!isAdmin && !currentUserIsAdmin && (
          <p className="auth-link">
            ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
          </p>
        )}

      </div>
    </div>
  );
};

export default Register;

