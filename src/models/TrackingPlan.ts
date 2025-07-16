import { Schema, model, Document } from "mongoose";
import { IEvent } from "./Event";
import { IProperty } from "./Property";

interface ITrackingPlan extends Document {
  name: string;
  description?: string;
  events: {
    event: IEvent["ref"];
    properties: {
      property: IProperty["ref"];
    }[];
  }[];
  created_at?: Date;
  updated_at?: Date;
}

const tracking_plan_schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 65,
    },
    description: { type: String, maxlength: 100 },
    ref: { type: String, unique: true, index: true },
    events: [
      {
        event: { type: String, ref: "Event" },
        properties: [
          {
            property: { type: String, ref: "Property" },
          },
        ],
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

tracking_plan_schema.pre("save", function (next) {
  // Ensure _id exists before setting ref.
  // Mongoose automatically assigns _id *before* the pre('save') hook runs for new documents.
  if (this.isNew && this._id) {
    this.ref = this._id.toString();
  }
  next();
});

const TrackingPlan = model<ITrackingPlan>("TrackingPlan", tracking_plan_schema);

export default TrackingPlan;
export { ITrackingPlan };
