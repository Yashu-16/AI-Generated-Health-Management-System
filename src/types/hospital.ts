
export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email?: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  allergies: string[];
  admissionDate: Date;
  dischargeDate?: Date;
  status: "Admitted" | "Discharged" | "Critical" | "Stable";
  assignedDoctorId: string;
  assignedRoomId: string;
  insuranceInfo?: string;
  medicalHistory: string;
  currentDiagnosis?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  qualification: string;
  experience: number;
  phone: string;
  email: string;
  department: string;
  schedule: {
    [key: string]: { start: string; end: string; available: boolean };
  };
  consultationFee: number;
  status: "Active" | "On Leave" | "Inactive";
  maxPatientsPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number; // in minutes
  type: "Consultation" | "Follow-up" | "Emergency" | "Surgery";
  status: "Scheduled" | "Completed" | "Cancelled" | "No Show";
  notes?: string;
  fee: number;
  roomId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: Date;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  medications: Medication[];
  vitalSigns: {
    temperature: number;
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    oxygenSaturation: number;
  };
  labResults?: LabResult[];
  notes: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface LabResult {
  testName: string;
  result: string;
  normalRange: string;
  status: "Normal" | "Abnormal" | "Critical";
}

export interface Invoice {
  id: string;
  patientId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "Pending" | "Paid" | "Overdue" | "Cancelled";
  paymentMethod?: string;
  paymentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: "Consultation" | "Medication" | "Lab Test" | "Room Charge" | "Procedure" | "Other";
}

export interface Room {
  id: string;
  roomNumber: string;
  type: "General" | "ICU" | "Private" | "Semi-Private" | "Emergency" | "Surgery";
  floor: number;
  capacity: number;
  currentOccupancy: number;
  status: "Available" | "Occupied" | "Maintenance" | "Reserved";
  dailyRate: number;
  amenities: string[];
  assignedPatients: string[];
  lastCleaned?: Date;
  equipment: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "doctor" | "staff";
  fullName: string;
  phone: string;
  department?: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface HospitalStats {
  totalPatients: number;
  admittedPatients: number;
  dischargedToday: number;
  availableBeds: number;
  occupancyRate: number;
  todaysAppointments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeStaff: number;
  criticalPatients: number;
}
