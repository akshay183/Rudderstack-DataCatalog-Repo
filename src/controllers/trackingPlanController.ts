import { Request, Response } from "express";
import TrackingPlan from "../models/TrackingPlan";
import Event, { IEvent } from "../models/Event";
import Property, { IProperty } from "../models/Property";
import mongoose from "mongoose";
import { compareEventData } from "../utils/Utils";

export const create_tracking_plan = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const new_tracking_plan = new TrackingPlan({
      name,
      description,
      events: [],
    });

    await new_tracking_plan.save();
    res.status(201).json(new_tracking_plan);
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Tracking plan with this name already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

export const get_all_tracking_plans = async (req: Request, res: Response) => {
  try {
    const tracking_plans = await TrackingPlan.find()
      .populate({
        path: "events.event",
        model: "Event",
      })
      .populate({
        path: "events.properties.property",
        model: "Property",
      });
    res.status(200).json(tracking_plans);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const get_tracking_plan_by_id = async (req: Request, res: Response) => {
  try {
    const tracking_plan = await TrackingPlan.findOne({ ref: req.params.id })
      .populate({
        path: "events.event",
        model: "Event",
      })
      .populate({
        path: "events.properties.property",
        model: "Property",
      });
    if (!tracking_plan) {
      return res.status(404).json({ message: "Tracking plan not found" });
    }
    res.status(200).json(tracking_plan);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update_tracking_plan = async (req: Request, res: Response) => {
  try {
    const tracking_plan = await TrackingPlan.findOneAndUpdate(
      { ref: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!tracking_plan) {
      return res.status(404).json({ message: "Tracking plan not found" });
    }
    res.status(200).json(tracking_plan);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const delete_tracking_plan = async (req: Request, res: Response) => {
  try {
    const tracking_plan = await TrackingPlan.findOneAndDelete({
      ref: req.params.id,
    });
    if (!tracking_plan) {
      return res.status(404).json({ message: "Tracking plan not found" });
    }
    res.status(200).json({ message: "Tracking plan deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const upsert_event_to_tracking_plan = async (
  req: Request,
  res: Response
) => {
  const properties_inserted: string[] = [];
  const events_inserted: string[] = [];
  try {
    const { tracking_plan_id, events } = req.body;

    const tracking_plan = await TrackingPlan.findOne({ ref: tracking_plan_id }); // can be optimized by converting to POJO.
    if (!tracking_plan) {
      return res.status(404).json({ message: "Tracking plan not found" });
    }

    // will see what events are already present.
    const tracking_plan_event_st = new Set<string>(
      tracking_plan
        .toObject()
        ?.events?.map((event) => event.event)
        .filter(Boolean) as string[]
    );

    for (const event_data of events) {
      const event_doc = await Event.findOne(
        {
          name: event_data.name,
          type: event_data.type,
        },
        { created_at: 0, updated_at: 0 }
      )
        .lean()
        .exec();
      let event = { ...event_doc, properties: [] as string[] };

      if (!event_doc) {
        if (event_data.type !== "track" && event_data.name) {
          throw new Error("Event name must be empty if type is not 'track'");
        }
        const event_to_save = new Event({
          additional_properties: event_data.additional_properties,
          validation: event_data.validation,
          name: event_data.name,
          type: event_data.type,
          description: event_data.description,
        });

        const saved_event = await event_to_save.save();
        event = { ...event, ...saved_event.toObject() };
        const ref = event.ref;
        events_inserted.push(ref!);
      } else {
        if (tracking_plan_event_st.has(event.ref!)) {
          return res.status(409).json({
            message: `Event with id ${event.ref} already exists in the tracking plan.`,
          });
        }
        compareEventData(event, event_data);
      }

      if (event_data.properties && event_data.properties.length > 0) {
        const prop_data_st = new Set<string>();
        for (const prop_data of event_data.properties) {
          let property = await Property.findOne(
            {
              name: prop_data.name,
              type: prop_data.type,
            },
            { created_at: 0, updated_at: 0 }
          )
            .lean()
            .exec();
          if (!property) {
            const property_to_save = new Property({
              required: prop_data.required,
              name: prop_data.name,
              type: prop_data.type,
              validation: prop_data.validation,
              description: prop_data.description,
            });

            const saved_property = await property_to_save.save();
            property = saved_property.toObject();
            const ref = property.ref;
            properties_inserted.push(ref!);
          } else {
            compareEventData(property, prop_data);
          }
          if (!prop_data_st.has(property.ref!)) {
            event.properties.push(property.ref!);
            prop_data_st.add(property.ref!);
          }
        }
      }
      tracking_plan.events.push({
        event: event.ref,
        properties: event.properties?.map((prop) => ({
          property: prop,
        })),
      });

      tracking_plan_event_st.add(event.ref!);
    }

    await tracking_plan.save();
    res.status(200).json(tracking_plan);
  } catch (error: any) {
    await Property.deleteMany({ ref: { $in: properties_inserted } });
    await Event.deleteMany({ ref: { $in: events_inserted } });
    res.status(500).json({ message: error.message });
  }
};
