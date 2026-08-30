 import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Event } from '@/database/event.model';

/**
 * Route parameter interface for Next.js 15+ / 16+ Route Handlers where `params` is a Promise.
 */
interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Fetches event details by its unique URL slug.
 *
 * @param req - Incoming NextRequest object
 * @param context - Dynamic route parameters containing `slug`
 * @returns JSON response with event data or appropriate error response
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Await dynamic route parameters
    const { slug } = await params;

    // Validate that slug is present, valid string, and not empty
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json(
        { message: 'Event slug is required and cannot be empty' },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.trim().toLowerCase();

    // Establish MongoDB connection
    await connectToDatabase();

    // Query the database for matching event by slug
    const event = await Event.findOne({ slug: normalizedSlug }).lean();

    // Return 404 if event does not exist
    if (!event) {
      return NextResponse.json(
        { message: `Event not found with slug: ${normalizedSlug}` },
        { status: 404 }
      );
    }

    // Return event details with 200 OK
    return NextResponse.json(
      {
        message: 'Event details fetched successfully',
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/events/[slug] Error:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch event details',
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
