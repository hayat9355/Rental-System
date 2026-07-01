import { Request, Response } from 'express';
import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';
import Room from '../models/Room.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sort = (req.query.sort as string) || 'paymentDate';
    const order = (req.query.order as string) === 'asc' ? 1 : -1;

    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.tenant) filter.tenant = req.query.tenant;
    if (req.query.room) filter.room = req.query.room;
    if (req.query.paymentType) filter.paymentType = req.query.paymentType;
    if (req.query.startDate && req.query.endDate) {
      filter.paymentDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('tenant', 'firstName lastName email phone')
        .populate('room', 'roomNumber floor type')
        .populate('recordedBy', 'name email')
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payments',
    });
  }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('tenant', 'firstName lastName email phone')
      .populate('room', 'roomNumber floor type')
      .populate('recordedBy', 'name email');
    
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payment',
    });
  }
};

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenant = await Tenant.findById(req.body.tenant);
    if (!tenant) {
      res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
      return;
    }

    const room = await Room.findById(req.body.room);
    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      ...req.body,
      receiptNumber,
      recordedBy: req.user?._id,
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('tenant', 'firstName lastName email phone')
      .populate('room', 'roomNumber floor type')
      .populate('recordedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: { payment: populatedPayment },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error recording payment',
    });
  }
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('tenant', 'firstName lastName email phone')
      .populate('room', 'roomNumber floor type')
      .populate('recordedBy', 'name email');

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: { payment },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating payment',
    });
  }
};

export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting payment',
    });
  }
};

export const getPaymentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          paymentDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalRevenue = await Payment.aggregate([
      {
        $match: { status: 'paid' },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: stats.reduce((acc: any, curr: any) => {
          acc[curr._id] = {
            count: curr.count,
            totalAmount: curr.totalAmount,
          };
          return acc;
        }, {}),
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payment statistics',
    });
  }
};

export const getUnpaidPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {
      status: { $in: ['pending', 'overdue'] },
    };

    if (req.query.tenant) filter.tenant = req.query.tenant;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('tenant', 'firstName lastName email phone')
        .populate('room', 'roomNumber floor type monthlyRent')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching unpaid payments',
    });
  }
};
