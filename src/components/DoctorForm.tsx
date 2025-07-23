import React, { useState, useEffect } from 'react';
import { MapPin, Save, Check } from 'lucide-react';
import { loadGoogleMapsScript } from '../utils/googleMapsLoader';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface Coordinates {
  lat: number;
  lng: number;
}

const DoctorForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    address: ''
  });
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        initializeMap();
      })
      .catch((error) => {
        console.error('Failed to load Google Maps:', error);
      });
  }, []);

  const initializeMap = () => {
    const defaultLocation = { lat: 12.9716, lng: 77.5946 }; // Bangalore, India
    
    const mapInstance = new window.google.maps.Map(
      document.getElementById('doctor-map'),
      {
        zoom: 12,
        center: defaultLocation,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }
    );

    setMap(mapInstance);

    // Add click listener to map
    mapInstance.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      setCoordinates({ lat, lng });
      
      // Remove existing marker
      if (marker) {
        marker.setMap(null);
      }
      
      // Add new marker
      const newMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        title: 'Clinic Location',
        animation: window.google.maps.Animation.DROP,
      });
      
      setMarker(newMarker);
      
      // Reverse geocode to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
        if (status === 'OK' && results[0]) {
          setFormData(prev => ({
            ...prev,
            address: results[0].formatted_address
          }));
        }
      });
    });

    // Add places search box
    const searchBox = new window.google.maps.places.SearchBox(
      document.getElementById('address-search') as HTMLInputElement
    );
    
    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;
      
      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;
      
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      setCoordinates({ lat, lng });
      setFormData(prev => ({
        ...prev,
        address: place.formatted_address || ''
      }));
      
      // Remove existing marker
      if (marker) {
        marker.setMap(null);
      }
      
      // Add new marker
      const newMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        title: 'Clinic Location',
        animation: window.google.maps.Animation.DROP,
      });
      
      setMarker(newMarker);
      
      // Center map on the place
      mapInstance.setCenter({ lat, lng });
      mapInstance.setZoom(15);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coordinates) {
      alert('Please select a location on the map');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          coordinates
        }),
      });
      
      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: '', specialty: '', phone: '', address: '' });
        setCoordinates(null);
        if (marker) {
          marker.setMap(null);
          setMarker(null);
        }
        
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        alert('Failed to add doctor');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          Add Doctor & Clinic Location
        </h2>
        <p className="text-gray-600 text-lg">Enter doctor details and select clinic location on the map</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                Doctor Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md"
                placeholder="Dr. John Doe"
              />
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-semibold text-gray-800 mb-2">
                Specialty *
              </label>
              <select
                id="specialty"
                name="specialty"
                required
                value={formData.specialty}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <option value="">Select Specialty</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Gynecology">Gynecology</option>
                <option value="Neurology">Neurology</option>
                <option value="Psychiatry">Psychiatry</option>
              </select>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label htmlFor="address-search" className="block text-sm font-semibold text-gray-800 mb-2">
                Search Address
              </label>
              <input
                type="text"
                id="address-search"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md"
                placeholder="Search for clinic address..."
              />
              <p className="text-xs text-gray-600 mt-2 font-medium">Search or click on the map to select location</p>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-2">
                Selected Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md resize-none"
                placeholder="Clinic address will appear here when you select a location"
                readOnly
              />
            </div>

            {coordinates && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="p-1 bg-green-500 rounded-full mr-3">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-green-800">Location Selected</span>
                </div>
                <p className="text-xs text-green-700 mt-2 font-medium">
                  Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !coordinates}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                  Adding Doctor...
                </>
              ) : submitSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Added Successfully!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Doctor
                </>
              )}
            </button>
          </form>
        </div>

        {/* Map */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            Select Clinic Location
          </h3>
          <div
            id="doctor-map"
            className="w-full h-96 rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden backdrop-blur-sm"
            style={{ minHeight: '400px' }}
          >
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="font-semibold">Loading Google Maps...</p>
                <small className="block mt-2 text-xs text-gray-500">
                  Interactive map loading...
                </small>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-3 font-medium bg-blue-50/50 p-3 rounded-lg">
            Click on the map or search for an address to select the clinic location
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorForm;