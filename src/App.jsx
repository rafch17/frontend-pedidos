import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Bienvenido a PedidosRafch</h1>
        <p>Una aplicación de gestión de pedidos con GraphQL</p>
        
        {user ? (
          <div className="user-info">
            <p>Hola, <strong>{user.username}</strong>!</p>
            <p>Tu rol es: <strong>{user.role}</strong></p>
            <div className="quick-links">
              <a href="/products" className="btn-primary">Ver Productos</a>
              <a href="/orders" className="btn-secondary">Mis Pedidos</a>
            </div>
          </div>
        ) : (
          <div className="guest-info">
            <p>Por favor, inicia sesión o regístrate para continuar</p>
            <div className="quick-links">
              <a href="/login" className="btn-primary">Iniciar Sesión</a>
              <a href="/register" className="btn-secondary">Registrarse</a>
            </div>
          </div>
        )}
      </div>
      
      <div className="features">
        <div className="feature-card">
          <h3>🔐 Autenticación Segura</h3>
          <p>Sistema JWT con tokens seguros y blacklist</p>
        </div>
        <div className="feature-card">
          <h3>🛒 Gestión de Pedidos</h3>
          <p>Crea y administra tus pedidos fácilmente</p>
        </div>
        <div className="feature-card">
          <h3>📦 Productos</h3>
          <p>Explora y compra productos disponibles</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

