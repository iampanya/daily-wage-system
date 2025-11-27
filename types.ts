export enum UserRole {
  WORKER = 'WORKER',
  SUPERVISOR = 'SUPERVISOR',
  AUDITOR = 'AUDITOR'
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  supervisorId?: string; // For workers, who is their boss
}

export enum AttendanceStatus {
  PENDING = 'รอตรวจสอบ',
  APPROVED = 'อนุมัติแล้ว',
  REJECTED = 'ปฏิเสธ'
}

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO Date YYYY-MM-DD
  clockInTime?: string; // ISO String
  clockOutTime?: string; // ISO String
  clockInPhoto?: string; // Base64
  clockOutPhoto?: string; // Base64
  clockInLocation?: LocationData;
  clockOutLocation?: LocationData;
  status: AttendanceStatus;
  supervisorId?: string;
  dailyWage: number;
}
