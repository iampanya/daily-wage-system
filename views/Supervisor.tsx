import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, AttendanceStatus } from '../types';
import { getRecords, saveRecords, formatDate, formatTime } from '../utils';
import { CheckCircleIcon, XCircleIcon, MapPinIcon, CalendarIcon, HistoryIcon } from '../components/Icons';

interface SupervisorViewProps {
  currentUser: User;
}

type Tab = 'PENDING' | 'HISTORY';

export const SupervisorView: React.FC<SupervisorViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<Tab>('PENDING');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  
  // Date Filter for History
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Last 7 days
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    refreshData();
  }, [currentUser.id, activeTab, startDate, endDate]);

  const refreshData = () => {
    const allRecords = getRecords();
    
    if (activeTab === 'PENDING') {
      // Filter: subordinate of this supervisor AND status is PENDING
      const filtered = allRecords.filter(r => 
        r.supervisorId === currentUser.id && 
        r.status === AttendanceStatus.PENDING
      );
      setRecords(filtered);
    } else {
      // Filter: subordinate AND status is NOT PENDING AND within date range
      const filtered = allRecords.filter(r => 
        r.supervisorId === currentUser.id && 
        r.status !== AttendanceStatus.PENDING &&
        r.date >= startDate && r.date <= endDate
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(filtered);
    }
  };

  const handleAction = (recordId: string, status: AttendanceStatus) => {
    const allRecords = getRecords();
    const updatedRecords = allRecords.map(r => 
      r.id === recordId ? { ...r, status } : r
    );
    saveRecords(updatedRecords);
    refreshData();
  };

  return (
    <div className="pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">จัดการข้อมูลคนงาน</h2>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-200 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'PENDING' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircleIcon className="w-4 h-4" /> รออนุมัติ
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'HISTORY' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <HistoryIcon className="w-4 h-4" /> ประวัติย้อนหลัง
        </button>
      </div>

      {/* History Date Filter */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
            <CalendarIcon className="w-5 h-5" /> ช่วงเวลาที่ต้องการดูข้อมูล
          </div>
          <div className="grid grid-cols-2 gap-4">
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
        </div>
      )}

      {/* List */}
      <div className="space-y-6">
        {records.length === 0 ? (
           <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-dashed border-gray-300">
             <div className="text-gray-400 text-lg">
                {activeTab === 'PENDING' ? 'ไม่พบรายการที่รอตรวจสอบ' : 'ไม่พบประวัติในช่วงเวลานี้'}
             </div>
           </div>
        ) : (
          records.map(record => (
            <div key={record.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${
                 activeTab === 'HISTORY' ? 'bg-gray-50' : 'bg-blue-50'
              }`}>
                <div>
                    <div className="font-bold text-gray-800">{record.userName}</div>
                    <div className="text-xs text-gray-500">{formatDate(record.date)}</div>
                </div>
                {activeTab === 'HISTORY' && (
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    record.status === AttendanceStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {record.status}
                  </span>
                )}
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Clock In Info */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">เวลาเข้า</p>
                    <div className="font-mono text-lg font-semibold">{formatTime(record.clockInTime)}</div>
                    {record.clockInPhoto ? (
                      <img 
                        src={record.clockInPhoto} 
                        alt="In" 
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200 bg-gray-100" 
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No Photo</div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPinIcon className="w-3 h-3" /> 
                      {record.clockInLocation?.lat.toFixed(5)}, {record.clockInLocation?.lng.toFixed(5)}
                    </div>
                  </div>

                  {/* Clock Out Info */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">เวลาออก</p>
                    <div className="font-mono text-lg font-semibold">{formatTime(record.clockOutTime)}</div>
                    {record.clockOutPhoto ? (
                      <img 
                        src={record.clockOutPhoto} 
                        alt="Out" 
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200 bg-gray-100" 
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">ยังไม่ออก</div>
                    )}
                     <div className="flex items-center gap-1 text-xs text-gray-500">
                       {record.clockOutLocation && (
                         <>
                          <MapPinIcon className="w-3 h-3" /> 
                          {record.clockOutLocation.lat.toFixed(5)}, {record.clockOutLocation.lng.toFixed(5)}
                         </>
                       )}
                    </div>
                  </div>
                </div>

                {/* Show Actions only for Pending tab */}
                {activeTab === 'PENDING' && (
                  <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
                    <button 
                      onClick={() => handleAction(record.id, AttendanceStatus.REJECTED)}
                      className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold flex items-center justify-center gap-2 border border-red-200"
                    >
                      <XCircleIcon className="w-5 h-5" /> ไม่อนุมัติ
                    </button>
                    <button 
                      onClick={() => handleAction(record.id, AttendanceStatus.APPROVED)}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CheckCircleIcon className="w-5 h-5" /> อนุมัติ
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};