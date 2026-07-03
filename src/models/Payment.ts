import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
  tenant: Types.ObjectId;
  room: Types.ObjectId;
  amount: number;
  paymentType: 'rent' | 'deposit' | 'utility' | 'late_fee' | 'other';
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'card';
  paymentDate: Date;
  periodStart: Date;
  periodEnd: Date;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  receiptNumber: string;
  notes: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant is required'],
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentType: {
      type: String,
      enum: ['rent', 'deposit', 'utility', 'late_fee', 'other'],
      default: 'rent',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'],
      required: [true, 'Payment method is required'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
    },
    periodStart: {
      type: Date,
      required: [true, 'Period start date is required'],
    },
    periodEnd: {
      type: Date,
      required: [true, 'Period end date is required'],
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue', 'partial'],
      default: 'pending',
    },
    receiptNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recorded by is required'],
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ tenant: 1 });
paymentSchema.index({ room: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ receiptNumber: 1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
