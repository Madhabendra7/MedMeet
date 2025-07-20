'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function Home() {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white min-h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20medical%20facility%20interior%20with%20clean%20white%20walls%2C%20professional%20healthcare%20environment%2C%20natural%20lighting%2C%20medical%20equipment%20in%20background%2C%20minimalist%20design%2C%20high-tech%20hospital%20setting%2C%20professional%20healthcare%20atmosphere&width=1920&height=1080&seq=hero1&orientation=landscape')`
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Health,
                <br />
                <span className="text-blue-200">Our Priority</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                Book appointments with qualified doctors, manage your healthcare journey, and get the medical attention you deserve. Simple, fast, and secure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  user.role === 'patient' ? (
                    <Link href="/doctors" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors text-center whitespace-nowrap">
                      Book Appointment
                    </Link>
                  ) : (
                    <Link href="/doctor/dashboard" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors text-center whitespace-nowrap">
                      Go to Dashboard
                    </Link>
                  )
                ) : (
                  <>
                    <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors text-center whitespace-nowrap">
                      Get Started
                    </Link>
                    <Link href="/doctors" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center whitespace-nowrap">
                      Find Doctors
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="lg:flex justify-end hidden">
              <img 
                src="https://readdy.ai/api/search-image?query=Professional%20diverse%20team%20of%20doctors%20and%20medical%20staff%20in%20modern%20hospital%20setting%2C%20wearing%20white%20coats%20and%20stethoscopes%2C%20friendly%20and%20approachable%20expressions%2C%20medical%20professionals%20smiling%2C%20healthcare%20team%20portrait%2C%20clean%20medical%20environment%20background&width=600&height=400&seq=hero2&orientation=landscape"
                alt="Healthcare Team"
                className="rounded-2xl shadow-2xl object-cover w-full max-w-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose HealthCare?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience healthcare booking like never before with our comprehensive platform designed for patients and doctors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-calendar-check-line text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Easy Booking</h3>
              <p className="text-gray-600 leading-relaxed">
                Book appointments with your preferred doctors in just a few clicks. View available time slots and choose what works best for you.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-user-heart-line text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Qualified Doctors</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with experienced and qualified doctors across various specializations. All our doctors are verified and certified.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-shield-check-line text-purple-600 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Secure & Private</h3>
              <p className="text-gray-600 leading-relaxed">
                Your health information is protected with industry-standard security measures. We prioritize your privacy and data protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting healthcare has never been easier. Follow these simple steps to book your appointment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Register Account</h3>
              <p className="text-gray-600">
                Create your account as a patient or doctor in just a few minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Find Doctor</h3>
              <p className="text-gray-600">
                Browse through our list of qualified doctors and their specializations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Book Appointment</h3>
              <p className="text-gray-600">
                Select an available time slot that fits your schedule.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Confirmation</h3>
              <p className="text-gray-600">
                Receive email confirmation with all appointment details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of patients and doctors who trust HealthCare for their medical appointment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <>
                <Link href="/register?role=patient" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap">
                  Register as Patient
                </Link>
                <Link href="/register?role=doctor" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors whitespace-nowrap">
                  Join as Doctor
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}