
'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getAppointments, cancelAppointment } from '@/lib/auth';
import type { User, Appointment } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PatientAppointments() {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'patient') {
      window.location.href = '/login';
      return;
    }

    setUser(currentUser);
    const patientAppointments = getAppointments(currentUser.id, 'patient');
    setAppointments(patientAppointments);
    setLoading(false);
  }, []);

  const handleCancelAppointment = (appointmentId: string) => {
    setCancellingId(appointmentId);
    
    if (cancelAppointment(appointmentId)) {
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
      ));
      setCancelSuccess(appointmentId);
      setTimeout(() => setCancelSuccess(null), 3000);
    }
    
    setCancellingId(null);
    setShowCancelConfirm(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-loader-4-line text-blue-600 text-2xl animate-spin"></i>
            </div>
            <p className="text-gray-600">Loading your appointments...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' && new Date(apt.date + 'T' + apt.time) > new Date()
  );

  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || 
    (apt.status === 'scheduled' && new Date(apt.date + 'T' + apt.time) <= new Date())
  );

  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600 mt-2">Manage your scheduled appointments and medical visits securely.</p>
          </div>
          <Link
            href="/doctors"
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center mr-2 inline-block">
              <i className="ri-add-line"></i>
            </div>
            Book New Appointment
          </Link>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="w-5 h-5 flex items-center justify-center mr-3">
              <i className="ri-shield-check-line text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm text-blue-800">
                <strong>Privacy & Security:</strong> Your appointment information is secure and private. Only you and your healthcare providers have access to this information.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {cancelSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 flex items-center justify-center mr-3">
                <i className="ri-check-line text-green-600"></i>
              </div>
              <p className="text-sm text-green-800">
                <strong>Success!</strong> Your appointment has been cancelled successfully.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-check-line text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-check-line text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{pastAppointments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-close-line text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{cancelledAppointments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Appointments</h2>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={`https://readdy.ai/api/search-image?query=Professional%20doctor%20portrait%2C%20medical%20professional%20headshot%2C%20friendly%20doctor%20smiling%2C%20healthcare%20provider%20wearing%20white%20coat%2C%20medical%20professional%20photo%2C%20clean%20background%2C%20confident%20doctor%20appearance&width=60&height=60&seq=doc${appointment.doctorId}&orientation=squarish`}
                        alt={appointment.doctorName}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-blue-600 font-medium">{appointment.specialization}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-600 mt-2">
                          <div className="flex items-center">
                            <div className="w-4 h-4 flex items-center justify-center mr-1">
                              <i className="ri-calendar-line"></i>
                            </div>
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 flex items-center justify-center mr-1">
                              <i className="ri-time-line"></i>
                            </div>
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        Confirmed
                      </span>
                      <button
                        onClick={() => setShowCancelConfirm(appointment.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        <strong>Reminder:</strong> Please arrive 15 minutes early for your appointment
                      </p>
                      <Link
                        href={`/doctors/${appointment.doctorId}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Doctor Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-calendar-line text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Appointments</h3>
              <p className="text-gray-600 mb-6">
                You don't have any scheduled appointments. Book one with our qualified doctors to get started.
              </p>
              <Link
                href="/doctors"
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Find & Book Doctor
              </Link>
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical History</h2>
            
            <div className="space-y-4">
              {pastAppointments.slice(0, 3).map(appointment => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={`https://readdy.ai/api/search-image?query=Professional%20doctor%20portrait%2C%20medical%20professional%20headshot%2C%20friendly%20doctor%20smiling%2C%20healthcare%20provider%20wearing%20white%20coat%2C%20medical%20professional%20photo%2C%20clean%20background%2C%20confident%20doctor%20appearance&width=60&height=60&seq=doc${appointment.doctorId}&orientation=squarish`}
                        alt={appointment.doctorName}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-blue-600 font-medium">{appointment.specialization}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-600 mt-2">
                          <div className="flex items-center">
                            <div className="w-4 h-4 flex items-center justify-center mr-1">
                              <i className="ri-calendar-line"></i>
                            </div>
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 flex items-center justify-center mr-1">
                              <i className="ri-time-line"></i>
                            </div>
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Appointments */}
        {cancelledAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cancelled Appointments</h2>
            
            <div className="space-y-4">
              {cancelledAppointments.slice(0, 2).map(appointment => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={`https://readdy.ai/api/search-image?query=Professional%20doctor%20portrait%2C%20medical%20professional%20headshot%2C%20friendly%20doctor%20smiling%2C%20healthcare%20provider%20wearing%20white%20coat%2C%20medical%20professional%20photo%2C%20clean%20background%2C%20confident%20doctor%20appearance&width=60&height=60&seq=doc${appointment.doctorId}&orientation=squarish`}
                        alt={appointment.doctorName}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-blue-600 font-medium">{appointment.specialization}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-600 mt-2">
                          <div className="flex items-center">
                            <div className="w-4 h-4 flex items-center justify-center mr-1">
                              <i className="ri-calendar-line"></i>
                            </div>
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 flex items-center justify-center mr-1">
                              <i className="ri-time-line"></i>
                            </div>
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                      Cancelled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <i className="ri-error-warning-line text-red-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Appointment</h3>
                <p className="text-sm text-gray-600">Are you sure you want to cancel this appointment?</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Cancelling this appointment will make the time slot available for other patients.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelConfirm(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Keep Appointment
              </button>
              <button
                onClick={() => handleCancelAppointment(showCancelConfirm)}
                disabled={cancellingId === showCancelConfirm}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
              >
                {cancellingId === showCancelConfirm ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
