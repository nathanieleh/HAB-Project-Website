/*import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Initialize Google Drive API client
const initializeGoogleDrive = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return google.drive({ version: 'v3', auth });
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return new NextResponse(
        JSON.stringify({ error: 'File ID is required' }),
        { status: 400 }
      );
    }

    const drive = initializeGoogleDrive();

    // Get the file metadata and content
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media',  // This will get the file content instead of metadata
    });

    // Return the file content
    return new NextResponse(
      JSON.stringify(response.data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching from Google Drive:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch forecast data' }),
      { status: 500 }
    );
  }
}*/