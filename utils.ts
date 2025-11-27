import { AttendanceRecord, User, UserRole, AttendanceStatus, LocationData } from './types';

// Mock Data Initialization
const MOCK_USERS: User[] = [
  { id: 'u1', username: 'sup1', name: 'หัวหน้า สมชาย (Supervisor)', role: UserRole.SUPERVISOR },
  { id: 'u2', username: 'work1', name: 'นาย ดำ (คนงาน)', role: UserRole.WORKER, supervisorId: 'u1' },
  { id: 'u3', username: 'work2', name: 'นาย แดง (คนงาน)', role: UserRole.WORKER, supervisorId: 'u1' },
  { id: 'u4', username: 'audit1', name: 'คุณ สมศรี (ตรวจสอบ/บัญชี)', role: UserRole.AUDITOR },
];

const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 'r1',
    userId: 'u2',
    userName: 'นาย ดำ (คนงาน)',
    date: new Date().toISOString().split('T')[0],
    clockInTime: new Date(new Date().setHours(8, 0)).toISOString(),
    status: AttendanceStatus.PENDING,
    supervisorId: 'u1',
    dailyWage: 350
  }
];

export const USERS_KEY = 'dws_users';
export const RECORDS_KEY = 'dws_records';

export const initializeData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem(RECORDS_KEY)) {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(INITIAL_RECORDS));
  }
};

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const getRecords = (): AttendanceRecord[] => {
  return JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
};

export const saveRecords = (records: AttendanceRecord[]) => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

export const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (isoString?: string) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => reject(error)
    );
  });
};