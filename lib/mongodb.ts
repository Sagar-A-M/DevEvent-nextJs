import mongoose, { Mongoose } from 'mongoose';

/**
 * Interface for the cached Mongoose connection object stored on global scope.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Declare global type for NodeJS Global scope to prevent TypeScript errors
 * when caching the Mongoose connection across module reloads in development.
 */
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global variable reference to preserve connection across HMR (Hot Module Replacement)
 * in Next.js development environment.
 */
const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connects to MongoDB using Mongoose with connection pooling and caching.
 *
 * @returns {Promise<Mongoose>} The active Mongoose instance.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env or .env.local'
    );
  }

  // Return existing active connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create connection promise if none exists to handle concurrent requests
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    // Wait for the pending connection promise to resolve
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset connection promise on error to allow future retry attempts
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
