import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { GetSimilarEventsBySlug } from "@/lib/actions/event.actions";
import { IEvent } from "@/database";
import { Event } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { cacheLife, cacheTag } from "next/cache";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex flex-row gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag, index) => (
      <div className="pill" key={tag || index}>
        {tag}
      </div>
    ))}
  </div>
);

const parseArrayField = (data: unknown): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) {
    if (data.length === 0) return [];
    const first = data[0];
    if (
      typeof first === "string" &&
      (first.trim().startsWith("[") || first.trim().startsWith("{"))
    ) {
      try {
        const parsed = JSON.parse(first);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return data.filter((item): item is string => typeof item === "string");
      }
    }
    return data.filter((item): item is string => typeof item === "string");
  }
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [data];
    }
  }
  return [];
};

const fetchEventBySlug = async (slug: string): Promise<IEvent | null> => {
  'use cache';
  cacheLife('hours');
  cacheTag('event-details');
  await connectToDatabase();
  const event = await Event.findOne({ slug: slug.trim().toLowerCase() }).lean();
  if (!event) return null;
  return JSON.parse(JSON.stringify(event)) as IEvent;
};

const getEventBySlug = async (slug: string): Promise<IEvent | null> => {
  try {
    return await fetchEventBySlug(slug);
  } catch (error) {
    console.error("Failed to fetch event by slug:", error);
    return null;
  }
};

export const instant = false;

export async function generateStaticParams() {
  try {
    await connectToDatabase();
    const events = await Event.find({}, { slug: 1 }).lean();
    return events.map((event) => ({
      slug: event.slug,
    }));
  } catch (error) {
    console.error("Failed to generate static params:", error);
    return [];
  }
}

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) return notFound();

  const {
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    organizer,
    tags,
  } = event;

  if (!description) return notFound();

  const bookings = 10;

  const similarEvents: IEvent[] = await GetSimilarEventsBySlug(slug);

  const agendaItems = parseArrayField(agenda);
  const tagItems = parseArrayField(tags);

  return (
    <section id="event" className="header ml-10 mt-10 mb-10 mr-10">
      <div>
        <h1>
          Event Description <br />
        </h1>
        <p className="mt-2"> {description}</p>
      </div>

      <div className="details">
        {/* Left Side - Event Content */}
        <div className="content">
          <Image
            src={image}
            alt="Event Banner"
            width={800}
            height={800}
            className="banner"
          ></Image>

          <section className="flex-col gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="calender"
              label={date}
            />

            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />

            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />

            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />

            <EventDetailItem
              icon="/icons/audience.svg"
              alt="audience"
              label={audience}
            />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex flex-col gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        {/* Right Side - Booking Form */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have booked their spot!
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot!</p>
            )}

            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 &&
            similarEvents.map((similarEvent: IEvent) => (
              <EventCard key={similarEvent.slug} {...similarEvent} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetailsPage;
