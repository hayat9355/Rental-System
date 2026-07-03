import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  floor: number;
  type: 'single' | 'double' | 'suite' | 'studio';
  monthlyRent: number;
  status: 'available' | 'occupied' | 'maintenance';
  description: string;
  amenities: string[];
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor is required'],
      min: [0, 'Floor cannot be negative'],
    },
    type: {
      type: String,
      enum: ['single', 'double', 'suite', 'studio'],
      required: [true, 'Room type is required'],
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: [0, 'Rent cannot be negative'],
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance'],
      default: 'available',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    amenities: [{
      type: String,
      trim: true,
    }],
    size: {
      type: Number,
      min: [0, 'Size cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRoom>('Room', roomSchema);
