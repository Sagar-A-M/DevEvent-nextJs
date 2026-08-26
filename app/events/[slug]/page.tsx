import { notFound } from "next/navigation";


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  
  const { slug } = await params;
  const request = await fetch(`${BASE_URL}/api/events/${slug}`);
  const { event } = await request.json();

  if(!event) return notFound();

  return (
    <section id="event" className="ml-15 mt-8">
      <h1>Event Details: <br /> {event.title}</h1>
    </section>
  )
}

export default EventDetailsPage