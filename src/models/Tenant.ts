import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITenant extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  room: Types.ObjectId;
  leaseStart: Date;
  leaseEnd: Date;
  depositAmount: number;
  status: 'active' | 'inactive' | 'pending';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    idNumber: {
      type: String,
      required: [true, 'ID number is required'],
      unique: true,
      trim: true,
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Emergency contact phone is required'],
        trim: true,
      },
      relationship: {
        type: String,
        required: [true, 'Relationship is required'],
        trim: true,
      },
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    leaseStart: {
      type: Date,
      required: [true, 'Lease start date is required'],
    },
    leaseEnd: {
      type: Date,
      required: [true, 'Lease end date is required'],
    },
    depositAmount: {
      type: Number,
      required: [true, 'Deposit amount is required'],
      min: [0, 'Deposit cannot be negative'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

tenantSchema.index({ email: 1 });
tenantSchema.index({ room: 1 });
tenantSchema.index({ status: 1 });

export default mongoose.model<ITenant>('Tenant', tenantSchema);
