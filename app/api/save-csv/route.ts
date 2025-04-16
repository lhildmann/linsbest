import { NextResponse } from 'next/server';

interface FormData {
  orderId: string | null;
  status: string;
  lieferdatum: string | null;
  alternativeLinse1: string | null;
  lieferdatum1: string | null;
  alternativeLinse2: string | null;
  lieferdatum2: string | null;
  alternativeLinse3: string | null;
  lieferdatum3: string | null;
  kommentar: string | null;
}

// Function to get Zoho access token
async function getZohoAccessToken() {
  try {
    const tokenResponse = await fetch('https://accounts.zoho.eu/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.ZOHO_CLIENT_ID || '',
        client_secret: process.env.ZOHO_CLIENT_SECRET || '',
        refresh_token: process.env.ZOHO_REFRESH_TOKEN || '',
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting Zoho access token:', error);
    throw error;
  }
}

// Function to upload file to Zoho WorkDrive
async function uploadToZohoWorkDrive(fileName: string, fileContent: string) {
  try {
    const accessToken = await getZohoAccessToken();
    
    // Create form data with the file
    const formData = new FormData();
    const blob = new Blob([fileContent], { type: 'text/csv' });
    formData.append('content', blob, fileName);
    formData.append('parent_id', process.env.ZOHO_WORKDRIVE_FOLDER_ID || '');

    // Upload to Zoho WorkDrive
    const uploadResponse = await fetch('https://www.zohoapis.eu/workdrive/api/v1/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(`Upload failed: ${JSON.stringify(errorData)}`);
    }

    return await uploadResponse.json();
  } catch (error) {
    console.error('Error uploading to Zoho WorkDrive:', error);
    throw error;
  }
}

// Function to create CSV content
const createCSV = (data: FormData) => {
  try {
    const filteredData: Record<string, string> = {};
    
    if (data.orderId) filteredData.OrderID = data.orderId;
    filteredData.status = data.status;
    
    if (data.lieferdatum) {
      filteredData.lieferdatum = new Date(data.lieferdatum).toLocaleDateString('de-DE');
    }
    
    if (data.alternativeLinse1) filteredData.alternativeLinse1 = data.alternativeLinse1;
    if (data.lieferdatum1) {
      filteredData.lieferdatum1 = new Date(data.lieferdatum1).toLocaleDateString('de-DE');
    }
    
    if (data.alternativeLinse2) filteredData.alternativeLinse2 = data.alternativeLinse2;
    if (data.lieferdatum2) {
      filteredData.lieferdatum2 = new Date(data.lieferdatum2).toLocaleDateString('de-DE');
    }
    
    if (data.alternativeLinse3) filteredData.alternativeLinse3 = data.alternativeLinse3;
    if (data.lieferdatum3) {
      filteredData.lieferdatum3 = new Date(data.lieferdatum3).toLocaleDateString('de-DE');
    }
    
    if (data.kommentar) filteredData.kommentar = data.kommentar;
    
    const headers = Object.keys(filteredData).join(',');
    const values = Object.values(filteredData).map(value => `"${value}"`).join(',');
    return `${headers}\n${values}`;
  } catch (error) {
    console.error('Error in createCSV:', error);
    throw new Error('Fehler beim Erstellen der CSV-Datei');
  }
};

export async function POST(request: Request) {
  try {
    const data: FormData = await request.json();
    console.log('Received data:', data);

    if (!data.orderId) {
      console.error('Missing orderId');
      return NextResponse.json(
        { success: false, message: 'OrderID ist erforderlich' },
        { status: 400 }
      );
    }

    // Create CSV content
    const csvContent = createCSV(data);
    const fileName = `Linsenbestellung_${data.orderId}_${new Date().toISOString().split('T')[0]}.csv`;

    // Upload to Zoho WorkDrive
    try {
      const uploadResult = await uploadToZohoWorkDrive(fileName, csvContent);
      return NextResponse.json({ 
        success: true,
        message: 'Datei erfolgreich in Zoho WorkDrive hochgeladen',
        fileDetails: uploadResult
      });
    } catch (error) {
      console.error('Error uploading to Zoho WorkDrive:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fehler beim Hochladen der Datei zu Zoho WorkDrive',
          error: error instanceof Error ? error.message : 'Unbekannter Fehler'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Verarbeiten der Anfrage',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
} 