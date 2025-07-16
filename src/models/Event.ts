import { Schema, model, Document } from "mongoose";

interface IEvent extends Document {
  name?: string;
  type: "track" | "identify" | "alias" | "screen" | "page";
  description?: string;
  created_at?: Date;
  updated_at?: Date;
  additional_properties?: boolean;
  validation?: Object;
  ref?: string;
}

const event_schema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 65 },
    type: {
      type: String,
      required: true,
      enum: ["track", "identify", "alias", "screen", "page"],
    },
    description: { type: String, maxlength: 100 },
    validation: { type: Object },
    ref: { type: String, unique: true, index: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

event_schema.pre("save", function (next) {
  // Ensure _id exists before setting ref.
  // Mongoose automatically assigns _id *before* the pre('save') hook runs for new documents.
  if (this.isNew && this._id) {
    this.ref = this._id.toString();
  }
  next();
});

event_schema.index({ name: 1, type: 1 }, { unique: true });

const Event = model<IEvent>("Event", event_schema);

export default Event;
export { IEvent };
