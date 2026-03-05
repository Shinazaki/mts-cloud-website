import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, apiClient } from './client';

describe('API Client', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('login() calls /auth/login and returns response', async () => {
        const mockResponse = { data: { id: 1, username: 'test-user' }, headers: { access_token: 'token' } };
        const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue(mockResponse as never);

        const response = await api.auth.login({ username: 'test-user', password: 'secret' });

        expect(postSpy).toHaveBeenCalledWith('/auth/login', { username: 'test-user', password: 'secret' });
        expect(response).toBe(mockResponse);
    });

    it('updateProfile() calls /users/update_info', async () => {
        const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: { id: 1 } } as never);

        await api.users.updateProfile({ firstName: 'Jane', password: 'current-password' });

        expect(patchSpy).toHaveBeenCalledWith('/users/update_info', { firstName: 'Jane', password: 'current-password' });
    });
});
