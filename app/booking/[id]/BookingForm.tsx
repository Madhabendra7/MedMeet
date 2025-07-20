
'use client';

import { useState, useEffect } from 'react';
import { getDoctorById, getTimeSlots, getCurrentUser, bookAppointment } from '@/lib/auth';
import { sendAppointmentConfirmation } from '@/lib/email';
import type { Doctor, TimeSlot, User } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface BookingFormProps {
  bookingId: string;
}

export default function BookingForm({ bookingId }: BookingFormProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('main');
  const [consultationType, setConsultationType] = useState('clinic');

  const hospitals = [
    { id: 'main', name: 'Main Hospital', location: 'Downtown Medical Center', distance: '2.5 km', fee: 500 },
    { id: 'branch1', name: 'North Branch', location: 'North City Medical Hub', distance: '3.2 km', fee: 450 },
    { id: 'branch2', name: 'South Branch', location: 'South Healthcare Center', distance: '4.1 km', fee: 400 },
    { id: 'nearest', name: 'Nearest Hospital', location: 'Auto-selected based on location', distance: '1.8 km', fee: 350, discount: 50 }
  ];

  useEffect(() => {
    const foundDoctor = getDoctorById(bookingId);
    setDoctor(foundDoctor);
    setUser(getCurrentUser());
    
    if (foundDoctor) {
      const slots = getTimeSlots(foundDoctor.id);
      const available = slots.filter(slot => 
        !slot.isBooked && 
        new Date(slot.date + 'T' + slot.time) > new Date()
      );
      setAvailableSlots(available);
    }
  }, [bookingId]);

  const handleSlotSelection = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowConfirmation(true);
  };

  const handleBooking = async () => {
    if (!selectedSlot || !user) return;
    
    setLoading(true);
    setError('');

    try {
      const appointment = bookAppointment(
        bookingId, 
        user.id, 
        selectedSlot.date, 
        selectedSlot.time
      );

      if (appointment && doctor) {
        await sendAppointmentConfirmation({
          to: user.email,
          doctorName: doctor.name,
          patientName: user.name,
          date: selectedSlot.date,
          time: selectedSlot.time,
          specialization: doctor.specialization
        });

        setSuccess(true);
        setShowConfirmation(false);
        
        // Update available slots
        const updatedSlots = availableSlots.filter(slot => slot.id !== selectedSlot.id);
        setAvailableSlots(updatedSlots);
        setSelectedSlot(null);
      } else {
        setError('Booking failed. The slot may no longer be available.');
      }
    } catch (err) {
      setError('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  const getSlotsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return availableSlots.filter(slot => slot.date === dateString);
  };

  const getSelectedHospital = () => {
    return hospitals.find(h => h.id === selectedHospital) || hospitals[0];
  };

  const getTotalAmount = () => {
    const hospital = getSelectedHospital();
    const consultationFee = consultationType === 'clinic' ? 300 : 500;
    const hospitalFee = hospital.fee;
    const discount = hospital.discount || 0;
    return consultationFee + hospitalFee - discount;
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-red-600 text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Doctor Not Found</h1>
            <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist or may have been removed.</p>
            <Link href="/doctors" className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
              Browse All Doctors
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || user.role !== 'patient') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-lock-line text-yellow-600 text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
            <p className="text-gray-600 mb-6">
              To book appointments, you need to be logged in as a patient. Your health information is secure and private.
            </p>
            <div className="space-y-3">
              <Link href="/login" className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors block whitespace-nowrap">
                Login as Patient
              </Link>
              <Link href="/register?role=patient" className="w-full border border-blue-600 text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors block whitespace-nowrap">
                Create Patient Account
              </Link>
              <Link href="/doctors" className="text-gray-500 hover:text-gray-700 text-sm">
                ← Back to Doctors
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const weekDays = getWeekDays(currentWeekStart);
  const today = new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-check-line text-green-600 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Confirmed!</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Booking Details</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <p><strong>Doctor:</strong> {doctor.name}</p>
                  <p><strong>Specialization:</strong> {doctor.specialization}</p>
                  <p><strong>Date:</strong> {selectedSlot && new Date(selectedSlot.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                  <p><strong>Time:</strong> {selectedSlot?.time}</p>
                  <p><strong>Hospital:</strong> {getSelectedHospital().name}</p>
                  <p><strong>Total Amount:</strong> ₹{getTotalAmount()}</p>
                  <p><strong>Patient:</strong> {user.name}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Your appointment has been successfully booked. A confirmation email has been sent to {user.email}. 
                Please arrive 15 minutes early for your appointment.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="w-5 h-5 flex items-center justify-center mr-2">
                    <i className="ri-shield-check-line text-blue-600"></i>
                  </div>
                  <p className="text-sm text-blue-800">
                    Your health information is secure and private. Only you and your doctor have access to your appointment details.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Link
                  href="/patient/appointments"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors block whitespace-nowrap"
                >
                  View My Appointments
                </Link>
                <Link
                  href="/doctors"
                  className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors block whitespace-nowrap"
                >
                  Book Another Appointment
                </Link>
                <Link
                  href="/"
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Link href={`/doctors/${doctor.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-4">
                    ← Back to Profile
                  </Link>
                  <div className="w-1 h-4 bg-gray-300 mr-4"></div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    <div className="w-4 h-4 flex items-center justify-center mr-1 inline-block">
                      <i className="ri-shield-check-line"></i>
                    </div>
                    Secure & Private Booking
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
              
              {/* Doctor and Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h3>
                  <div className="flex items-center space-x-4">
                    <img
                      src={`https://readdy.ai/api/search-image?query=Professional%20doctor%20portrait%2C%20medical%20professional%20headshot%2C%20friendly%20doctor%20smiling%2C%20healthcare%20provider%20wearing%20white%20coat%2C%20medical%20professional%20photo%2C%20clean%20background%2C%20confident%20doctor%20appearance&width=80&height=80&seq=doc${doctor.id}&orientation=squarish`}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900">{doctor.name}</h4>
                      <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 flex items-center justify-center mr-1">
                            <i className="ri-award-line"></i>
                          </div>
                          {doctor.experience} years experience
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 flex items-center justify-center mr-1">
                            <i className="ri-star-fill text-yellow-400"></i>
                          </div>
                          {doctor.rating} rating
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                  <div className="flex items-center space-x-4">
                    <img
                      src={`https://readdy.ai/api/search-image?query=Happy%20patient%20portrait%2C%20smiling%20person%20in%20casual%20clothes%2C%20friendly%20patient%20photo%2C%20healthcare%20patient%20image%2C%20person%20in%20medical%20setting%2C%20approachable%20patient%20appearance%2C%20clean%20background&width=80&height=80&seq=patient${user.id}&orientation=squarish`}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900">{user.name}</h4>
                      <p className="text-gray-600">{user.email}</p>
                      <p className="text-gray-600">{user.phone}</p>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mt-2 inline-block">
                        Verified Patient
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar and Hospital Selection */}
              <div className="lg:col-span-2 space-y-6">
                {/* Hospital Selection */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Hospital Location</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hospitals.map(hospital => (
                      <div
                        key={hospital.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedHospital === hospital.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedHospital(hospital.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="w-6 h-6 flex items-center justify-center mr-2">
                                <i className="ri-hospital-line text-blue-600"></i>
                              </div>
                              <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                              {hospital.id === 'nearest' && (
                                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium ml-2">
                                  Save ₹{hospital.discount}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{hospital.location}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                <div className="w-4 h-4 flex items-center justify-center mr-1 inline-block">
                                  <i className="ri-map-pin-line"></i>
                                </div>
                                {hospital.distance}
                              </span>
                              <span className="text-sm font-medium text-gray-900">₹{hospital.fee}</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedHospital === hospital.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedHospital === hospital.id && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consultation Type */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Consultation Type</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        consultationType === 'clinic'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setConsultationType('clinic')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 flex items-center justify-center mr-2">
                              <i className="ri-building-line text-blue-600"></i>
                            </div>
                            <h3 className="font-semibold text-gray-900">Clinic Visit</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">In-person consultation</p>
                          <span className="text-sm font-medium text-gray-900">₹300</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          consultationType === 'clinic'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {consultationType === 'clinic' && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        consultationType === 'video'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setConsultationType('video')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 flex items-center justify-center mr-2">
                              <i className="ri-video-line text-blue-600"></i>
                            </div>
                            <h3 className="font-semibold text-gray-900">Video Call</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Online consultation</p>
                          <span className="text-sm font-medium text-gray-900">₹500</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          consultationType === 'video'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {consultationType === 'video' && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar View */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Select Date & Time</h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigateWeek('prev')}
                        className="p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className="ri-arrow-left-line text-gray-600"></i>
                        </div>
                      </button>
                      <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                        {currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => navigateWeek('next')}
                        className="p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className="ri-arrow-right-line text-gray-600"></i>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map(date => {
                      const daySlots = getSlotsForDate(date);
                      const isToday = date.toDateString() === today.toDateString();
                      const isPast = date < today;
                      
                      return (
                        <div key={date.toISOString()} className="min-h-[140px]">
                          <div className={`p-3 rounded-lg border transition-colors ${
                            isToday ? 'bg-blue-50 border-blue-200' : 
                            isPast ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className={`text-sm font-medium mb-3 ${
                              isToday ? 'text-blue-600' : 
                              isPast ? 'text-gray-400' : 'text-gray-900'
                            }`}>
                              {date.getDate()}
                            </div>
                            
                            {!isPast && daySlots.length > 0 && (
                              <div className="space-y-1">
                                {daySlots.slice(0, 3).map(slot => (
                                  <button
                                    key={slot.id}
                                    onClick={() => handleSlotSelection(slot)}
                                    className="w-full text-xs px-2 py-1 rounded whitespace-nowrap cursor-pointer transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  >
                                    {slot.time}
                                  </button>
                                ))}
                                {daySlots.length > 3 && (
                                  <button
                                    onClick={() => {
                                      // Show all slots for this date
                                      const allSlots = daySlots.slice(3);
                                      // You can implement a modal or expand functionality here
                                    }}
                                    className="w-full text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
                                  >
                                    +{daySlots.length - 3} more
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {!isPast && daySlots.length === 0 && (
                              <div className="text-xs text-gray-400 text-center">No slots available</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-information-line"></i>
                      </div>
                      <span>Click on any available time slot to proceed with booking. All appointments are secure and confidential.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Consultation Fee</span>
                      <span className="font-medium">₹{consultationType === 'clinic' ? 300 : 500}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hospital Fee</span>
                      <span className="font-medium">₹{getSelectedHospital().fee}</span>
                    </div>
                    {getSelectedHospital().discount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Discount</span>
                        <span className="font-medium text-green-600">-₹{getSelectedHospital().discount}</span>
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total Amount</span>
                        <span className="font-bold text-lg text-gray-900">₹{getTotalAmount()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700 block mb-1">Patient</label>
                      <p className="text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700 block mb-1">Doctor</label>
                      <p className="text-gray-900">{doctor.name}</p>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700 block mb-1">Hospital</label>
                      <p className="text-gray-900">{getSelectedHospital().name}</p>
                      <p className="text-sm text-gray-600">{getSelectedHospital().location}</p>
                    </div>
                    
                    {selectedSlot && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="text-sm font-medium text-blue-700 block mb-1">Selected Appointment</label>
                        <p className="text-blue-900 font-medium">
                          {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-blue-900">{selectedSlot.time}</p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-shield-check-line text-green-600"></i>
                      </div>
                      <span className="text-sm font-medium text-green-800">Privacy & Security</span>
                    </div>
                    <p className="text-xs text-green-700">
                      Your personal health information is protected and secure. Only you and your doctor have access to your appointment details.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                      <div className="flex items-center">
                        <div className="w-5 h-5 flex items-center justify-center mr-2">
                          <i className="ri-error-warning-line text-red-600"></i>
                        </div>
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {!selectedSlot && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-calendar-check-line text-gray-400 text-xl"></i>
                      </div>
                      <p className="text-sm text-gray-600">
                        Please select a time slot from the calendar to continue with your booking.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Your Appointment</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">{doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedSlot.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hospital:</span>
                <span className="font-medium">{getSelectedHospital().name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-lg">₹{getTotalAmount()}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                Please arrive 15 minutes early for your appointment. You will receive a confirmation email after booking.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}