import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Products from '../pages/Products';

// Mock the graphql queries and mutations
vi.mock('../graphql/queries', () => ({
  GET_PRODUCTS: 'GET_PRODUCTS',
}));

vi.mock('../graphql/mutations', () => ({
  CREATE_PRODUCT_MUTATION: 'CREATE_PRODUCT_MUTATION',
  UPDATE_PRODUCT_MUTATION: 'UPDATE_PRODUCT_MUTATION',
  DELETE_PRODUCT_MUTATION: 'DELETE_PRODUCT_MUTATION',
}));

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(() => ({
    loading: false,
    error: null,
    data: {
      products: [
        { id: '1', name: 'Product 1', description: 'Description 1', price: 10.99 },
        { id: '2', name: 'Product 2', description: 'Description 2', price: 20.99 },
      ],
    },
    refetch: vi.fn(),
  })),
  useMutation: vi.fn(() => [vi.fn(), { loading: false, error: null }]),
}));

// Mock AuthContext - provide both AuthProvider and useAuth
const mockIsAdmin = { value: false };

vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      isAdmin: mockIsAdmin.value,
      isAuthenticated: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

describe('Products', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockIsAdmin.value = false;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render products page title', async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Productos')).toBeInTheDocument();
    });
  });

  it('should render products list', async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  it('should show product prices', async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('$10.99')).toBeInTheDocument();
      expect(screen.getByText('$20.99')).toBeInTheDocument();
    });
  });

  it('should show create product button for admin', async () => {
    mockIsAdmin.value = true;

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nuevo Producto')).toBeInTheDocument();
    });
  });

  it('should NOT show create product button for non-admin', async () => {
    mockIsAdmin.value = false;

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Nuevo Producto')).not.toBeInTheDocument();
    });
  });

  it('should show edit and delete buttons for admin', async () => {
    mockIsAdmin.value = true;

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Editar').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Eliminar').length).toBeGreaterThan(0);
    });
  });

  it('should NOT show edit/delete buttons for non-admin', async () => {
    mockIsAdmin.value = false;

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Editar')).not.toBeInTheDocument();
      expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
    });
  });

  it('should toggle create product form when button is clicked', async () => {
    mockIsAdmin.value = true;

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Click "Nuevo Producto" button
    const newProductButton = screen.getByText('Nuevo Producto');
    fireEvent.click(newProductButton);

    await waitFor(() => {
      expect(screen.getByText('Crear Nuevo Producto')).toBeInTheDocument();
    });

    // Click "Cancelar" button
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Crear Nuevo Producto')).not.toBeInTheDocument();
    });
  });

  it('should show edit form when edit button is clicked', async () => {
    mockIsAdmin.value = true;

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Click "Editar" button on first product
    const editButtons = screen.getAllByText('Editar');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Guardar')).toBeInTheDocument();
    });
  });

  it('should close edit form when cancel button is clicked', async () => {
    mockIsAdmin.value = true;

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Click "Editar" button to open edit form
    const editButtons = screen.getAllByText('Editar');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Guardar')).toBeInTheDocument();
    });

    // Click "Cancelar" button in edit form using a more specific query
    // The edit form's cancel button is inside the edit-form div
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Guardar')).not.toBeInTheDocument();
    });
  });

  it('should display empty state when no products', async () => {
    const { useQuery, useMutation } = await import('@apollo/client');
    useQuery.mockReturnValueOnce({
      loading: false,
      error: null,
      data: { products: [] },
      refetch: vi.fn(),
    });
    useMutation.mockReturnValueOnce([vi.fn(), { loading: false, error: null }]);

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No hay productos disponibles')).toBeInTheDocument();
    });
  });
});

