import { User, Vessel, Shipment, VoyageSchedule, CrewMember, DashboardStats, ActivityLog } from '../types/shipping.ts';

let inMemoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryToken = token;
};

export const getAuthToken = () => inMemoryToken;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (inMemoryToken) {
    headers['Authorization'] = `Bearer ${inMemoryToken}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Terjadi kesalahan pada permintaan server database.');
  }

  return data;
}

export const api = {
  // Auth
  async login(username: string, password: string):Promise<{ success: boolean; user: User; token: string; message: string }> {
    const res = await request<{ success: boolean; user: User; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setAuthToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ success: boolean; user: User }>('/api/auth/me');
  },

  // Stats & Logs
  async getOnlineStatus(): Promise<import('../types/shipping.ts').OnlineStatus> {
    const res = await request<{
      success: boolean;
      online: boolean;
      activeUsersCount: number;
      serverTime: string;
      serverRegion: string;
      databaseStatus: string;
    }>('/api/online/status');
    return res;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await request<{ success: boolean; stats: DashboardStats }>('/api/dashboard/stats');
    return res.stats;
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    const res = await request<{ success: boolean; logs: ActivityLog[] }>('/api/activity-logs');
    return res.logs;
  },

  async resetDatabase(): Promise<{ message: string }> {
    return request<{ success: boolean; message: string }>('/api/db/reset', { method: 'POST' });
  },

  // Vessels CRUD
  async getVessels(): Promise<Vessel[]> {
    const res = await request<{ success: boolean; vessels: Vessel[] }>('/api/vessels');
    return res.vessels;
  },

  async createVessel(vesselData: Partial<Vessel>): Promise<{ vessel: Vessel; message: string }> {
    return request<{ success: boolean; vessel: Vessel; message: string }>('/api/vessels', {
      method: 'POST',
      body: JSON.stringify(vesselData)
    });
  },

  async updateVessel(id: string, vesselData: Partial<Vessel>): Promise<{ vessel: Vessel; message: string }> {
    return request<{ success: boolean; vessel: Vessel; message: string }>(`/api/vessels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vesselData)
    });
  },

  async deleteVessel(id: string): Promise<{ message: string }> {
    return request<{ success: boolean; message: string }>(`/api/vessels/${id}`, {
      method: 'DELETE'
    });
  },

  // Shipments CRUD
  async getShipments(): Promise<Shipment[]> {
    const res = await request<{ success: boolean; shipments: Shipment[] }>('/api/shipments');
    return res.shipments;
  },

  async createShipment(shipmentData: Partial<Shipment>): Promise<{ shipment: Shipment; message: string }> {
    return request<{ success: boolean; shipment: Shipment; message: string }>('/api/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData)
    });
  },

  async updateShipment(id: string, shipmentData: Partial<Shipment>): Promise<{ shipment: Shipment; message: string }> {
    return request<{ success: boolean; shipment: Shipment; message: string }>(`/api/shipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shipmentData)
    });
  },

  async deleteShipment(id: string): Promise<{ message: string }> {
    return request<{ success: boolean; message: string }>(`/api/shipments/${id}`, {
      method: 'DELETE'
    });
  },

  // Schedules CRUD
  async getSchedules(): Promise<VoyageSchedule[]> {
    const res = await request<{ success: boolean; schedules: VoyageSchedule[] }>('/api/schedules');
    return res.schedules;
  },

  async createSchedule(scheduleData: Partial<VoyageSchedule>): Promise<{ schedule: VoyageSchedule; message: string }> {
    return request<{ success: boolean; schedule: VoyageSchedule; message: string }>('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
  },

  async updateSchedule(id: string, scheduleData: Partial<VoyageSchedule>): Promise<{ schedule: VoyageSchedule; message: string }> {
    return request<{ success: boolean; schedule: VoyageSchedule; message: string }>(`/api/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData)
    });
  },

  async deleteSchedule(id: string): Promise<{ message: string }> {
    return request<{ success: boolean; message: string }>(`/api/schedules/${id}`, {
      method: 'DELETE'
    });
  },

  // Crew CRUD
  async getCrew(): Promise<CrewMember[]> {
    const res = await request<{ success: boolean; crew: CrewMember[] }>('/api/crew');
    return res.crew;
  },

  async createCrew(crewData: Partial<CrewMember>): Promise<{ crew: CrewMember; message: string }> {
    return request<{ success: boolean; crew: CrewMember; message: string }>('/api/crew', {
      method: 'POST',
      body: JSON.stringify(crewData)
    });
  },

  async updateCrew(id: string, crewData: Partial<CrewMember>): Promise<{ crew: CrewMember; message: string }> {
    return request<{ success: boolean; crew: CrewMember; message: string }>(`/api/crew/${id}`, {
      method: 'PUT',
      body: JSON.stringify(crewData)
    });
  },

  async deleteCrew(id: string): Promise<{ message: string }> {
    return request<{ success: boolean; message: string }>(`/api/crew/${id}`, {
      method: 'DELETE'
    });
  }
};
