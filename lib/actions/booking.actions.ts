'use server';

import { Booking } from "@/database/booking.model";
import connectToDatabase from "@/lib/mongodb";

export const createBooking = async ({ eventId, email }: { eventId: string; email: string }) => {
    try {
        await connectToDatabase();
        const booking = await Booking.create({ eventId, email });
        return { success: true, booking: JSON.parse(JSON.stringify(booking)) };
    } catch (e: unknown) {
        console.error("create booking failed", e);

        // Handle duplicate booking (same email + event)
        if (e instanceof Error && e.message.includes("E11000")) {
            return { success: false, error: "You have already booked this event with this email." };
        }

        return { success: false, error: e instanceof Error ? e.message : "Failed to create booking" };
    }
};