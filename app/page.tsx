'use client';

import { useState, useEffect, useCallback, memo, Suspense } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { de } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';

interface ValidationErrors {
  lieferdatum1?: boolean;
  alternativeLinse1?: boolean;
  kommentar?: boolean;
}

type FormStatus = 'ausgeführt' | 'alternative' | 'abgelehnt';

interface FormDataType {
  OrderID?: string | null;
  status?: FormStatus;
  lieferdatum?: string;
  alternativeLinse1?: string;
  lieferdatum1?: string;
  alternativeLinse2?: string;
  lieferdatum2?: string;
  alternativeLinse3?: string;
  lieferdatum3?: string;
  kommentar?: string;
}

// Funktion zum Erstellen der CSV-Datei
const createCSV = (data: FormDataType) => {
  const filteredData = { ...data };
  const headers = Object.keys(filteredData).join(',');
  const values = Object.values(filteredData).map(value => `"${value}"`).join(',');
  return `${headers}\n${values}`;
};

const saveCSV = async (csvContent: string, orderId: string | null) => {
  if (!orderId) {
    throw new Error('OrderID ist erforderlich');
  }

  try {
    const response = await fetch('/api/save-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        csvContent, 
        fileName: `Linsenbestellung_${orderId}_${new Date().toISOString().split('T')[0]}.csv` 
      }),
    });

    return await response.json();
  } catch {
    throw new Error('Fehler beim Speichern der CSV-Datei');
  }
};

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();

  // Normalize query parameters to be case-insensitive
  const queryParams = new URLSearchParams(searchParams.toString());
  let bestellnummer = null;

  for (const [key, value] of queryParams.entries()) {
    if (key.toLowerCase() === 'orderid') {
      bestellnummer = value;
      break;
    }
  }

  const [status, setStatus] = useState<FormStatus>('ausgeführt');
  const [alternativeLinse1, setAlternativeLinse1] = useState('');
  const [alternativeLinse2, setAlternativeLinse2] = useState('');
  const [alternativeLinse3, setAlternativeLinse3] = useState('');
  const [lieferdatum1, setLieferdatum1] = useState<Date | null>(null);
  const [lieferdatum2, setLieferdatum2] = useState<Date | null>(null);
  const [lieferdatum3, setLieferdatum3] = useState<Date | null>(null);
  const [kommentar, setKommentar] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (!bestellnummer) {
      console.warn('Keine OrderID in der URL gefunden');
    }
  }, [bestellnummer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formData = {
        orderId: bestellnummer,
        status,
        lieferdatum: status === 'ausgeführt' && lieferdatum1 ? new Date(lieferdatum1).toISOString() : null,
        alternativeLinse1: status === 'alternative' ? alternativeLinse1 : null,
        lieferdatum1: status === 'alternative' && lieferdatum1 ? new Date(lieferdatum1).toISOString() : null,
        alternativeLinse2: status === 'alternative' && alternativeLinse2.trim() ? alternativeLinse2 : null,
        lieferdatum2: status === 'alternative' && lieferdatum2 ? new Date(lieferdatum2).toISOString() : null,
        alternativeLinse3: status === 'alternative' && alternativeLinse3.trim() ? alternativeLinse3 : null,
        lieferdatum3: status === 'alternative' && lieferdatum3 ? new Date(lieferdatum3).toISOString() : null,
        kommentar: status === 'abgelehnt' ? kommentar : null
      };

      const response = await fetch('/api/save-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Fehler beim Speichern der Daten');
      }

      if (result.success) {
        let message = `Bestellung erfolgreich gespeichert!\n\n`;
        message += `OrderID: ${bestellnummer}\n`;
        message += `Status: ${status}\n`;

        if (status === 'ausgeführt') {
          message += `Lieferdatum: ${lieferdatum1 ? new Date(lieferdatum1).toLocaleDateString('de-DE') : 'Nicht angegeben'}\n`;
        } else if (status === 'alternative') {
          message += '\nAlternative Linsen:\n';
          if (alternativeLinse1) {
            message += `- ${alternativeLinse1} (Lieferdatum: ${lieferdatum1 ? new Date(lieferdatum1).toLocaleDateString('de-DE') : 'Nicht angegeben'})\n`;
          }
          if (alternativeLinse2) {
            message += `- ${alternativeLinse2} (Lieferdatum: ${lieferdatum2 ? new Date(lieferdatum2).toLocaleDateString('de-DE') : 'Nicht angegeben'})\n`;
          }
          if (alternativeLinse3) {
            message += `- ${alternativeLinse3} (Lieferdatum: ${lieferdatum3 ? new Date(lieferdatum3).toLocaleDateString('de-DE') : 'Nicht angegeben'})\n`;
          }
        } else if (status === 'abgelehnt') {
          message += `Kommentar: ${kommentar || 'Kein Kommentar'}\n`;
        }

        alert(message);
        resetForm();
      } else {
        throw new Error(result.message || 'Fehler beim Speichern der Daten');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.');
    }
  };

  const ValidationMessage = memo(({ message }: { message: string }) => (
    <div className="mt-2">
      <div className="flex items-center">
        <svg width="10" height="10" viewBox="0 0 20 20" className="mr-1.5" style={{ fill: '#dc2626' }}>
          <circle cx="10" cy="10" r="10"/>
          <text x="7.3" y="15" style={{ fill: 'white', fontSize: '14px', fontWeight: 'bold' }}>!</text>
        </svg>
        <span style={{ color: '#dc2626' }} className="text-sm font-medium">{message}</span>
      </div>
    </div>
  ));

  ValidationMessage.displayName = 'ValidationMessage';

  const AlternativeLenseField = memo(({ 
    label, 
    value, 
    onValueChange, 
    dateValue, 
    onDateChange,
    isRequired = false,
    hasError = false,
    dateError = false
  }: { 
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    dateValue: Date | null;
    onDateChange: (date: Date | null) => void;
    isRequired?: boolean;
    hasError?: boolean;
    dateError?: boolean;
  }) => {
    const [localValue, setLocalValue] = useState(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
    };

    const handleBlur = () => {
      onValueChange(localValue);
    };

    // Formatiere den Label-Text mit großgeschriebenem "Linse"
    const formattedLabel = label.toLowerCase().replace('linse', 'Linse');

    return (
      <div style={{ marginBottom: '16px' }}>
        <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: '8px' }}>
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <input
              type="text"
              value={localValue}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full h-[44px] px-4 bg-gray-50 border ${hasError ? 'border-red-500' : 'border-gray-200'} rounded-[8px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-500/50 text-[15px]`}
              placeholder={`Bitte geben Sie ${formattedLabel} ein`}
            />
            {hasError && (
              <ValidationMessage message={`Pflichtfeld: Bitte geben Sie ${formattedLabel} ein`} />
            )}
          </div>
          <div>
            <DatePicker
              selected={dateValue}
              onChange={onDateChange}
              dateFormat="dd.MM.yyyy"
              locale={de}
              className={`w-full h-[44px] px-4 bg-gray-50 border ${dateError ? 'border-red-500' : 'border-gray-200'} rounded-[8px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-500/50 text-[15px]`}
              placeholderText="TT.MM.JJJJ"
              required={isRequired}
            />
            {dateError && (
              <ValidationMessage message="Pflichtfeld: Bitte geben Sie ein Datum ein" />
            )}
          </div>
        </div>
      </div>
    );
  });

  AlternativeLenseField.displayName = 'AlternativeLenseField';

  const handleAlternativeLense1Change = useCallback((value: string) => {
    setAlternativeLinse1(value);
    setValidationErrors(prev => ({ ...prev, alternativeLinse1: false }));
  }, []);

  const handleLieferdatum1Change = useCallback((date: Date | null) => {
    setLieferdatum1(date);
    setValidationErrors(prev => ({ ...prev, lieferdatum1: false }));
  }, []);

  const handleAlternativeLense2Change = useCallback((value: string) => {
    setAlternativeLinse2(value);
  }, []);

  const handleLieferdatum2Change = useCallback((date: Date | null) => {
    setLieferdatum2(date);
  }, []);

  const handleAlternativeLense3Change = useCallback((value: string) => {
    setAlternativeLinse3(value);
  }, []);

  const handleLieferdatum3Change = useCallback((date: Date | null) => {
    setLieferdatum3(date);
  }, []);

  const validateForm = () => {
    const errors: ValidationErrors = {};
    
    if (status === 'ausgeführt' && !lieferdatum1) {
      errors.lieferdatum1 = true;
    }

    if (status === 'alternative') {
      if (!alternativeLinse1.trim()) errors.alternativeLinse1 = true;
      if (!lieferdatum1) errors.lieferdatum1 = true;
    }

    if (status === 'abgelehnt' && !kommentar.trim()) {
      errors.kommentar = true;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setStatus('ausgeführt');
    setAlternativeLinse1('');
    setAlternativeLinse2('');
    setAlternativeLinse3('');
    setLieferdatum1(null);
    setLieferdatum2(null);
    setLieferdatum3(null);
    setKommentar('');
    setValidationErrors({});
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-[460px] my-12">
        <div className="bg-white rounded-[10px] shadow-lg shadow-blue-100/50 p-16">
          <div className="text-center mb-20">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
              Linsenbestellung
            </h1>
            {bestellnummer && (
              <div style={{ color: '#1d4ed8', fontSize: '28px', fontWeight: 600 }} className="mb-8">
                OrderID {bestellnummer}
              </div>
            )}
            <p className="text-gray-500 text-sm">Bitte geben Sie Ihre Rückmeldung ein</p>
          </div>
          
          <div className="space-y-20">
            <div className="mb-20">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Status der Bestellung
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as FormStatus);
                  setValidationErrors({});
                }}
                className="w-full h-[44px] px-4 bg-gray-50 border border-gray-200 rounded-[8px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-500/50 text-[15px]"
              >
                <option value="ausgeführt">Bestellung wird ausgeführt</option>
                <option value="alternative">Alternative wird vorgeschlagen</option>
                <option value="abgelehnt">Bestellung abgelehnt</option>
              </select>
            </div>

            <div>
              {status === 'ausgeführt' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Voraussichtliches Lieferdatum
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <DatePicker
                      selected={lieferdatum1}
                      onChange={(date) => {
                        setLieferdatum1(date);
                        setValidationErrors({ ...validationErrors, lieferdatum1: false });
                      }}
                      dateFormat="dd.MM.yyyy"
                      locale={de}
                      className={`w-full h-[44px] px-4 bg-gray-50 border ${validationErrors.lieferdatum1 ? 'border-red-500' : 'border-gray-200'} rounded-[8px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-500/50 text-[15px]`}
                      placeholderText="TT.MM.JJJJ"
                      required
                    />
                    {validationErrors.lieferdatum1 && (
                      <ValidationMessage message="Pflichtfeld: Bitte geben Sie ein Datum ein" />
                    )}
                  </div>
                </div>
              )}

              {status === 'alternative' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <AlternativeLenseField
                    label="Alternative Linse 1"
                    value={alternativeLinse1}
                    onValueChange={handleAlternativeLense1Change}
                    dateValue={lieferdatum1}
                    onDateChange={handleLieferdatum1Change}
                    isRequired={true}
                    hasError={validationErrors.alternativeLinse1 || false}
                    dateError={validationErrors.lieferdatum1 || false}
                  />
                  <AlternativeLenseField
                    label="Alternative Linse 2"
                    value={alternativeLinse2}
                    onValueChange={handleAlternativeLense2Change}
                    dateValue={lieferdatum2}
                    onDateChange={handleLieferdatum2Change}
                    isRequired={false}
                    hasError={false}
                    dateError={false}
                  />
                  <AlternativeLenseField
                    label="Alternative Linse 3"
                    value={alternativeLinse3}
                    onValueChange={handleAlternativeLense3Change}
                    dateValue={lieferdatum3}
                    onDateChange={handleLieferdatum3Change}
                    isRequired={false}
                    hasError={false}
                    dateError={false}
                  />
                </div>
              )}

              {status === 'abgelehnt' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Begründung für die Ablehnung
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      value={kommentar}
                      onChange={(e) => {
                        setKommentar(e.target.value);
                        setValidationErrors({ ...validationErrors, kommentar: false });
                      }}
                      className={`w-full h-32 px-4 py-3 bg-gray-50 border ${validationErrors.kommentar ? 'border-red-500' : 'border-gray-200'} rounded-[8px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-500/50 resize-none text-[15px]`}
                      placeholder="Bitte geben Sie einen Grund für die Ablehnung an"
                    />
                    {validationErrors.kommentar && (
                      <ValidationMessage message="Pflichtfeld: Bitte geben Sie eine Begründung ein" />
                    )}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <button
                type="submit"
                className="w-full h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-600/25 font-medium text-[15px]"
              >
                Rückmeldung absenden
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 