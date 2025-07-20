'use client';

import { useState, useEffect } from 'react';
import { getDoctorById, getTimeSlots, getCurrentUser } from '@/lib/auth';
import type { Doctor, TimeSlot } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface DoctorProfileProps {
  doctorId: string;
}

export default function DoctorProfile({ doctorId }: DoctorProfileProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const foundDoctor = getDoctorById(doctorId);
    setDoctor(foundDoctor);
    
    if (foundDoctor) {
      const slots = getTimeSlots(foundDoctor.id);
      setTimeSlots(slots.filter(slot => !slot.isBooked));
    }
    
    setUser(getCurrentUser());
  }, [doctorId]);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Doctor not found</h1>
            <Link href="/doctors" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
              Back to doctors
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const upcomingSlots = timeSlots
    .filter(slot => new Date(slot.date + 'T' + slot.time) > new Date())
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12">
            <div className="flex items-center">
              <img
                src={`https://readdy.ai/api/search-image?query=Professional%20doctor%20portrait%2C%20medical%20professional%20headshot%2C%20friendly%20doctor%20smiling%2C%20healthcare%20provider%20wearing%20white%20coat%2C%20medical%20professional%20photo%2C%20clean%20background%2C%20confident%20doctor%20appearance&width=120&height=120&seq=doc${doctor.id}&orientation=squarish`}
                alt={doctor.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white mr-6"
              />
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{doctor.name}</h1>
                <p className="text-blue-100 text-lg mb-2">{doctor.specialization}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                      <i className="ri-award-line"></i>
                    </div>
                    {doctor.experience} years exp.
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                      <i className="ri-star-fill text-yellow-300"></i>
                    </div>
                    {doctor.rating} rating
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Doctor Information */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">About Dr. {doctor.name.split(' ').pop()}</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Dr. {doctor.name.split(' ').pop()} is a highly experienced {doctor.specialization.toLowerCase()} specialist with {doctor.experience} years of practice. 
                    Committed to providing exceptional patient care and staying current with the latest medical advances in {doctor.specialization.toLowerCase()}.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Specialization</h3>
                      <p className="text-gray-600">{doctor.specialization}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                      <p className="text-gray-600">{doctor.experience} years</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Rating</h3>
                      <div className="flex items-center">
                        <span className="text-gray-600">{doctor.rating}</span>
                        <div className="w-4 h-4 flex items-center justify-center ml-1">
                          <i className="ri-star-fill text-yellow-400"></i>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                      <p className="text-gray-600">{doctor.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Available Slots */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Available Time Slots</h2>
                  {upcomingSlots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcomingSlots.map(slot => (
                        <div key={slot.id} className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <div className="text-sm text-blue-600 font-medium mb-1">
                            {new Date(slot.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {slot.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-calendar-line text-gray-400 text-xl"></i>
                      </div>
                      <p className="text-gray-600">No available slots at the moment</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-blue-50 p-6 rounded-lg sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Appointment</h3>
                  
                  {user ? (
                    user.role === 'patient' ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Ready to book an appointment with Dr. {doctor.name.split(' ').pop()}?
                        </p>
                        <Link
                          href={`/booking/${doctor.id}`}
                          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors text-center block whitespace-nowrap"
                        >
                          Book Now
                        </Link>
                        <div className="text-xs text-gray-500 text-center">
                          You'll receive email confirmation after booking
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          You're logged in as a doctor. Only patients can book appointments.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Please log in or create an account to book an appointment.
                      </p>
                      <Link
                        href="/login"
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors text-center block whitespace-nowrap"
                      >
                        Login to Book
                      </Link>
                      <Link
                        href="/register?role=patient"
                        className="w-full border border-blue-600 text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors text-center block whitespace-nowrap"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}