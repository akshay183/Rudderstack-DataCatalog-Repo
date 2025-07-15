import { Request, Response } from 'express';
import Event from '../models/Event';
import TrackingPlan from '../models/TrackingPlan';

export const create_event = async (req: Request, res: Response) => {
  try {
    const { name, type, description, validation } = req.body;
    if (type !== 'track' && name) {
      return res.status(400).json({ message: "Event name must be empty if type is not 'track'" });
    }
    const event = new Event({ name, type, description, validation });
    await event.save();
    res.status(201).json(event);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Event with this name and type already exists.' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const get_all_events = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const get_event_by_id = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update_event = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const delete_event = async (req: Request, res: Response) => {
    try {
      const event_id = req.params.id;
      const tracking_plans = await TrackingPlan.find({ 'events.event': event_id });

      if (tracking_plans.length > 0) {
        return res.status(400).json({ message: 'Cannot delete event that is part of a tracking plan.' });
      }

      const event = await Event.findByIdAndDelete(event_id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
