jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('./sessionApiShared.jsx', () => ({
  API_URL: 'http://localhost:3000/api',
  isE2EMode: false,
  createE2EUser: jest.fn(),
  getAuthToken: jest.fn(),
  requireAuthToken: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearStoredAuthData, doesStoredUserExist } from './authSlice.jsx';

describe('auth startup helpers', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete globalThis.fetch;
  });

  test('doesStoredUserExist returns false when the backend no longer has the stored user', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      status: 404,
    });

    await expect(doesStoredUserExist({
      user: { id: 77 },
      token: 'token-77',
    })).resolves.toBe(false);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/77',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-77',
        }),
      })
    );
  });

  test('clearStoredAuthData removes persisted user and token entries', async () => {
    await clearStoredAuthData();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
  });
});
