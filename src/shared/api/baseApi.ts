import { BASE_URL } from '../../../env';

export { BASE_URL };

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${path}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchApiVoid(path: string, options?: RequestInit): Promise<void> {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${path}`);
  }
}
