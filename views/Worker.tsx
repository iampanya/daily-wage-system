import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, AttendanceStatus, LocationData } from '../types';
import { getRecords, saveRecords, getCurrentLocation, formatTime, formatDate } from '../utils';
import { Camera } from '../components/Camera';
import { CameraIcon, CheckCircleIcon, CalendarIcon } from '../components/Icons';

interface WorkerViewProps {
  currentUser: User;
}

export const WorkerView: React.FC<WorkerViewProps> = ({ currentUser }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [actionType, setActionType] = useState<'IN' | 'OUT'>('IN');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);

  // Date Filter State
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadRecords = () => {
    const allRecords = getRecords();
    const today = new Date().toISOString().split('T')[0];
    const userRecords = allRecords.filter(r => r.userId === currentUser.id);
    const todayRec = userRecords.find(r => r.date === today);
    
    // Filter by Date Range
    const filteredRecords = userRecords.filter(r => 
      r.date >= startDate && r.date <= endDate
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setRecords(filteredRecords);
    setTodayRecord(todayRec || null);
  };

  useEffect(() => {
    loadRecords();
  }, [currentUser.id, startDate, endDate]);

  const handleStartAction = async (type: 'IN' | 'OUT') => {
    setLoading(true);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      setActionType(type);
      setShowCamera(true);
    } catch (error) {
      alert('กรุณาเปิดใช้งาน GPS เพื่อลงเวลา');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoCaptured = (imageSrc: string) => {
    setShowCamera(false);
    const allRecords = getRecords();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    let updatedRecords = [...allRecords];

    if (actionType === 'IN') {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        date: today,
        clockInTime: now,
        clockInPhoto: imageSrc,
        clockInLocation: location!,
        status: AttendanceStatus.PENDING,
        supervisorId: currentUser.supervisorId,
        dailyWage: 350 // Default mocked wage
      };
      updatedRecords.push(newRecord);
      setTodayRecord(newRecord);
    } else {
      updatedRecords = updatedRecords.map(r => {
        if (r.id === todayRecord?.id) {
          return {
            ...r,
            clockOutTime: now,
            clockOutPhoto: imageSrc,
            clockOutLocation: location!,
            // Still pending until approved
          };
        }
        return r;
      });
      setTodayRecord(prev => prev ? { ...prev, clockOutTime: now } : null);
    }

    saveRecords(updatedRecords);
    loadRecords(); // Reload with current filters
    alert('บันทึกสำเร็จ!');
  };

  return (
    <div className="pb-20">
      {showCamera && (
        <Camera 
          onCapture={handlePhotoCaptured} 
          onClose={() => setShowCamera(false)} 
        />
      )}

      {/* Main Action Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 text-center">
        <h2 className="text-xl font-bold mb-2">สวัสดี, {currentUser.name}</h2>
        <p className="text-gray-500 mb-6">{formatDate(new Date().toISOString())}</p>

        {loading ? (
          <div className="animate-pulse text-blue-600">กำลังระบุตำแหน่ง...</div>
        ) : (
          <div className="space-y-4">
            {!todayRecord ? (
              <button
                onClick={() => handleStartAction('IN')}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
              >
                <CameraIcon /> ลงเวลาเข้างาน
              </button>
            ) : !todayRecord.clockOutTime ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 text-sm font-semibold">เข้างานเมื่อ</p>
                  <p className="text-2xl font-bold text-green-900">{formatTime(todayRecord.clockInTime)}</p>
                </div>
                <button
                  onClick={() => handleStartAction('OUT')}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  <CameraIcon /> ลงเวลาออกงาน
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <CheckCircleIcon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-900 font-bold text-lg">บันทึกเวลาวันนี้ครบถ้วน</p>
                <div className="flex justify-center gap-8 mt-4">
                  <div>
                    <span className="text-xs text-blue-700 block">เข้า</span>
                    <span className="font-bold">{formatTime(todayRecord.clockInTime)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700 block">ออก</span>
                    <span className="font-bold">{formatTime(todayRecord.clockOutTime)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Filter Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-500" /> 
          ประวัติการทำงาน
        </h3>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 grid grid-cols-2 gap-4">
        <div>
           <label className="text-xs text-gray-500 mb-1 block">เริ่มต้น</label>
           <input 
             type="date" 
             value={startDate}
             onChange={(e) => setStartDate(e.target.value)}
             className="w-full text-sm p-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
           />
        </div>
        <div>
           <label className="text-xs text-gray-500 mb-1 block">สิ้นสุด</label>
           <input 
             type="date" 
             value={endDate}
             onChange={(e) => setEndDate(e.target.value)}
             className="w-full text-sm p-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
           />
        </div>
      </div>

      <div className="space-y-3">
        {records.map(record => (
          <div key={record.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">{formatDate(record.date)}</p>
              <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                 <span className="bg-gray-100 px-2 py-0.5 rounded">In: {formatTime(record.clockInTime)}</span>
                 <span>-</span>
                 <span className="bg-gray-100 px-2 py-0.5 rounded">Out: {formatTime(record.clockOutTime)}</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              record.status === AttendanceStatus.APPROVED ? 'bg-green-100 text-green-800' :
              record.status === AttendanceStatus.REJECTED ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {record.status}
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <div className="text-center text-gray-400 py-8 bg-white rounded-lg border border-dashed border-gray-200">
            ไม่พบข้อมูลในช่วงวันที่เลือก
          </div>
        )}
      </div>
    </div>
  );
};