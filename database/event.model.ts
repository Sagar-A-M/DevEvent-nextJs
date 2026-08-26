import { Schema, model, models, Model } from 'mongoose';

/**
 * Interface representing the Event document structure.
 */
export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Helper function to generate a URL-friendly slug from a string.
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Helper function to normalize time strings to consistent 24-hour format (HH:mm).
 */
function normalizeTime(timeStr: string): string {
  const trimmed = timeStr.trim();
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?:\s*([ap]\.?m\.?))?$/i;
  const match = trimmed.match(timeRegex);

  if (!match) {
    throw new Error(`Invalid time format: "${timeStr}". Expected format like "14:30" or "02:30 PM".`);
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3] ? match[3].toUpperCase().replace(/\./g, '') : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    slug: { type: String, unique: true, trim: true, lowercase: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    overview: { type: String, required: [true, 'Overview is required'], trim: true },
    image: { type: String, required: [true, 'Image URL is required'], trim: true },
    venue: { type: String, required: [true, 'Venue is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    date: { type: String, required: [true, 'Date is required'], trim: true },
    time: { type: String, required: [true, 'Time is required'], trim: true },
    mode: { type: String, required: [true, 'Mode is required'], trim: true },
    audience: { type: String, required: [true, 'Audience is required'], trim: true },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0 && arr.every((item) => item.trim().length > 0),
        message: 'Agenda must be a non-empty array of non-empty strings.',
      },
    },
    organizer: { type: String, required: [true, 'Organizer is required'], trim: true },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0 && arr.every((item) => item.trim().length > 0),
        message: 'Tags must be a non-empty array of non-empty strings.',
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook:
 * 1. Validates required string fields are non-empty after trimming.
 * 2. Generates URL-friendly slug only if title is modified or slug is missing.
 * 3. Validates & normalizes date to ISO format (YYYY-MM-DD).
 * 4. Ensures time is normalized to consistent 24-hour format (HH:mm).
 */
EventSchema.pre('save', async function () {
  // Validate that required string fields are present and non-empty
  const requiredStringFields: Array<keyof IEvent> = [
    'title',
    'description',
    'overview',
    'image',
    'venue',
    'location',
    'date',
    'time',
    'mode',
    'audience',
    'organizer',
  ];

  for (const field of requiredStringFields) {
    const val = this[field];
    if (typeof val !== 'string' || !val.trim()) {
      throw new Error(`Field "${field}" is required and cannot be empty.`);
    }
  }

  // Generate URL-friendly slug only when title is modified or slug is not set
  if (this.isModified('title') || !this.slug) {
    const generatedSlug = generateSlug(this.title);
    if (!generatedSlug) {
      throw new Error('Unable to generate a valid slug from the provided title.');
    }
    this.slug = generatedSlug;
  }

  // Validate and normalize date to ISO YYYY-MM-DD format
  if (this.isModified('date')) {
    const parsedDate = new Date(this.date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date value: "${this.date}". Must be a valid date.`);
    }
    this.date = parsedDate.toISOString().split('T')[0];
  }

  // Normalize time to consistent HH:mm 24-hour format
  if (this.isModified('time')) {
    this.time = normalizeTime(this.time);
  }
});

export const Event: Model<IEvent> = (models.Event as Model<IEvent>) || model<IEvent>('Event', EventSchema);
