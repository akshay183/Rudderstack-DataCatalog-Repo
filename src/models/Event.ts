import { Schema, model, Document } from 'mongoose';

interface IEvent extends Document {
  name: string;
  type: 'track' | 'identify' | 'alias' | 'screen' | 'page';
  description?: string;
  created_at: Date;
  updated_at: Date;
}

const event_schema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 65 },
  type: { type: String, required: true, enum: ['track', 'identify', 'alias', 'screen', 'page'] },
  description: { type: String, maxlength: 100 },
  validation: { type: Object },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

event_schema.index({ name: 1, type: 1 }, { unique: true });

const Event = model<IEvent>('Event', event_schema);

export default Event;
export { IEvent };
