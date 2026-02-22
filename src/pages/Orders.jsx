import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_ORDERS, GET_PRODUCTS } from '../graphql/queries';
import { CREATE_ORDER_MUTATION } from '../graphql/mutations';
import './Orders.css';

const Orders = () => {
  const { loading: ordersLoading, error: ordersError, data: ordersData, refetch } = useQuery(GET_MY_ORDERS);
  const { data: productsData } = useQuery(GET_PRODUCTS);
  
  const [showForm, setShowForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [createOrder, { loading: creating }] = useMutation(CREATE_ORDER_MUTATION);

  const handleAddItem = (productId) => {
    const existing = selectedItems.find(item => item.productId === productId);
    if (existing) {
      setSelectedItems(
        selectedItems.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems([...selectedItems, { productId, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    setSelectedItems(
      selectedItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    
    if (selectedItems.length === 0) {
      setFormError('Debes agregar al menos un producto');
      return;
    }

    try {
      await createOrder({
        variables: {
          input: {
            items: selectedItems,
          },
        },
      });
      setSelectedItems([]);
      setShowForm(false);
      setSuccess('¡Pedido creado exitosamente!');
      refetch();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Error al crear pedido');
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

  if (ordersLoading) return <div className="loading">Cargando pedidos...</div>;
  if (ordersError) return <div className="error">Error: {ordersError.message}</div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Mis Pedidos</h1>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Nuevo Pedido'}
        </button>
      </div>

      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="order-form-card">
          <h3>Crear Nuevo Pedido</h3>
          {formError && <div className="error-message">{formError}</div>}
          
          <div className="products-selection">
            <h4>Seleccionar Productos</h4>
            <div className="products-list">
              {productsData?.products?.map((product) => (
                <div key={product.id} className="product-item">
                  <span>{product.name} - ${product.price?.toFixed(2)}</span>
                  <button 
                    type="button"
                    className="btn-add"
                    onClick={() => handleAddItem(product.id)}
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="selected-items">
              <h4>Productos Seleccionados</h4>
              {selectedItems.map((item) => {
                const product = productsData?.products?.find(p => p.id === item.productId);
                return (
                  <div key={item.productId} className="selected-item">
                    <span>{product?.name}</span>
                    <div className="quantity-controls">
                      <button onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => handleRemoveItem(item.productId)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button 
            onClick={handleCreateOrder} 
            disabled={creating || selectedItems.length === 0}
            className="btn-primary"
          >
            {creating ? 'Creando...' : 'Confirmar Pedido'}
          </button>
        </div>
      )}

      <div className="orders-list">
        {ordersData?.myOrders?.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">Pedido #{order.id}</span>
              <span className={`order-status ${getStatusClass(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="order-details">
              <p><strong>Total:</strong> ${order.total?.toFixed(2)}</p>
              <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="order-items">
              <h4>Productos:</h4>
              {order.items?.map((item) => (
                <div key={item.id} className="order-item">
                  <span>{item.product?.name} x{item.quantity}</span>
                  <span>${item.price?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {ordersData?.myOrders?.length === 0 && (
        <div className="empty-state">
          <p>No tienes pedidos todavía</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Crear tu primer pedido
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;

