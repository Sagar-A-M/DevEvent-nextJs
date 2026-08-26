import React from 'react'
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { IEvent } from '@/database';


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {

    const response = await fetch(`${BASE_URL}/api/events`);
    const { events } = await response.json();

    return (
        <section>
            <h1 className="text-center mt-5">The Hub For Every Dev <br />Event You Cant Miss</h1>
            <p className="text-center mt-5 ">Hackathons, Meetups and Conferences, All in One Place</p>

            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <div className="ml-7 mr-7">
                    <h3>Featured Events</h3>
                    <br />
                    <ul className="events">
                        {events && events.length > 0 && events.map((event: IEvent) => (
                            <li key={event.title}>
                                <EventCard {...event}/>
                            </li>

                        ))}
                    </ul>
                </div>
            </div>

        </section>

    )
}
export default Page
