import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const { csvContent, fileName } = await request.json();

    // Erstelle den Pfad zum Linsenbestellungen-Verzeichnis
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'Linsenbestellungen');
    const filePath = join(uploadsDir, fileName);
    
    console.log('Speicherort:', filePath);
    console.log('Verzeichnis existiert:', existsSync(uploadsDir));
    
    // Stelle sicher, dass das Uploads-Verzeichnis existiert
    try {
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
        console.log('Verzeichnis erstellt:', uploadsDir);
      }
      
      await writeFile(filePath, csvContent, 'utf-8');
      console.log('Datei erfolgreich gespeichert:', filePath);
      
      // Überprüfe, ob die Datei existiert
      const fileExists = existsSync(filePath);
      console.log('Datei existiert nach dem Speichern:', fileExists);

      return NextResponse.json({ 
        success: true,
        message: 'CSV-Datei erfolgreich gespeichert',
        path: filePath,
        fileExists: fileExists
      });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      throw error;
    }
  } catch (error) {
    console.error('Fehler beim Speichern der CSV-Datei:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Fehler beim Speichern der CSV-Datei',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
} 