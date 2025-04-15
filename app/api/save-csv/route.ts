import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

// Funktion zum Erstellen der CSV-Datei
const createCSV = (data: FormData) => {
  try {
    // Filtern der null Werte und Konvertierung der Daten
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

    const csvContent = createCSV(data);
    console.log('Generated CSV content:', csvContent);

    const fileName = `Linsenbestellung_${data.orderId}_${new Date().toISOString().split('T')[0]}.csv`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    console.log('Upload directory:', uploadsDir);

    // Ensure uploads directory exists
    try {
      if (!fs.existsSync(uploadsDir)) {
        console.log('Creating uploads directory');
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, fileName);
      console.log('Saving file to:', filePath);
      
      fs.writeFileSync(filePath, csvContent);
      console.log('File saved successfully');

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error in file operations:', error);
      return NextResponse.json(
        { success: false, message: 'Fehler beim Speichern der Datei' },
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