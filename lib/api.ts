export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error occurred');
  }
};

// Authentication API calls
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: any) => {
    return apiRequest<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return apiRequest<{ user: any }>('/auth/me');
  },
};

// Doctor API calls
export const doctorApi = {
  getAll: async () => {
    return apiRequest<{ doctors: any[] }>('/doctors');
  },

  getById: async (id: string) => {
    return apiRequest<{ doctor: any }>(`/doctors/${id}`);
  },

  createTimeSlot: async (doctorId: string, date: string, time: string) => {
    return apiRequest<{ slot: any }>('/doctors/time-slots', {
      method: 'POST',
      body: JSON.stringify({ doctorId, date, time }),
    });
  },

  getTimeSlots: async (doctorId?: string) => {
    const query = doctorId ? `?doctorId=${doctorId}` : '';
    return apiRequest<{ slots: any[] }>(`/doctors/time-slots${query}`);
  },

  deleteTimeSlot: async (slotId: string) => {
    return apiRequest(`/doctors/time-slots/${slotId}`, {
      method: 'DELETE',
    });
  },
};

// Appointment API calls
export const appointmentApi = {
  book: async (doctorId: string, patientId: string, date: string, time: string) => {
    return apiRequest<{ appointment: any }>('/appointments', {
      method: 'POST',
      body: JSON.stringify({ doctorId, patientId, date, time }),
    });
  },

  getAll: async (userId?: string, role?: string) => {
    const query = userId && role ? `?userId=${userId}&role=${role}` : '';
    return apiRequest<{ appointments: any[] }>(`/appointments${query}`);
  },

  cancel: async (appointmentId: string) => {
    return apiRequest(`/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
    });
  },

  reschedule: async (appointmentId: string, newDate: string, newTime: string) => {
    return apiRequest(`/appointments/${appointmentId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ newDate, newTime }),
    });
  },
};

// Email API calls
export const emailApi = {
  sendConfirmation: async (appointmentData: any) => {
    return apiRequest('/email/confirmation', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  sendReminder: async (appointmentId: string) => {
    return apiRequest(`/email/reminder/${appointmentId}`, {
      method: 'POST',
    });
  },
};