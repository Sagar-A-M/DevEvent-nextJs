import React from "react";
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import { cacheLife, cacheTag } from "next/cache";

const getEvents = async (): Promise<IEvent[]> => {
  'use cache';
  cacheLife('hours');
  cacheTag('events');
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(events)) as IEvent[];
  } catch (error) {
    console.error("Failed to fetch events on homepage:", error);
    return [];
  }
};

const Page = async () => {
  const events = await getEvents();

  return (
    <section>
      <h1 className="text-center mt-5">
        The Hub For Every Dev <br />
        Event You Cant Miss
      </h1>
      <p className="text-center mt-5 ">
        Hackathons, Meetups and Conferences, All in One Place
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7 mb-10">
        <div className="ml-7 mr-7">
          <h3>Featured Events</h3>
          <br />
          <ul className="events">
            {events &&
              events.length > 0 &&
              events.map((event: IEvent) => (
                <li key={event.slug || event.title}>
                  <EventCard {...event} />
                </li>
              ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Page;
