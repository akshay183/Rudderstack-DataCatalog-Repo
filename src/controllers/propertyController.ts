import { Request, Response } from 'express';
import Property from '../models/Property';
import TrackingPlan from '../models/TrackingPlan';

export const create_property = async (req: Request, res: Response) => {
  try {
    const { name, type, description, validation } = req.body;
    const property = new Property({ name, type, description, validation });
    await property.save();
    res.status(201).json(property);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Property with this name and type already exists.' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const get_all_properties = async (req: Request, res: Response) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const get_property_by_id = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(200).json(property);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update_property = async (req: Request, res: Response) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(200).json(property);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const delete_property = async (req: Request, res: Response) => {
    try {
      const property_id = req.params.id;
      const tracking_plans = await TrackingPlan.find({ 'events.properties.property': property_id });

      if (tracking_plans.length > 0) {
        return res.status(400).json({ message: 'Cannot delete property that is part of a tracking plan.' });
      }

      const property = await Property.findByIdAndDelete(property_id);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
