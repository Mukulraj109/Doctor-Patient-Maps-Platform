import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Navigation, Clock } from 'lucide-react';
import { loadGoogleMapsScript } from '../utils/googleMapsLoader';

declare global {
  interface Window {
    google: any;
  }
}

interface Doctor {
  id?: string;
  _id?: string;
  name: string;
  specialty: string;
  phone: string;
  address: string;
  coordinates: {
    type?: 'Point';
    coordinates: [number, number]; // [lng, lat]
    lat?: number; // optional fallback
    lng?: number;
  };
  distance?: number;
}


interface SearchResult {
  location: string;
  count: number;
  doctors: Doctor[];
}

const PatientSearch: React.FC = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

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
      document.getElementById('patient-map'),
      {
        zoom: 12,
        center: defaultLocation,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }
    );

    setMap(mapInstance);
  };

  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  const addMarkersToMap = (doctors: Doctor[], searchCoordinates: { lat: number; lng: number }) => {
    if (!map) return;

    clearMarkers();
    const newMarkers: any[] = [];

    // Add search location marker (red)
    const searchMarker = new window.google.maps.Marker({
      position: searchCoordinates,
      map: map,
      title: 'Search Location',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    });
    newMarkers.push(searchMarker);

    // Add doctor markers (blue)
    doctors.forEach((doctor) => {
      const marker = new window.google.maps.Marker({
      position: {
  lat: doctor.coordinates.lat ?? doctor.coordinates.coordinates[1],
  lng: doctor.coordinates.lng ?? doctor.coordinates.coordinates[0],
},

        map: map,
        title: `${doctor.name} - ${doctor.specialty}`,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${doctor.name}</h3>
            <p style="margin: 0 0 4px 0; color: #666;">${doctor.specialty}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;">${doctor.phone}</p>
            <p style="margin: 0; font-size: 12px; color: #888;">${doctor.distance?.toFixed(2)} km away</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(searchCoordinates);
     doctors.forEach((doctor) => {
  bounds.extend({
    lat: doctor.coordinates.lat ?? doctor.coordinates.coordinates[1],
    lng: doctor.coordinates.lng ?? doctor.coordinates.coordinates[0],
  });
});

      map.fitBounds(bounds);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchLocation.trim()) {
      alert('Please enter a location to search');
      return;
    }

    setIsSearching(true);
    setSearchResults(null);

    try {
      // Geocode the search location
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: searchLocation }, async (results: any, status: string) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const coordinates = {
            lat: location.lat(),
            lng: location.lng()
          };

          // Search for doctors near this location
          const response = await fetch('http://localhost:3001/api/doctors/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              location: searchLocation,
              coordinates,
              radius: 10 // 10 km radius
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
            addMarkersToMap(data.doctors, coordinates);
          } else {
            alert('Failed to search for doctors');
          }
        } else {
          alert('Location not found. Please try a different search term.');
        }
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error searching for doctors');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchLocation(e.target.value);
  };

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-300">
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Find Doctors Near You
          </h2>
          <p className="text-gray-600 text-lg">Search for doctors by location and view them on the map</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-6">
          <div className="flex-1">
            <label htmlFor="search-location" className="block text-sm font-semibold text-gray-800 mb-2">
              Location
            </label>
            <input
              type="text"
              id="search-location"
              value={searchLocation}
              onChange={handleLocationInput}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md"
              placeholder="e.g., JP Nagar, Bangalore or specific address"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSearching}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Results */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            Search Results
          </h3>
          
          {searchResults ? (
            <div>
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl shadow-sm">
                <p className="text-sm text-blue-800 font-semibold">
                  Found <strong>{searchResults.count}</strong> doctors near "<strong>{searchResults.location}</strong>"
                </p>
              </div>

              {searchResults.doctors.length > 0 ? (
                <div className="space-y-6">
                  {searchResults.doctors.map((doctor) => (
                    <div key={doctor.id || doctor._id} className="border border-gray-200/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm transform hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{doctor.name}</h4>
                          <p className="text-blue-600 text-sm font-semibold bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full">
                          <Navigation className="w-3 h-3 mr-1 drop-shadow-sm" />
                          {doctor.distance?.toFixed(2)} km away
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start">
                          <div className="p-1 bg-gray-100 rounded-full mr-3 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-600" />
                          </div>
                          <span className="font-medium">{doctor.address}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="p-1 bg-gray-100 rounded-full mr-3">
                            <Phone className="w-3 h-3 text-gray-600" />
                          </div>
                          <span className="font-medium">{doctor.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Doctors Found</h3>
                  <p className="text-gray-600 mb-4 font-medium">No doctors found in this area. Try searching a different location.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700 mb-2">Enter a location to search for doctors</p>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">We'll show you doctors within 10km of your search</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            Map View
          </h3>
          <div
            id="patient-map"
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
          <div className="mt-4 flex items-center justify-between text-xs text-gray-600 bg-gray-50/80 p-3 rounded-xl">
            <div className="flex items-center font-semibold">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 shadow-sm"></div>
              Your Search
            </div>
            <div className="flex items-center font-semibold">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 shadow-sm"></div>
              Doctors Found
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSearch;