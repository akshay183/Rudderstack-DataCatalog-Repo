import { Schema, model, Document } from "mongoose";

interface IProperty extends Document {
  name: string;
  type: "string" | "number" | "boolean";
  description?: string;
  created_at: Date;
  updated_at: Date;
}

const property_schema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 65 },
    type: {
      type: String,
      required: true,
      enum: ["string", "number", "boolean"],
    },
    description: { type: String, maxlength: 100 },
    validation: { type: Object },
    ref: { type: String, unique: true, index: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

property_schema.pre("save", function (next) {
  // Ensure _id exists before setting ref.
  // Mongoose automatically assigns _id *before* the pre('save') hook runs for new documents.
  if (this.isNew && this._id) {
    this.ref = this._id.toString();
  }
  next();
});

property_schema.index({ name: 1, type: 1 }, { unique: true });

const Property = model<IProperty>("Property", property_schema);

export default Property;
export { IProperty };
