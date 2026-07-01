import { Request, Response } from 'express';
import Room from '../models/Room.js';
import Tenant from '../models/Tenant.js';

export const getAllRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string) === 'asc' ? 1 : -1;

    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.floor) filter.floor = parseInt(req.query.floor as string);

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit),
      Room.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        rooms,
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
      message: error.message || 'Error fetching rooms',
    });
  }
};

export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { room },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching room',
    });
  }
};

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating room',
    });
  }
};

export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: { room },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating room',
    });
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    const activeTenant = await Tenant.findOne({ room: room._id, status: 'active' });
    if (activeTenant) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete room with active tenant',
      });
      return;
    }

    await Room.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting room',
    });
  }
};

export const getRoomStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Room.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRooms = await Room.countDocuments();
    const totalRent = await Room.aggregate([
      { $group: { _id: null, total: { $sum: '$monthlyRent' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: stats.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        totalRooms,
        totalMonthlyRent: totalRent[0]?.total || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching room statistics',
    });
  }
};
