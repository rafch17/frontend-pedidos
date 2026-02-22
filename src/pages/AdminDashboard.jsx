import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_ORDERS } from '../graphql/queries';
import { UPDATE_ORDER_STATUS_MUTATION } from '../graphql/mutations';
import './AdminDashboard.css';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const AdminDashboard = () => {
  const { loading, error, data, refetch } = useQuery(GET_ALL_ORDERS);
  const [updateOrderStatus, { loading: updating }] = useMutation(UPDATE_ORDER_STATUS_MUTATION);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [success, setSuccess] = useState('');

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({
        variables: { id: orderId, status: newStatus },
      });
      setSuccess(`Estado del pedido #${orderId} actualizado a ${newStatus}`);
      refetch();
      setSelectedOrder(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.message || 'Error al actualizar estado');
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      PENDING: 'status-pending',
      CONFIRMED: 'status-confirmed',
      SHIPPED: 'status-shipped',
      DELIVERED: 'status-delivered',
      CANCELLED: 'status-cancelled',
    };
    return statusMap[status] || '';
  };

  if (loading) return <div className="loading">Cargando pedidos...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Panel de Administrador</h1>
      </div>

      {success && <div className="success-message">{success}</div>}

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.allOrders?.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.user?.username}</td>
                <td>${order.total?.toFixed(2)}</td>
                <td>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Cambiar Estado
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.allOrders?.length === 0 && (
        <div className="empty-state">
          <p>No hay pedidos en el sistema</p>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cambiar Estado del Pedido #{selectedOrder.id}</h3>
            <p>Usuario: {selectedOrder.user?.username}</p>
            <p>Estado actual: <span className={`order-status ${getStatusClass(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
            
            <div className="status-buttons">
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  className={`status-btn ${getStatusClass(status)} ${selectedOrder.status === status ? 'active' : ''}`}
                  onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                  disabled={updating || selectedOrder.status === status}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="order-items-preview">
              <h4>Productos:</h4>
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="order-item">
                  <span>{item.product?.name} x{item.quantity}</span>
                  <span>${item.price?.toFixed(2)}</span>
                </div>
              ))}
              <p className="order-total"><strong>Total: ${selectedOrder.total?.toFixed(2)}</strong></p>
            </div>

            <button className="btn-close" onClick={() => setSelectedOrder(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

