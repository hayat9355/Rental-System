export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  roomNumber: string;
  monthlyRent: number;
  status: 'PAID' | 'UNPAID' | 'PARTIAL';
  contractStart: string;
  contractEnd: string;
  avatar?: string;
  moveInDate: string;
  emergencyContact?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  amount: number;
  month: string;
  year: number;
  method: 'Cash' | 'Bank Transfer' | 'Mobile Money';
  date: string;
  lateFee: number;
  status: 'Paid' | 'Partial';
  notes?: string;
}

export interface Room {
  id: string;
  number: string;
  status: 'occupied-paid' | 'occupied-unpaid' | 'vacant';
  tenantId?: string;
  tenantName?: string;
  monthlyRent: number;
  floor: number;
  type: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Mobile Money';
