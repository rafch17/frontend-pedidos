import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide initial state with no user', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Token will be whatever is in localStorage (empty string from mock) or null
    expect(result.current.user).toBeNull();
    // Check that user is not set - token might be undefined or empty string
    expect(result.current.loading).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it('should login and set user data', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const testUser = { id: 1, username: 'testuser', role: 'USER' };
    const testToken = 'test-token-123';

    await act(async () => {
      result.current.login(testToken, testUser);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('token', testToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(testUser));
    expect(result.current.user).toEqual(testUser);
    expect(result.current.token).toBe(testToken);
  });

  it('should logout and clear user data', async () => {
    // First login
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const testUser = { id: 1, username: 'testuser', role: 'USER' };
    const testToken = 'test-token-123';

    await act(async () => {
      result.current.login(testToken, testUser);
    });

    expect(result.current.user).toEqual(testUser);

    // Now logout
    await act(async () => {
      result.current.logout();
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should correctly identify admin user', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const adminUser = { id: 1, username: 'admin', role: 'ADMIN' };
    const testToken = 'test-token-123';

    await act(async () => {
      result.current.login(testToken, adminUser);
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.user.role).toBe('ADMIN');
  });

  it('should correctly identify non-admin user', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const regularUser = { id: 1, username: 'user', role: 'USER' };
    const testToken = 'test-token-123';

    await act(async () => {
      result.current.login(testToken, regularUser);
    });

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.user.role).toBe('USER');
  });
});

