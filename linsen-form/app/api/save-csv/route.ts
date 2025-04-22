import { NextResponse } from 'next/server';

interface FormData {
  orderId: string | null;
  status: string;
  ean: string | null;
  lieferwoche?: number | null;
  implantat1?: string | null;
  sph1?: number | null;
  cyl1?: number | null;
  ax1?: number | null;
  len1?: number | null;
  lieferwoche1?: number | null;
  implantat2?: string | null;
  sph2?: number | null;
  cyl2?: number | null;
  ax2?: number | null;
  len2?: number | null;
  lieferwoche2?: number | null;
  implantat3?: string | null;
  sph3?: number | null;
  cyl3?: number | null;
  ax3?: number | null;
  len3?: number | null;
  lieferwoche3?: number | null;
  kommentar?: string | null;
  ean1?: string | null;
  ean2?: string | null;
  ean3?: string | null;
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
    
    // Always include OrderID and EAN
    if (data.orderId) filteredData['Order-ID'] = data.orderId;
    if (data.ean) filteredData['EAN'] = data.ean;

    // Include Lieferwoche only for 'ausgeführt' status
    if (data.status === 'ausgeführt' && data.lieferwoche !== null && data.lieferwoche !== undefined) {
      const currentYear = new Date().getFullYear();
      filteredData['Lieferwoche'] = `${data.lieferwoche}, ${currentYear}`;
    }

    if (data.status === 'alternative') {
      // For alternative orders, include all lens parameters with clear labeling
      if (typeof data.sph1 === 'number' || typeof data.cyl1 === 'number' || typeof data.ax1 === 'number' || typeof data.len1 === 'number') {
        filteredData['Alternative_1'] = 'Alternative 1';
        if (data.ean1) filteredData['EAN_1'] = data.ean1;
        if (typeof data.sph1 === 'number') filteredData['Sph_1'] = data.sph1.toString();
        if (typeof data.cyl1 === 'number') filteredData['Cyl_1'] = data.cyl1.toString();
        if (typeof data.ax1 === 'number') filteredData['Ax_1'] = data.ax1.toString();
        if (typeof data.len1 === 'number') filteredData['Len_1'] = data.len1.toString();
        if (typeof data.lieferwoche1 === 'number') {
          const currentYear = new Date().getFullYear();
          filteredData['Lieferwoche_1'] = `${data.lieferwoche1}, ${currentYear}`;
        }
      }

      // Include additional alternatives in the same row if they exist
      if (typeof data.sph2 === 'number' || typeof data.cyl2 === 'number' || typeof data.ax2 === 'number' || typeof data.len2 === 'number') {
        filteredData['Alternative_2'] = 'Alternative 2';
        if (data.ean2) filteredData['EAN_2'] = data.ean2;
        if (typeof data.sph2 === 'number') filteredData['Sph_2'] = data.sph2.toString();
        if (typeof data.cyl2 === 'number') filteredData['Cyl_2'] = data.cyl2.toString();
        if (typeof data.ax2 === 'number') filteredData['Ax_2'] = data.ax2.toString();
        if (typeof data.len2 === 'number') filteredData['Len_2'] = data.len2.toString();
        if (typeof data.lieferwoche2 === 'number') {
          const currentYear = new Date().getFullYear();
          filteredData['Lieferwoche_2'] = `${data.lieferwoche2}, ${currentYear}`;
        }
      }

      if (typeof data.sph3 === 'number' || typeof data.cyl3 === 'number' || typeof data.ax3 === 'number' || typeof data.len3 === 'number') {
        filteredData['Alternative_3'] = 'Alternative 3';
        if (data.ean3) filteredData['EAN_3'] = data.ean3;
        if (typeof data.sph3 === 'number') filteredData['Sph_3'] = data.sph3.toString();
        if (typeof data.cyl3 === 'number') filteredData['Cyl_3'] = data.cyl3.toString();
        if (typeof data.ax3 === 'number') filteredData['Ax_3'] = data.ax3.toString();
        if (typeof data.len3 === 'number') filteredData['Len_3'] = data.len3.toString();
        if (typeof data.lieferwoche3 === 'number') {
          const currentYear = new Date().getFullYear();
          filteredData['Lieferwoche_3'] = `${data.lieferwoche3}, ${currentYear}`;
        }
      }
    }

    // Include comment if it exists
    if (data.kommentar) filteredData['Kommentar'] = data.kommentar;
    
    // Create CSV with fixed column order based on status
    const baseColumns = ['Order-ID', 'EAN'];
    const ausgeführtColumns = [...baseColumns, 'Lieferwoche', 'Kommentar'];
    const alternativeColumns = [
      ...baseColumns,
      'Alternative_1', 'EAN_1', 'Sph_1', 'Cyl_1', 'Ax_1', 'Len_1', 'Lieferwoche_1',
      'Alternative_2', 'EAN_2', 'Sph_2', 'Cyl_2', 'Ax_2', 'Len_2', 'Lieferwoche_2',
      'Alternative_3', 'EAN_3', 'Sph_3', 'Cyl_3', 'Ax_3', 'Len_3', 'Lieferwoche_3',
      'Kommentar'
    ];

    const columns = data.status === 'ausgeführt' ? ausgeführtColumns : alternativeColumns;
    const values = columns.map(col => {
      const value = filteredData[col];
      return value ? `"${value}"` : '""';
    });

    return `${columns.join(',')}\n${values.join(',')}`;
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
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Linsenbestellung_${data.orderId}_${timestamp}.csv`;

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