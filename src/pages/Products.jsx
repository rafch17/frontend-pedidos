import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS } from '../graphql/queries';
import { CREATE_PRODUCT_MUTATION, DELETE_PRODUCT_MUTATION } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import './Products.css';

const Products = () => {
  const { isAdmin } = useAuth();
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });
  const [formError, setFormError] = useState('');
  
  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT_MUTATION);
  const [deleteProduct] = useMutation(DELETE_PRODUCT_MUTATION);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    
    try {
      await createProduct({
        variables: {
          input: {
            name: newProduct.name,
            description: newProduct.description || null,
            price: parseFloat(newProduct.price),
          },
        },
      });
      setNewProduct({ name: '', description: '', price: '' });
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.message || 'Error al crear producto');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await deleteProduct({ variables: { id } });
      refetch();
    } catch (err) {
      alert(err.message || 'Error al eliminar producto');
    }
  };

  if (loading) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Productos</h1>
        {isAdmin && (
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : 'Nuevo Producto'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="product-form-card">
          <h3>Crear Nuevo Producto</h3>
          {formError && <div className="error-message">{formError}</div>}
          <form onSubmit={handleCreateProduct}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
                placeholder="Nombre del producto"
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Descripción del producto"
              />
            </div>
            <div className="form-group">
              <label>Precio</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Creando...' : 'Crear Producto'}
            </button>
          </form>
        </div>
      )}

      <div className="products-grid">
        {data?.products?.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p className="product-description">{product.description || 'Sin descripción'}</p>
            <p className="product-price">${product.price?.toFixed(2)}</p>
            {isAdmin && (
              <button 
                className="btn-delete"
                onClick={() => handleDeleteProduct(product.id)}
              >
                Eliminar
              </button>
            )}
          </div>
        ))}
      </div>

      {data?.products?.length === 0 && (
        <div className="empty-state">
          <p>No hay productos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default Products;

