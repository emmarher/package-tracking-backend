export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: 'admin' | 'delivery';
  created_at: Date;
}

export interface Package {
  id: number;
  recipient: string;
  address: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  assigned_to?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Location {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreatePackageRequest {
  recipient: string;
  address: string;
  assigned_to?: number;
}

export interface UpdatePackageStatusRequest {
  status: Package['status'];
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
}

