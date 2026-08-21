import mongoose, { Schema, model, models, Model, Types } from 'mongoose';

/**
 * Interface representing the Booking document structure.
 */
export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure index on eventId for faster queries
BookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook:
 * 1. Validates and normalizes email format.
 * 2. Verifies that the referenced eventId corresponds to an existing Event document.
 */
BookingSchema.pre('save', async function () {
  // Validate and normalize email
  if (this.isModified('email')) {
    const trimmedEmail = this.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      throw new Error(`Invalid email address format: "${this.email}".`);
    }
    this.email = trimmedEmail;
  }

  // Verify that the referenced event exists in the Event collection
  if (this.isModified('eventId')) {
    if (!Types.ObjectId.isValid(this.eventId)) {
      throw new Error(`Invalid ObjectId format for eventId: "${this.eventId}".`);
    }

    const EventModel = mongoose.models.Event || mongoose.model('Event');
    const eventExists = await EventModel.exists({ _id: this.eventId });

    if (!eventExists) {
      throw new Error(`Referenced Event with ID "${this.eventId}" does not exist.`);
    }
  }
});

export const Booking: Model<IBooking> = (models.Booking as Model<IBooking>) || model<IBooking>('Booking', BookingSchema);
