import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  phone: String,
  address: String,

  // Optional: keep lat/lng for display (not needed for queries)
  location: {
    lat: Number,
    lng: Number
  },

  // GeoJSON format for geospatial queries
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure geospatial index is created
doctorSchema.index({ coordinates: '2dsphere' });

export const Doctor = mongoose.model('Doctor', doctorSchema);
