import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Trash2, Stethoscope } from 'lucide-react';

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  phone: string;
  address: string;
  location?: {
    lat: number;
    lng: number;
  };
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt?: string;
}

const DoctorList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/doctors');
      if (response.ok) {
        let data = await response.json();

        // Convert coordinates to { lat, lng } format for display
        data = data.map((doctor: Doctor) => ({
          ...doctor,
          location: {
            lat: doctor.coordinates?.coordinates[1] ?? 0,
            lng: doctor.coordinates?.coordinates[0] ?? 0,
          },
        }));

        setDoctors(data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/doctors/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDoctors((prev) => prev.filter((doctor) => doctor._id !== id));
      } else {
        alert('Failed to delete doctor');
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Error deleting doctor');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          All Registered Doctors
        </h2>
        <p className="text-gray-600 text-lg">Complete list of doctors and their clinic locations</p>
      </div>

      {doctors.length > 0 ? (
        <>
          <div className="mb-6 text-sm text-gray-600 font-semibold bg-blue-50/50 p-3 rounded-xl">
            Total: {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="border border-gray-200/50 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md mr-3">
                      <Stethoscope className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                      <p className="text-blue-600 text-sm font-semibold bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">
                        {doctor.specialty}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doctor._id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-all duration-200 transform hover:scale-110"
                    title="Delete doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <div className="p-1 bg-gray-100 rounded-full mr-3">
                      <Phone className="w-3 h-3 text-gray-600" />
                    </div>
                    <span className="font-medium">{doctor.phone}</span>
                  </div>

                  <div className="flex items-start">
                    <div className="p-1 bg-gray-100 rounded-full mr-3 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-600" />
                    </div>
                    <span className="line-clamp-2 font-medium">{doctor.address}</span>
                  </div>

                  <div className="text-xs text-gray-500 pt-3 border-t border-gray-200/50 bg-gray-50/50 p-2 rounded-lg">
                    Coordinates:{' '}
                    {doctor.location?.lat && doctor.location?.lng
                      ? `${doctor.location.lat.toFixed(4)}, ${doctor.location.lng.toFixed(4)}`
                      : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Stethoscope className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">No Doctors Registered</h3>
          <p className="text-gray-600 mb-6 font-medium">
            No doctors have been added to the platform yet.
          </p>
          <p className="text-sm text-gray-500 bg-blue-50/50 p-4 rounded-xl">
            Use the "Add Doctor" tab to register the first doctor.
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorList;
