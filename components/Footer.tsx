'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold text-blue-600 mb-4">
              <span className="font-pacifico">HealthCare</span>
            </div>
            <p className="text-gray-600 mb-4">
              Your trusted partner in healthcare. Book appointments with qualified doctors and manage your health with ease.
            </p>
            <div className="flex space-x-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-facebook-fill text-blue-600 text-xl"></i>
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-twitter-fill text-blue-400 text-xl"></i>
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-instagram-fill text-pink-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-600 hover:text-blue-600">Home</a></li>
              <li><a href="/doctors" className="text-gray-600 hover:text-blue-600">Find Doctors</a></li>
              <li><a href="/about" className="text-gray-600 hover:text-blue-600">About Us</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-blue-600">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600">
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  <i className="ri-phone-line"></i>
                </div>
                +1 (555) 123-4567
              </li>
              <li className="flex items-center text-gray-600">
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  <i className="ri-mail-line"></i>
                </div>
                info@healthcare.com
              </li>
              <li className="flex items-center text-gray-600">
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  <i className="ri-map-pin-line"></i>
                </div>
                123 Health St, Medical City
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>&copy; 2024 HealthCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}