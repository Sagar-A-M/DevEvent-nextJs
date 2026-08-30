import connectToDatabase from "../mongodb";
import { Event } from "@/database/event.model";
import { cacheLife, cacheTag } from "next/cache";

const fetchSimilarEventsFromDb = async (slug: string) => {
    'use cache';
    cacheLife('hours');
    cacheTag('similar-events');

    await connectToDatabase();

    const event = await Event.findOne({ slug }).lean();

    if (!event) {
        return [];
    }

    const similarEvents = await Event.find({
        _id: { $ne: event._id },
        tags: { $in: event.tags },
    }).lean();

    return JSON.parse(JSON.stringify(similarEvents));
};

export const GetSimilarEventsBySlug = async (slug: string) => {
    try {
        return await fetchSimilarEventsFromDb(slug);
    } catch {
        return [];
    }
};