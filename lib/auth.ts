
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'patient' | 'admin';
  specialization?: string;
  phone?: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  experience: number;
  rating: number;
  availableSlots: TimeSlot[];
}

export interface Patient extends User {
  role: 'patient';
  dateOfBirth: string;
  medicalHistory?: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  isBooked: boolean;
  patientId?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  doctorName: string;
  patientName: string;
  specialization: string;
}

// Mock data storage
let users: (Doctor | Patient)[] = [
  {
    id: '1',
    email: 'dr.smith@hospital.com',
    name: 'Dr. John Smith',
    role: 'doctor',
    specialization: 'Cardiology',
    experience: 15,
    rating: 4.8,
    phone: '+1-555-0101',
    availableSlots: []
  },
  {
    id: '2',
    email: 'dr.johnson@hospital.com',
    name: 'Dr. Emily Johnson',
    role: 'doctor',
    specialization: 'Dermatology',
    experience: 12,
    rating: 4.9,
    phone: '+1-555-0102',
    availableSlots: []
  },
  {
    id: '3',
    email: 'dr.williams@hospital.com',
    name: 'Dr. Michael Williams',
    role: 'doctor',
    specialization: 'Pediatrics',
    experience: 10,
    rating: 4.7,
    phone: '+1-555-0103',
    availableSlots: []
  },
  {
    id: '4',
    email: 'patient@email.com',
    name: 'John Doe',
    role: 'patient',
    dateOfBirth: '1985-06-15',
    phone: '+1-555-0201'
  }
];

let timeSlots: TimeSlot[] = [];
let appointments: Appointment[] = [];
let currentUser: User | null = null;

// Enhanced authentication functions with better error handling
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const user = users.find(u => u.email === email);
    if (user) {
      // In a real app, you'd verify the password hash here
      currentUser = user;
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      return user;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const register = async (userData: Partial<User & Doctor & Patient>): Promise<User | null> => {
  try {
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = {
      ...userData,
      id: Date.now().toString(),
      rating: userData.role === 'doctor' ? 4.5 : undefined,
      availableSlots: userData.role === 'doctor' ? [] : undefined,
    } as User & Doctor & Patient;
    
    users.push(newUser);
    currentUser = newUser;
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    }
    
    return newUser;
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
};

export const logout = () => {
  currentUser = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
  }
};

export const getCurrentUser = (): User | null => {
  if (currentUser) {
    return currentUser;
  }
  
  // Try to restore from localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
        return currentUser;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }
  
  return null;
};

// Doctor functions
export const getDoctors = (): Doctor[] => {
  return users.filter(user => user.role === 'doctor') as Doctor[];
};

export const getDoctorById = (id: string): Doctor | null => {
  return users.find(user => user.id === id && user.role === 'doctor') as Doctor || null;
};

export const createTimeSlot = (doctorId: string, date: string, time: string): TimeSlot => {
  const newSlot: TimeSlot = {
    id: Date.now().toString(),
    doctorId,
    date,
    time,
    isBooked: false
  };
  
  timeSlots.push(newSlot);
  return newSlot;
};

export const getTimeSlots = (doctorId?: string): TimeSlot[] => {
  return doctorId ? timeSlots.filter(slot => slot.doctorId === doctorId) : timeSlots;
};

export const deleteTimeSlot = (slotId: string): boolean => {
  const index = timeSlots.findIndex(slot => slot.id === slotId);
  if (index > -1) {
    timeSlots.splice(index, 1);
    return true;
  }
  return false;
};

// Appointment functions
export const bookAppointment = (doctorId: string, patientId: string, date: string, time: string): Appointment | null => {
  const slot = timeSlots.find(s => s.doctorId === doctorId && s.date === date && s.time === time && !s.isBooked);
  const doctor = getDoctorById(doctorId);
  const patient = users.find(u => u.id === patientId && u.role === 'patient');
  
  if (slot && doctor && patient) {
    slot.isBooked = true;
    slot.patientId = patientId;
    
    const appointment: Appointment = {
      id: Date.now().toString(),
      doctorId,
      patientId,
      date,
      time,
      status: 'scheduled',
      doctorName: doctor.name,
      patientName: patient.name,
      specialization: doctor.specialization
    };
    
    appointments.push(appointment);
    return appointment;
  }
  return null;
};

export const getAppointments = (userId?: string, role?: string): Appointment[] => {
  if (!userId) return appointments;
  
  if (role === 'doctor') {
    return appointments.filter(apt => apt.doctorId === userId);
  } else if (role === 'patient') {
    return appointments.filter(apt => apt.patientId === userId);
  }
  
  return appointments;
};

export const cancelAppointment = (appointmentId: string): boolean => {
  const appointment = appointments.find(apt => apt.id === appointmentId);
  if (appointment) {
    appointment.status = 'cancelled';
    
    const slot = timeSlots.find(s => 
      s.doctorId === appointment.doctorId && 
      s.date === appointment.date && 
      s.time === appointment.time
    );
    if (slot) {
      slot.isBooked = false;
      slot.patientId = undefined;
    }
    return true;
  }
  return false;
};

// Initialize some sample time slots
const initializeSampleData = () => {
  const doctors = getDoctors();
  const today = new Date();
  
  doctors.forEach(doctor => {
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].forEach(time => {
        createTimeSlot(doctor.id, dateString, time);
      });
    }
  });
};

// Initialize data if not already done
if (timeSlots.length === 0) {
  initializeSampleData();
}
