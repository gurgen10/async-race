import { BASE_URL } from './baseApi';
import type { EngineResponse, DriveStatus } from '../types/engine';

const PATH = '/engine';

const ENGINE_BROKEN_HTTP_STATUS = 500;

export const engineApi = {
  setEngine: async (id: number, status: 'started' | 'stopped'): Promise<EngineResponse> => {
    const response = await fetch(`${BASE_URL}${PATH}?id=${id}&status=${status}`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: engine ${status}`);
    return response.json() as Promise<EngineResponse>;
  },

  drive: async (id: number): Promise<DriveStatus> => {
    const response = await fetch(`${BASE_URL}${PATH}?id=${id}&status=drive`, {
      method: 'PATCH',
    });
    if (response.status === ENGINE_BROKEN_HTTP_STATUS) return 'broken';
    if (!response.ok) throw new Error(`HTTP ${response.status}: engine drive`);
    return 'success';
  },
};
