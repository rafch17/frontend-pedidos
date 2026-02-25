import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import { AuthProvider } from '../context/AuthContext';

// Mock the graphql mutations
vi.mock('../graphql/mutations', () => ({
  REGISTER_MUTATION: 'REGISTER_MUTATION',
  REGISTER_ADMIN_MUTATION: 'REGISTER_ADMIN_MUTATION',
}));

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useMutation: () => [vi.fn(), { loading: false, error: null }],
}));

describe('Register', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should show link to login page', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Inicia Sesión/ })).toBeInTheDocument();
    });
  });
});

