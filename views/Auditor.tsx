import React, { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { getRecords, formatDate, formatTime } from '../utils';
import { FileTextIcon } from '../components/Icons';

export const AuditorView: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const allRecords = getRecords();
    // Filter only Approved records for reimbursement
    setRecords(allRecords.filter(r => r.status === AttendanceStatus.APPROVED));
  }, []);

  const totalWage = records.reduce((sum, r) => sum + r.dailyWage, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">สรุปการเบิกจ่ายค่าจ้าง</h2>
          <p className="text-gray-500">เฉพาะรายการที่ผ่านการอนุมัติแล้วเท่านั้น</p>
        </div>
        <button 
          onClick={handlePrint}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm transition-colors"
        >
          <FileTextIcon className="w-4 h-4" /> พิมพ์รายงาน
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium mb-1">จำนวนรายการ</p>
          <p className="text-3xl font-bold text-blue-900">{records.length}</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium mb-1">ยอดรวมค่าจ้าง</p>
          <p className="text-3xl font-bold text-green-900">฿{totalWage.toLocaleString()}</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium mb-1">วันที่ออกรายงาน</p>
          <p className="text-xl font-bold text-purple-900 mt-2">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-3">วันที่</th>
                <th className="px-6 py-3">พนักงาน</th>
                <th className="px-6 py-3 text-center">เวลาเข้า-ออก</th>
                <th className="px-6 py-3 text-right">ค่าจ้าง (บาท)</th>
                <th className="px-6 py-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{formatDate(record.date)}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{record.userName}</div>
                    <div className="text-xs text-gray-400">ID: {record.userId}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                      {formatTime(record.clockInTime)} - {formatTime(record.clockOutTime)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {record.dailyWage.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      อนุมัติแล้ว
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูลการเบิกจ่าย</td>
                </tr>
              )}
            </tbody>
            {records.length > 0 && (
              <tfoot className="bg-gray-50 font-bold text-gray-900">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right">รวมทั้งหมด</td>
                  <td className="px-6 py-4 text-right">{totalWage.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-400 hidden print:block">
        <p>เอกสารนี้สร้างโดยระบบอัตโนมัติ | พิมพ์เมื่อ {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};
