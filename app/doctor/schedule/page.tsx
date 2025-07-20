'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getTimeSlots, createTimeSlot, deleteTimeSlot } from '@/lib/auth';
import type { User, TimeSlot } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DoctorSchedule() {
  const [user, setUser] = useState<User | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: ''
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'doctor') {
      window.location.href = '/login';
      return;
    }

    setUser(currentUser);
    const doctorSlots = getTimeSlots(currentUser.id);
    setTimeSlots(doctorSlots);
    setLoading(false);
  }, []);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSlot.date || !newSlot.time) return;

    const slot = createTimeSlot(user.id, newSlot.date, newSlot.time);
    setTimeSlots([...timeSlots, slot]);
    setNewSlot({ date: '', time: '' });
    setShowAddForm(false);
  };

  const handleDeleteSlot = (slotId: string) => {
    if (deleteTimeSlot(slotId)) {
      setTimeSlots(timeSlots.filter(slot => slot.id !== slotId));
    }
  };

  const getSlotsByDate = () => {
    const grouped: { [date: string]: TimeSlot[] } = {};
    timeSlots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    
    // Sort dates and times
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.time.localeCompare(b.time));
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const slotsByDate = getSlotsByDate();
  const sortedDates = Object.keys(slotsByDate).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Schedule</h1>
            <p className="text-gray-600 mt-2">Add and manage your available time slots.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            Add Time Slot
          </button>
        </div>

        {/* Add Slot Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Time Slot</h3>
              
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <select
                    id="time"
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={newSlot.time}
                    onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                    required
                  >
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="09:30">9:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="14:30">2:30 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="15:30">3:30 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="16:30">4:30 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Add Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Display */}
        {sortedDates.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {slotsByDate[date].map(slot => (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-lg border ${
                        slot.isBooked
                          ? 'bg-red-50 border-red-200'
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{slot.time}</p>
                          <p className={`text-sm ${
                            slot.isBooked ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {slot.isBooked ? 'Booked' : 'Available'}
                          </p>
                        </div>
                        
                        {!slot.isBooked && (
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-red-600 hover:text-red-700 cursor-pointer"
                          >
                            <div className="w-5 h-5 flex items-center justify-center">
                              <i className="ri-delete-bin-line"></i>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-calendar-line text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No time slots available</h3>
            <p className="text-gray-600 mb-6">
              Start by adding your available time slots for patients to book appointments.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Add Your First Time Slot
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}