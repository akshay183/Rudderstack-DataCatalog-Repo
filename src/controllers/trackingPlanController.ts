import { Request, Response } from 'express';
import TrackingPlan from '../models/TrackingPlan';
import Event from '../models/Event';
import Property from '../models/Property';
import mongoose from 'mongoose';

export const create_tracking_plan = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { name, description, events } = req.body;

        const new_tracking_plan = new TrackingPlan({ name, description, events: [] });

        if (events && events.length > 0) {
            for (const event_data of events) {
                let event = await Event.findOne({ name: event_data.name, type: event_data.type }).session(session);
                if (!event) {
                    if (event_data.type !== 'track' && event_data.name) {
                        throw new Error("Event name must be empty if type is not 'track'");
                    }
                    event = new Event({ name: event_data.name, type: event_data.type, description: event_data.description, validation: event_data.validation });
                    await event.save({ session });
                } else {
                    if (event.description !== event_data.description) {
                        return res.status(409).json({ message: `Event with name ${event.name} and type ${event.type} already exists with a different description.` });
                    }
                }

                const new_event = {
                    event: event._id,
                    properties: [] as any[],
                    additional_properties: event_data.additional_properties
                };

                if (event_data.properties && event_data.properties.length > 0) {
                    for (const prop_data of event_data.properties) {
                        let property = await Property.findOne({ name: prop_data.name, type: prop_data.type }).session(session);
                        if (!property) {
                            property = new Property({ name: prop_data.name, type: prop_data.type, description: prop_data.description, validation: prop_data.validation });
                            await property.save({ session });
                        } else {
                            if (property.description !== prop_data.description) {
                                return res.status(409).json({ message: `Property with name ${property.name} and type ${property.type} already exists with a different description.` });
                            }
                        }
                        new_event.properties.push({
                            property: property._id,
                            required: prop_data.required
                        });
                    }
                }
                new_tracking_plan.events.push(new_event);
            }
        }

        await new_tracking_plan.save({ session });
        await session.commitTransaction();
        res.status(201).json(new_tracking_plan);
    } catch (error: any) {
        await session.abortTransaction();
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Tracking plan with this name already exists.' });
        }
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};


export const get_all_tracking_plans = async (req: Request, res: Response) => {
    try {
        const tracking_plans = await TrackingPlan.find().populate({
            path: 'events.event',
            model: 'Event'
        }).populate({
            path: 'events.properties.property',
            model: 'Property'
        });
        res.status(200).json(tracking_plans);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const get_tracking_plan_by_id = async (req: Request, res: Response) => {
    try {
        const tracking_plan = await TrackingPlan.findById(req.params.id).populate({
            path: 'events.event',
            model: 'Event'
        }).populate({
            path: 'events.properties.property',
            model: 'Property'
        });
        if (!tracking_plan) {
            return res.status(404).json({ message: 'Tracking plan not found' });
        }
        res.status(200).json(tracking_plan);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const update_tracking_plan = async (req: Request, res: Response) => {
    try {
        const tracking_plan = await TrackingPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!tracking_plan) {
            return res.status(404).json({ message: 'Tracking plan not found' });
        }
        res.status(200).json(tracking_plan);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const delete_tracking_plan = async (req: Request, res: Response) => {
    try {
        const tracking_plan = await TrackingPlan.findByIdAndDelete(req.params.id);
        if (!tracking_plan) {
            return res.status(44).json({ message: 'Tracking plan not found' });
        }
        res.status(200).json({ message: 'Tracking plan deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const upsert_event_to_tracking_plan = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { tracking_plan_id } = req.params;
        const { events } = req.body;

        const tracking_plan = await TrackingPlan.findById(tracking_plan_id).session(session);
        if (!tracking_plan) {
            return res.status(404).json({ message: 'Tracking plan not found' });
        }

        for (const event_data of events) {
            const existing_event_in_plan = tracking_plan.events.find(e => e.event.toString() === event_data.id);
            if (existing_event_in_plan) {
                return res.status(409).json({ message: `Event with id ${event_data.id} already exists in the tracking plan.` });
            }

            let event = await Event.findOne({ name: event_data.name, type: event_data.type }).session(session);
            if (!event) {
                if (event_data.type !== 'track' && event_data.name) {
                    throw new Error("Event name must be empty if type is not 'track'");
                }
                event = new Event({ name: event_data.name, type: event_data.type, description: event_data.description, validation: event_data.validation });
                await event.save({ session });
            } else {
                if (event.description !== event_data.description) {
                    return res.status(409).json({ message: `Event with name ${event.name} and type ${event.type} already exists with a different description.` });
                }
            }

            const new_event = {
                event: event._id,
                properties: [] as any[],
                additional_properties: event_data.additional_properties
            };

            if (event_data.properties && event_data.properties.length > 0) {
                for (const prop_data of event_data.properties) {
                    let property = await Property.findOne({ name: prop_data.name, type: prop_data.type }).session(session);
                    if (!property) {
                        property = new Property({ name: prop_data.name, type: prop_data.type, description: prop_data.description, validation: prop_data.validation });
                        await property.save({ session });
                    } else {
                        if (property.description !== prop_data.description) {
                            return res.status(409).json({ message: `Property with name ${property.name} and type ${property.type} already exists with a different description.` });
                        }
                    }
                    new_event.properties.push({
                        property: property._id,
                        required: prop_data.required
                    });
                }
            }
            tracking_plan.events.push(new_event);
        }

        await tracking_plan.save({ session });
        await session.commitTransaction();
        res.status(200).json(tracking_plan);
    } catch (error: any) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};
