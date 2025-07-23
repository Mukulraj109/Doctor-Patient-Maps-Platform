# Doctor-Patient Maps Platform

A minimal full-stack web application that implements Google Maps API for a doctor-patient platform with location-based search functionality.

## Features

### For Doctors
- Add clinic location using Google Maps (drop a pin or search an address)
- Save clinic's address and geo-coordinates
- Manage doctor profiles with specialty and contact information

### For Patients
- Search for doctors by location (e.g., "JP Nagar")
- View list of doctors near the searched location
- See doctors plotted on an interactive map
- View distance from search location to each clinic


## ENV
# MongoDB Configuration
MONGO_URI=mongodb+srv://mukulraj756:aoX3YeEkwaoZ15gm@cluster0.n9lluzb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=3001
NODE_ENV=development

# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=AlzaSy_I4Q4LMZ9W3_hRs8IT1S-DVYD5sgjijng

# Database Configuration
DATABASE_NAME=doctor_patient_platform

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Lucide React icons
- **Backend**: Express.js with CORS
- **Database**: MongoDB with geospatial indexing
- **Maps**: Google Maps JavaScript API with Places library
- **Geospatial**: MongoDB's $near and $geoWithin queries with 2dsphere index

## Setup Instructions

### 0. MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Ensure MongoDB is running on `mongodb://localhost:27017` (or update the connection string in `server/database.js`)
3. The application will automatically create the database and geospatial index

### 1. Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Replace `YOUR_GOOGLE_MAPS_API_KEY` in the following files:
   - `src/components/DoctorForm.tsx`
   - `src/components/PatientSearch.tsx`

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application

#### Start the Backend Server
```bash
npm run server
```
The server will run on http://localhost:3001

#### Start the Frontend (in a new terminal)
```bash
npm run dev
```
The frontend will run on http://localhost:5173

## API Endpoints

### Doctors
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors` - Add a new doctor
- `DELETE /api/doctors/:id` - Delete a doctor
- `POST /api/doctors/search` - Search doctors by location
- `POST /api/doctors/search-within` - Search doctors by location using $geoWithin

### Search Request Body
```json
{
  "location": "JP Nagar, Bangalore",
  "coordinates": {
    "lat": 12.9081,
    "lng": 77.5831
  },
  "radius": 10
}
```

## Database Schema

### Doctor Document
```javascript
{
  _id: ObjectId("..."),
  name: "Dr. John Doe",
  specialty: "Cardiology",
  phone: "+91 9876543210",
  address: "123 Main St, JP Nagar, Bangalore",
  coordinates: {
    type: "Point",
    coordinates: [77.5831, 12.9081] // [longitude, latitude] for GeoJSON
  },
  location: {
    lat: 12.9081,  // For frontend compatibility
    lng: 77.5831
  },
  createdAt: "2025-01-11T10:30:00.000Z"
}
```

## MongoDB Geospatial Features

The application uses MongoDB's geospatial capabilities:

### 1. Geospatial Index
```javascript
// Automatically created on startup
db.doctors.createIndex({ "coordinates": "2dsphere" });
```

### 2. $near Query (Default Search)
```javascript
db.doctors.find({
  coordinates: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      $maxDistance: radiusInMeters
    }
  }
});
```

### 3. $geoWithin Query (Alternative Search)
```javascript
db.doctors.find({
  coordinates: {
    $geoWithin: {
      $centerSphere: [[longitude, latitude], radiusInRadians]
    }
  }
});
```

## Geospatial Features

- **MongoDB $near**: Finds doctors within specified radius and returns sorted by distance
- **MongoDB $geoWithin**: Finds doctors within circular area using $centerSphere
- **2dsphere Index**: Enables efficient geospatial queries on spherical geometry
- **Distance Calculation**: Uses both MongoDB's built-in distance sorting and Haversine formula
- **Map Visualization**: Interactive map showing search location and doctor clinics

## Production Considerations

1. **API Key Security**: Store Google Maps API key in environment variables
2. **Database**: Configure MongoDB connection string for production
3. **Error Handling**: Add comprehensive error handling
4. **Input Validation**: Validate all user inputs
5. **Rate Limiting**: Implement API rate limiting
6. **Authentication**: Add user authentication if required
7. **HTTPS**: Use HTTPS in production
8. **Deployment**: Configure for production deployment

