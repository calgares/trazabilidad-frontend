// Cliente API para conectar con el backend en Easypanel
const API_URL = import.meta.env.VITE_API_URL || 'https://trazamaster-trazabilidad-api.trklxg.easypanel.host';

interface ApiResponse<T> {
    data: T | null;
    error: string | null;
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    private async request<T>(method: string, endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            const data = await response.json();

            if (!response.ok) {
                return { data: null, error: data.error || 'Error desconocido' };
            }

            return { data, error: null };
        } catch (err) {
            return { data: null, error: (err as Error).message };
        }
    }

    // GET request
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>('GET', endpoint);
    }

    // POST request
    async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
        return this.request<T>('POST', endpoint, body);
    }

    // PUT request
    async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
        return this.request<T>('PUT', endpoint, body);
    }

    // DELETE request
    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', endpoint);
    }

    // Métodos específicos para compatibilidad con código existente
    from(table: string) {
        return new QueryBuilder(this, table);
    }
}

// Query builder para compatibilidad con sintaxis de Supabase
class QueryBuilder {
    private client: ApiClient;
    private table: string;
    private _selectColumns: string = '*';
    private filters: { column: string; operator: string; value: unknown }[] = [];
    private _orderByColumn: string | null = null;
    private _orderAscending: boolean = true;
    private _limitCount: number | null = null;
    private isSingle: boolean = false;

    constructor(client: ApiClient, table: string) {
        this.client = client;
        this.table = table;
    }

    select(columns: string = '*') {
        this._selectColumns = columns;
        return this;
    }

    eq(column: string, value: unknown) {
        this.filters.push({ column, operator: 'eq', value });
        return this;
    }

    order(column: string, { ascending = true } = {}) {
        this._orderByColumn = column;
        this._orderAscending = ascending;
        return this;
    }

    limit(count: number) {
        this._limitCount = count;
        return this;
    }

    single() {
        this.isSingle = true;
        return this;
    }

    async then<T>(resolve: (value: { data: T | null; error: unknown }) => void) {
        // Mapear tabla a endpoint
        const endpointMap: Record<string, string> = {
            'equipos': '/api/equipos',
            'perfiles': '/api/perfiles',
            'mantenimientos': '/api/mantenimientos',
            'work_orders': '/api/work-orders',
            'ubicaciones': '/api/ubicaciones',
            'areas_departamentos': '/api/ubicaciones/areas',
            'plantas': '/api/ubicaciones/plantas',
            'tipos_equipo': '/api/catalogos',
            'roles': '/api/catalogos/roles',
        };

        let endpoint = endpointMap[this.table] || `/api/${this.table}`;

        // Si hay filtro por ID, agregar al endpoint
        const idFilter = this.filters.find(f => f.column === 'id' && f.operator === 'eq');
        if (idFilter) {
            endpoint += `/${idFilter.value}`;
        }

        const result = await this.client.get<T>(endpoint);

        if (this.isSingle && Array.isArray(result.data)) {
            result.data = result.data[0] || null;
        }

        resolve(result as { data: T | null; error: unknown });
    }

    async insert(data: unknown) {
        const endpointMap: Record<string, string> = {
            'equipos': '/api/equipos',
            'mantenimientos': '/api/mantenimientos',
            'work_orders': '/api/work-orders',
        };
        const endpoint = endpointMap[this.table] || `/api/${this.table}`;
        return this.client.post(endpoint, data);
    }

    async update(data: unknown) {
        const idFilter = this.filters.find(f => f.column === 'id' && f.operator === 'eq');
        if (!idFilter) {
            return { data: null, error: 'ID requerido para actualizar' };
        }

        const endpointMap: Record<string, string> = {
            'equipos': '/api/equipos',
            'work_orders': '/api/work-orders',
        };
        const endpoint = `${endpointMap[this.table] || `/api/${this.table}`}/${idFilter.value}`;
        return this.client.put(endpoint, data);
    }

    async delete() {
        const idFilter = this.filters.find(f => f.column === 'id' && f.operator === 'eq');
        if (!idFilter) {
            return { data: null, error: 'ID requerido para eliminar' };
        }

        const endpointMap: Record<string, string> = {
            'equipos': '/api/equipos',
        };
        const endpoint = `${endpointMap[this.table] || `/api/${this.table}`}/${idFilter.value}`;
        return this.client.delete(endpoint);
    }
}

export const api = new ApiClient(API_URL);

// Alias para compatibilidad con código que usa 'supabase'
export const supabase = {
    from: (table: string) => api.from(table),
    auth: {
        getSession: async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return { data: { session: null }, error: null };

            const result = await api.get<{ id: string; email: string }>('/api/auth/me');
            if (result.error) {
                return { data: { session: null }, error: result.error };
            }
            return {
                data: {
                    session: {
                        user: result.data,
                        access_token: token
                    }
                },
                error: null
            };
        },
        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
            const result = await api.post<{ token: string; user: unknown }>('/api/auth/login', { email, password });
            if (result.data?.token) {
                api.setToken(result.data.token);
            }
            return {
                data: result.data ? { session: { user: result.data.user } } : null,
                error: result.error
            };
        },
        signOut: async () => {
            api.setToken(null);
            return { error: null };
        },
        onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
            // Simular el evento inicial
            const token = localStorage.getItem('auth_token');
            if (token) {
                callback('SIGNED_IN', { user: {} });
            } else {
                callback('SIGNED_OUT', null);
            }
            return {
                data: { subscription: { unsubscribe: () => { } } }
            };
        }
    }
};
