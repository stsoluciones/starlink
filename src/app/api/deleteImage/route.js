import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function DELETE(request) {
    // Parse the request body
    const data = await request.json();
    const image = data.file; // Adjust based on the exact request structure
    //console.log(image,'imgEliminar')
    if (!image) {
        return NextResponse.json('No image has been uploaded', { status: 400 });
    }

    // Perform the Cloudinary delete operation
    try {
        const response = await new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(image, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        //console.log(response,'response cloudinary');

        return NextResponse.json({
           response
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json('Error deleting image', { status: 500 });
    }
}