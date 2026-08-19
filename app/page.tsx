import React from 'react'
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {events} from "@/lib/constants";

const Page = () => {
    return (
        <section>
            <h1 className="text-center mt-5">The Hub For Every Dev <br />Event You Can't Miss</h1>
            <p className="text-center mt-5 ">Hackathons, Meetups and Conferences, All in One Place</p>

            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <div className="ml-7 mr-7">
                    <h3>Featured Events</h3>
                    <br />
                    <ul className="events">
                        {events.map((event) => (
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
