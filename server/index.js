import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase} from './database.js';
import { ObjectId } from 'mongodb';
import { Doctor } from './models/Doctor.js'; 
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Connect to MongoDB on startup
connectToDatabase().catch(console.error);



// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Routes

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});



app.post('/api/doctors', async (req, res) => {
  try {
    const { name, specialty, phone, address, coordinates } = req.body;

    if (
      !coordinates ||
      typeof coordinates.lat !== 'number' ||
      typeof coordinates.lng !== 'number' ||
      isNaN(coordinates.lat) ||
      isNaN(coordinates.lng)
    ) {
      return res.status(400).json({ error: 'Invalid or missing coordinates. lat/lng must be valid numbers.' });
    }

    const lat = coordinates.lat;
    const lng = coordinates.lng;

    const newDoctor = new Doctor({
      name,
      specialty,
      phone,
      address,
      coordinates: {
        type: "Point",
        coordinates: [lng, lat]
      },
      location: {
        lat,
        lng
      }
    });

    const savedDoctor = await newDoctor.save();

    res.status(201).json({
      ...savedDoctor.toObject(),
      id: savedDoctor._id.toString()
    });
  } catch (error) {
    console.error('Error adding doctor:', error);
    res.status(500).json({ error: 'Failed to add doctor' });
  }
});


// Search doctors by location
app.post('/api/doctors/search', async (req, res) => {
  try {
    const { location, coordinates, radius = 10 } = req.body; // radius in km

    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const searchLat = parseFloat(coordinates.lat);
    const searchLng = parseFloat(coordinates.lng);
    const radiusInMeters = radius * 1000; // Convert km to meters

    // Mongoose geospatial query using $near
    const nearbyDoctors = await Doctor.find({
      coordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [searchLng, searchLat] // [lng, lat]
          },
          $maxDistance: radiusInMeters
        }
      }
    });

    // Add distance calculation for display
    const doctorsWithDistance = nearbyDoctors.map(doctor => {
      const distance = calculateDistance(
        searchLat,
        searchLng,
        doctor.location.lat,
        doctor.location.lng
      );

      return {
        ...doctor.toObject(),
        id: doctor._id.toString(),
        coordinates: doctor.location,
        distance: Math.round(distance * 100) / 100
      };
    });

    res.json({
      location,
      count: doctorsWithDistance.length,
      doctors: doctorsWithDistance
    });
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ error: 'Failed to search doctors' });
  }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    const result = await Doctor.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});


app.post('/api/doctors/search-within', async (req, res) => {
  try {
    const { location, coordinates, radius = 10 } = req.body;

    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const searchLat = parseFloat(coordinates.lat);
    const searchLng = parseFloat(coordinates.lng);
    const radiusInRadians = radius / 6371; // Earth's radius in km

    // Mongoose query using $geoWithin
    const doctorsWithin = await Doctor.find({
      coordinates: {
        $geoWithin: {
          $centerSphere: [[searchLng, searchLat], radiusInRadians]
        }
      }
    });

    const doctorsWithDistance = doctorsWithin.map(doc => {
      const distance = calculateDistance(
        searchLat,
        searchLng,
        doc.location.lat,
        doc.location.lng
      );

      return {
        ...doc.toObject(),
        id: doc._id.toString(),
        coordinates: doc.location,
        distance: Math.round(distance * 100) / 100
      };
    }).sort((a, b) => a.distance - b.distance);

    res.json({
      location,
      count: doctorsWithDistance.length,
      doctors: doctorsWithDistance,
      queryType: '$geoWithin'
    });

  } catch (error) {
    console.error('Error searching doctors with $geoWithin:', error);
    res.status(500).json({ error: 'Failed to search doctors' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});