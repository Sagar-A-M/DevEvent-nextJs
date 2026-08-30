/* eslint-disable @typescript-eslint/no-unused-vars */
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { v2 as cloudinary } from 'cloudinary';
import { Event } from "@/database/event.model";

export async function POST(
    req: NextRequest
) {
    try {

        await connectToDatabase();
        const formData = await req.formData();

        let event;

        try {

            event = Object.fromEntries(formData.entries());

        } catch (e) {

            return NextResponse.json({ message: 'Invalid JSON data format'}, { status: 400});

        }

        const file = formData.get('image');

        if (!file || typeof file === 'string' || typeof (file as File).arrayBuffer !== 'function') {
            return NextResponse.json({ message: 'Image file is required and must be a valid file' }, { status: 400 });
        }

        const tags = JSON.parse(formData.get('tags') as string);
        const agenda = JSON.parse(formData.get('agenda') as string);


        const arrayBuffer = await (file as File).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvents' }, (error, results) => {
                if (error) return reject(error);
                resolve(results as { secure_url: string; public_id: string });
            }).end(buffer);
        });

        event.image = uploadResult.secure_url;

        let createEvent;
        try {
            createEvent = await Event.create({
                ...event,
                tags: tags,
                agenda: agenda,
            });

            // Revalidate homepage and events cache so new entries immediately reflect on the webpage
            revalidatePath('/');
            revalidateTag('events', 'max');
        } catch (dbError) {
            if (uploadResult?.public_id) {
                try {
                    await cloudinary.uploader.destroy(uploadResult.public_id);
                } catch (destroyErr) {
                    console.error('Failed to cleanup Cloudinary asset:', destroyErr);
                }
            }
            throw dbError;
        }

        return NextResponse.json({ message: 'Event created successfully', event: createEvent }, { status: 201 });

    } catch (e) {
        console.error('POST /api/events error:', e);
        return NextResponse.json({ message: 'Event creation failed', error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 });
    }
}

export async function GET( req: NextRequest) {
    try{

        await connectToDatabase();

        const events = await Event.find().sort({ createdAt: -1});

        return NextResponse.json({ message: 'Event fetched successfully', events}, {status: 200});

    } catch(e) {
        return NextResponse.json({message: 'Event fetching failed', error: e instanceof Error ? e.message: 'Unknown'}, { status: 500});
    }
}
