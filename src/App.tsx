import React, { useState } from 'react';
import { MapPin, Stethoscope, Search, Plus } from 'lucide-react';
import DoctorForm from './components/DoctorForm';
import PatientSearch from './components/PatientSearch';
import DoctorList from './components/DoctorList';

function App() {
  const [activeTab, setActiveTab] = useState<'doctor' | 'patient' | 'list'>('doctor');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent ml-3">
                MedMap Platform
              </h1>
            </div>
            <div className="text-sm text-gray-600 font-medium px-4 py-2 bg-white/50 rounded-full backdrop-blur-sm">
              Doctor-Patient Location Platform
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('doctor')}
              className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'doctor'
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50 rounded-t-lg shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 rounded-t-lg'
              }`}
            >
              <Plus className="inline w-4 h-4 mr-2 drop-shadow-sm" />
              Add Doctor
            </button>
            <button
              onClick={() => setActiveTab('patient')}
              className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'patient'
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50 rounded-t-lg shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 rounded-t-lg'
              }`}
            >
              <Search className="inline w-4 h-4 mr-2 drop-shadow-sm" />
              Find Doctors
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50 rounded-t-lg shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 rounded-t-lg'
              }`}
            >
              <MapPin className="inline w-4 h-4 mr-2 drop-shadow-sm" />
              All Doctors
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'doctor' && <DoctorForm />}
        {activeTab === 'patient' && <PatientSearch />}
        {activeTab === 'list' && <DoctorList />}
      </main>
    </div>
  );
}

export default App;