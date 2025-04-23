'use client';

import { useState, useEffect, useCallback, memo, Suspense, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { de } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';

interface ValidationErrors {
  lieferwoche?: boolean;
  lieferwoche1?: boolean;
  alternativeLinse1?: boolean;
  kommentar?: boolean;
  sph1?: boolean;
  cyl1?: boolean;
  ax1?: boolean;
  len1?: boolean;
  ean1?: boolean;
  ean2?: boolean;
  ean3?: boolean;
}

type FormStatus = 'ausgeführt' | 'alternative' | 'abgelehnt';

interface FormDataType {
  orderId: string | null;
  status: FormStatus;
  ean: string | null;
  lieferwoche?: number | null;
  ean1?: string | null;
  implantat1?: string | null;
  sph1?: number | null;
  cyl1?: number | null;
  ax1?: number | null;
  len1?: number | null;
  lieferwoche1?: number | null;
  ean2?: string | null;
  implantat2?: string | null;
  sph2?: number | null;
  cyl2?: number | null;
  ax2?: number | null;
  len2?: number | null;
  lieferwoche2?: number | null;
  ean3?: string | null;
  implantat3?: string | null;
  sph3?: number | null;
  cyl3?: number | null;
  ax3?: number | null;
  len3?: number | null;
  lieferwoche3?: number | null;
  kommentar?: string | null;
}

// Funktion zum Erstellen der CSV-Datei
const createCSV = (data: FormDataType) => {
  // Filter out undefined values and convert numbers to strings with commas
  const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'number') {
        acc[key] = value.toString().replace('.', ',');
      } else {
        acc[key] = value;
      }
    }
    return acc;
  }, {} as Record<string, string | number>);

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
        fileName: `Linsenbestellung_${orderId}_${new Date().toISOString().split('T')[0]}.csv`,
        orderId // Include orderId in the request body
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Fehler beim Speichern der CSV-Datei');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in saveCSV:', error);
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
  const formRef = useRef<HTMLFormElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // Normalize query parameters to be case-insensitive
  const queryParams = new URLSearchParams(searchParams.toString());
  let bestellnummer = null;
  let ean = null;

  for (const [key, value] of queryParams.entries()) {
    if (key.toLowerCase() === 'orderid') {
      bestellnummer = value;
    } else if (key.toLowerCase() === 'ean') {
      ean = value;
    }
  }

  const [status, setStatus] = useState<FormStatus>('ausgeführt');
  
  // Hauptbestellung
  const [lieferwoche, setLieferwoche] = useState<number | null>(null);
  
  // Alternative 1
  const [implantat1, setImplantat1] = useState('');
  const [sph1, setSph1] = useState<number | null>(null);
  const [cyl1, setCyl1] = useState<number | null>(null);
  const [ax1, setAx1] = useState<number | null>(null);
  const [len1, setLen1] = useState<number | null>(null);
  const [lieferwoche1, setLieferwoche1] = useState<number | null>(null);
  const [ean1, setEan1] = useState<string>('');
  
  // Alternative 2
  const [implantat2, setImplantat2] = useState('');
  const [sph2, setSph2] = useState<number | null>(null);
  const [cyl2, setCyl2] = useState<number | null>(null);
  const [ax2, setAx2] = useState<number | null>(null);
  const [len2, setLen2] = useState<number | null>(null);
  const [lieferwoche2, setLieferwoche2] = useState<number | null>(null);
  const [ean2, setEan2] = useState<string>('');
  
  // Alternative 3
  const [implantat3, setImplantat3] = useState('');
  const [sph3, setSph3] = useState<number | null>(null);
  const [cyl3, setCyl3] = useState<number | null>(null);
  const [ax3, setAx3] = useState<number | null>(null);
  const [len3, setLen3] = useState<number | null>(null);
  const [lieferwoche3, setLieferwoche3] = useState<number | null>(null);
  const [ean3, setEan3] = useState<string>('');
  
  const [kommentar, setKommentar] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Debug state updates
  useEffect(() => {
    console.log('Form state updated:', {
      sph1, cyl1, ax1, len1,
      sph2, cyl2, ax2, len2,
      sph3, cyl3, ax3, len3
    });
  }, [sph1, cyl1, ax1, len1, sph2, cyl2, ax2, len2, sph3, cyl3, ax3, len3]);

  // Save scroll position before state updates
  const saveScrollPosition = () => {
    scrollPositionRef.current = window.scrollY;
  };

  // Restore scroll position after state updates
  const restoreScrollPosition = () => {
    window.scrollTo(0, scrollPositionRef.current);
  };

  // Remove the useCallback handlers
  const handleSph1Change = (value: number | null) => {
    setSph1(value);
  };

  const handleCyl1Change = (value: number | null) => {
    setCyl1(value);
  };

  const handleAx1Change = (value: number | null) => {
    setAx1(value);
  };

  const handleLen1Change = (value: number | null) => {
    setLen1(value);
  };

  const handleSph2Change = (value: number | null) => {
    setSph2(value);
  };

  const handleCyl2Change = (value: number | null) => {
    setCyl2(value);
  };

  const handleAx2Change = (value: number | null) => {
    setAx2(value);
  };

  const handleLen2Change = (value: number | null) => {
    setLen2(value);
  };

  const handleSph3Change = (value: number | null) => {
    setSph3(value);
  };

  const handleCyl3Change = (value: number | null) => {
    setCyl3(value);
  };

  const handleAx3Change = (value: number | null) => {
    setAx3(value);
  };

  const handleLen3Change = (value: number | null) => {
    setLen3(value);
  };

  useEffect(() => {
    if (!bestellnummer) {
      console.warn('Keine OrderID in der URL gefunden');
    }
    if (!ean) {
      console.warn('Keine EAN in der URL gefunden');
    }
  }, [bestellnummer, ean]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with status:', status);
    
    // Validate form
    const errors: ValidationErrors = {};
    
    if (status === 'ausgeführt' && !lieferwoche) {
      errors.lieferwoche = true;
    }

    if (status === 'alternative') {
      console.log('Validating alternative form:', {
        lieferwoche1,
        sph1,
        cyl1,
        ax1,
        len1
      });
      
      if (!lieferwoche1) errors.lieferwoche1 = true;
      
      // Validate numeric fields for the first alternative
      if (sph1 === null || isNaN(sph1)) errors.sph1 = true;
      if (cyl1 === null || isNaN(cyl1)) errors.cyl1 = true;
      if (ax1 === null || isNaN(ax1)) errors.ax1 = true;
      if (len1 === null || isNaN(len1)) errors.len1 = true;
    }

    if (status === 'abgelehnt' && !kommentar.trim()) {
      errors.kommentar = true;
    }

    console.log('Validation errors:', errors);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      console.log('Form validation failed');
      return;
    }

    // Prepare form data
    const formData: FormDataType = {
      orderId: bestellnummer,
      status,
      ean,
      lieferwoche: status === 'ausgeführt' ? lieferwoche : undefined,
      kommentar: kommentar || undefined
    };

    // Add status-specific data
    if (status === 'alternative') {
      console.log('Preparing alternative form data');
      formData.ean1 = ean1 || undefined;
      formData.sph1 = sph1 || undefined;
      formData.cyl1 = cyl1 || undefined;
      formData.ax1 = ax1 || undefined;
      formData.len1 = len1 || undefined;
      formData.lieferwoche1 = lieferwoche1 || undefined;

      if (sph2 || cyl2 || ax2 || len2) {
        formData.ean2 = ean2 || undefined;
        formData.sph2 = sph2 || undefined;
        formData.cyl2 = cyl2 || undefined;
        formData.ax2 = ax2 || undefined;
        formData.len2 = len2 || undefined;
        formData.lieferwoche2 = lieferwoche2 || undefined;
      }

      if (sph3 || cyl3 || ax3 || len3) {
        formData.ean3 = ean3 || undefined;
        formData.sph3 = sph3 || undefined;
        formData.cyl3 = cyl3 || undefined;
        formData.ax3 = ax3 || undefined;
        formData.len3 = len3 || undefined;
        formData.lieferwoche3 = lieferwoche3 || undefined;
      }
    }

    console.log('Submitting form data:', formData);

    try {
      const response = await fetch('/api/save-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Speichern der CSV-Datei');
      }

      const result = await response.json();
      console.log('Form submission successful:', result);
      alert('Daten erfolgreich gespeichert!');
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Fehler beim Speichern der Daten: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
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

  const LensParametersField = memo(({ 
    index,
    ean,
    implantat,
    sph,
    cyl,
    ax,
    len,
    lieferwoche,
    onEanChange,
    onImplantatChange,
    onSphChange,
    onCylChange,
    onAxChange,
    onLenChange,
    onLieferwocheChange,
    isRequired = false,
    hasError = false,
    lieferwocheError = false,
    eanError = false
  }: { 
    index: number;
    ean: string;
    implantat: string;
    sph: number | null;
    cyl: number | null;
    ax: number | null;
    len: number | null;
    lieferwoche: number | null;
    onEanChange: (value: string) => void;
    onImplantatChange: (value: string) => void;
    onSphChange: (value: number | null) => void;
    onCylChange: (value: number | null) => void;
    onAxChange: (value: number | null) => void;
    onLenChange: (value: number | null) => void;
    onLieferwocheChange: (date: Date | null) => void;
    isRequired?: boolean;
    hasError?: boolean;
    lieferwocheError?: boolean;
    eanError?: boolean;
  }) => {
    // Local state for input values
    const [localSph, setLocalSph] = useState(sph?.toString() || '');
    const [localCyl, setLocalCyl] = useState(cyl?.toString() || '');
    const [localAx, setLocalAx] = useState(ax?.toString() || '');
    const [localLen, setLocalLen] = useState(len?.toString() || '');
    const [localEan, setLocalEan] = useState(ean || '');

    // Input handlers
    const handleEanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalEan(e.target.value);
    };

    const handleEanBlur = () => {
      onEanChange(localEan);
    };

    const handleSphChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Convert any period to comma immediately
      const value = e.target.value.replace('.', ',');
      setLocalSph(value);
    };

    const handleSphBlur = () => {
      const value = localSph;
      if (value === '' || value === '-') {
        onSphChange(null);
        return;
      }
      // Convert comma to period for parsing, then back to comma for display
      const num = parseFloat(value.replace(',', '.'));
      if (!isNaN(num)) {
        onSphChange(num);
        setLocalSph(value); // Keep the comma in display
      } else {
        onSphChange(null);
      }
    };

    const handleCylChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace('.', ',');
      setLocalCyl(value);
    };

    const handleCylBlur = () => {
      const value = localCyl;
      if (value === '' || value === '-') {
        onCylChange(null);
        return;
      }
      const num = parseFloat(value.replace(',', '.'));
      if (!isNaN(num)) {
        onCylChange(num);
        setLocalCyl(value); // Keep the comma in display
      } else {
        onCylChange(null);
      }
    };

    const handleAxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalAx(e.target.value);
    };

    const handleAxBlur = () => {
      const value = localAx;
      if (value === '') {
        onAxChange(null);
        return;
      }
      const num = parseInt(value);
      if (!isNaN(num)) {
        onAxChange(num);
      } else {
        onAxChange(null);
      }
    };

    const handleLenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace('.', ',');
      setLocalLen(value);
    };

    const handleLenBlur = () => {
      const value = localLen;
      if (value === '' || value === '-') {
        onLenChange(null);
        return;
      }
      const num = parseFloat(value.replace(',', '.'));
      if (!isNaN(num)) {
        onLenChange(num);
        setLocalLen(value); // Keep the comma in display
      } else {
        onLenChange(null);
      }
    };

    // Update local state when props change
    useEffect(() => {
      setLocalSph(sph !== null ? sph.toString().replace('.', ',') : '');
      setLocalCyl(cyl !== null ? cyl.toString().replace('.', ',') : '');
      setLocalAx(ax !== null ? ax.toString() : '');
      setLocalLen(len !== null ? len.toString().replace('.', ',') : '');
      setLocalEan(ean || '');
    }, [sph, cyl, ax, len, ean]);

    // Format value for display
    const formatValue = (value: number | null): string => {
      if (value === null) return '';
      return value.toString();
    };

    return (
      <div className={`space-y-4 p-6 rounded-lg ${index === 1 ? 'bg-blue-50 border border-blue-100' : index === 2 ? 'bg-gray-50 border border-gray-100' : 'bg-gray-50/50 border border-gray-100'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-800">
            Alternative {index} {isRequired && <span className="text-red-500">*</span>}
          </h3>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            EAN {isRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={localEan}
            onChange={handleEanChange}
            onBlur={handleEanBlur}
            className={`w-full h-[38px] px-3 bg-white border ${eanError ? 'border-red-500' : 'border-gray-300'} rounded-[4px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[14px]`}
            placeholder="EAN eingeben"
            required={isRequired}
          />
          {eanError && (
            <ValidationMessage message="Pflichtfeld: Bitte geben Sie eine EAN ein" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sph {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={localSph}
              onChange={handleSphChange}
              onBlur={handleSphBlur}
              className="w-full h-[38px] px-3 bg-white border border-gray-300 rounded-[4px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[14px]"
              placeholder="Sph"
              required={isRequired}
              inputMode="decimal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cyl {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={localCyl}
              onChange={handleCylChange}
              onBlur={handleCylBlur}
              className="w-full h-[38px] px-3 bg-white border border-gray-300 rounded-[4px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[14px]"
              placeholder="Cyl"
              required={isRequired}
              inputMode="decimal"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ax {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={localAx}
              onChange={handleAxChange}
              onBlur={handleAxBlur}
              className="w-full h-[38px] px-3 bg-white border border-gray-300 rounded-[4px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[14px]"
              placeholder="Ax"
              required={isRequired}
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Len {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={localLen}
              onChange={handleLenChange}
              onBlur={handleLenBlur}
              className="w-full h-[38px] px-3 bg-white border border-gray-300 rounded-[4px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[14px]"
              placeholder="Len"
              required={isRequired}
              inputMode="decimal"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voraussichtliche Lieferwoche {isRequired && <span className="text-red-500">*</span>}
          </label>
          <DatePicker
            selected={lieferwoche ? getDateFromWeekNumber(lieferwoche) : null}
            onChange={onLieferwocheChange}
            dateFormat="'KW' ww, yyyy"
            showWeekNumbers
            locale={de}
            className={`w-full h-[38px] px-3 bg-white border ${lieferwocheError ? 'border-red-500' : 'border-gray-300'} rounded-[4px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[14px]`}
            placeholderText="Kalenderwoche auswählen"
            required={isRequired}
            openToDate={new Date()}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            todayButton="Heute"
          />
          {lieferwocheError && (
            <ValidationMessage message="Pflichtfeld: Bitte geben Sie eine Lieferwoche ein" />
          )}
        </div>
      </div>
    );
  });

  LensParametersField.displayName = 'LensParametersField';

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    // Get the ISO week number
    const firstDayOfYear = new Date(target.getFullYear(), 0, 1);
    const pastDaysOfYear = (target.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Helper function to get a date from week number
  const getDateFromWeekNumber = (weekNumber: number): Date => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const firstDayOfYear = new Date(currentYear, 0, 1);
    const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7;
    const firstMonday = new Date(currentYear, 0, 1 + daysToFirstMonday);
    const targetDate = new Date(firstMonday);
    targetDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
    return targetDate;
  };

  const handleDateChange = (date: Date | null, setter: (value: number | null) => void) => {
    if (date) {
      const weekNumber = getWeekNumber(date);
      setter(weekNumber);
    } else {
      setter(null);
    }
  };

  const handleEan1Change = (value: string) => {
    setEan1(value);
  };

  const handleEan2Change = (value: string) => {
    setEan2(value);
  };

  const handleEan3Change = (value: string) => {
    setEan3(value);
  };

  // Consolidate alternative lens handlers
  const createAlternativeLensHandler = (index: number) => {
    const setters = {
      implantat: [setImplantat1, setImplantat2, setImplantat3],
      lieferwoche: [setLieferwoche1, setLieferwoche2, setLieferwoche3],
      ean: [setEan1, setEan2, setEan3],
      sph: [setSph1, setSph2, setSph3],
      cyl: [setCyl1, setCyl2, setCyl3],
      ax: [setAx1, setAx2, setAx3],
      len: [setLen1, setLen2, setLen3]
    };

    return {
      handleImplantatChange: (value: string) => setters.implantat[index - 1](value),
      handleLieferwocheChange: (date: Date | null) => handleDateChange(date, setters.lieferwoche[index - 1]),
      handleEanChange: (value: string) => setters.ean[index - 1](value),
      handleSphChange: (value: number | null) => setters.sph[index - 1](value),
      handleCylChange: (value: number | null) => setters.cyl[index - 1](value),
      handleAxChange: (value: number | null) => setters.ax[index - 1](value),
      handleLenChange: (value: number | null) => setters.len[index - 1](value)
    };
  };

  // Remove individual handler functions and use the consolidated version
  const alternative1Handlers = createAlternativeLensHandler(1);
  const alternative2Handlers = createAlternativeLensHandler(2);
  const alternative3Handlers = createAlternativeLensHandler(3);

  // Update the LensParametersField components to use the new handlers
  const resetForm = () => {
    setStatus('ausgeführt');
    setImplantat1('');
    setImplantat2('');
    setImplantat3('');
    setEan1('');
    setEan2('');
    setEan3('');
    setLieferwoche(null);
    setLieferwoche1(null);
    setLieferwoche2(null);
    setLieferwoche3(null);
    setSph1(null);
    setSph2(null);
    setSph3(null);
    setCyl1(null);
    setCyl2(null);
    setCyl3(null);
    setAx1(null);
    setAx2(null);
    setAx3(null);
    setLen1(null);
    setLen2(null);
    setLen3(null);
    setKommentar('');
    setValidationErrors({});
  };

  return (
    <main className="min-h-screen p-8 bg-white">
      <div className="w-full max-w-[800px] mx-auto bg-white p-8 border-2 border-gray-200 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Linsenbestellung
          </h1>
          {bestellnummer && (
            <p className="text-blue-600 font-medium mb-4">Bestellnummer: {bestellnummer}</p>
          )}
          <p className="text-gray-600 text-sm mb-4">Mit dem Anklicken des Optionsfeldes können Sie die Bestellung entweder bestätigen, ablehnen oder eine Alternative vorschlagen. Vielen Dank für Ihre Mitwirkung.</p>
          <p className="text-gray-500 text-sm">Bitte geben Sie Ihre Rückmeldung ein</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status der Bestellung
            </label>
            <select
              value={status}
              onChange={(e) => {
                saveScrollPosition();
                setStatus(e.target.value as FormStatus);
                setValidationErrors({});
                requestAnimationFrame(restoreScrollPosition);
              }}
              className="w-full h-[38px] px-3 bg-white border border-gray-300 rounded-[4px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[14px]"
            >
              <option value="ausgeführt">Bestellung wird ausgeführt</option>
              <option value="alternative">Nicht lieferbar, Alternativimplantat wird angeboten</option>
              <option value="abgelehnt">Bestellung abgelehnt</option>
            </select>
          </div>

          <div>
            {status === 'ausgeführt' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voraussichtliche Lieferwoche
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <DatePicker
                    selected={lieferwoche ? getDateFromWeekNumber(lieferwoche) : null}
                    onChange={(date) => {
                      saveScrollPosition();
                      handleDateChange(date, setLieferwoche);
                      setValidationErrors({ ...validationErrors, lieferwoche: false });
                      requestAnimationFrame(restoreScrollPosition);
                    }}
                    dateFormat="'KW' ww, yyyy"
                    showWeekNumbers
                    locale={de}
                    className="w-full h-[38px] px-3 bg-white border border-gray-300 rounded-[4px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[14px]"
                    placeholderText="Kalenderwoche auswählen"
                  />
                  {validationErrors.lieferwoche && (
                    <ValidationMessage message="Pflichtfeld: Bitte geben Sie eine Lieferwoche ein" />
                  )}
                </div>
              </div>
            )}

            {status === 'alternative' && (
              <div className="space-y-6">
                <LensParametersField
                  key="alternative1"
                  index={1}
                  ean={ean1}
                  implantat={implantat1}
                  sph={sph1}
                  cyl={cyl1}
                  ax={ax1}
                  len={len1}
                  lieferwoche={lieferwoche1}
                  onEanChange={alternative1Handlers.handleEanChange}
                  onImplantatChange={alternative1Handlers.handleImplantatChange}
                  onSphChange={alternative1Handlers.handleSphChange}
                  onCylChange={alternative1Handlers.handleCylChange}
                  onAxChange={alternative1Handlers.handleAxChange}
                  onLenChange={alternative1Handlers.handleLenChange}
                  onLieferwocheChange={alternative1Handlers.handleLieferwocheChange}
                  isRequired={true}
                  hasError={validationErrors.lieferwoche1 || false}
                  lieferwocheError={validationErrors.lieferwoche1 || false}
                  eanError={validationErrors.ean1 || false}
                />
                <LensParametersField
                  key="alternative2"
                  index={2}
                  ean={ean2}
                  implantat={implantat2}
                  sph={sph2}
                  cyl={cyl2}
                  ax={ax2}
                  len={len2}
                  lieferwoche={lieferwoche2}
                  onEanChange={alternative2Handlers.handleEanChange}
                  onImplantatChange={alternative2Handlers.handleImplantatChange}
                  onSphChange={alternative2Handlers.handleSphChange}
                  onCylChange={alternative2Handlers.handleCylChange}
                  onAxChange={alternative2Handlers.handleAxChange}
                  onLenChange={alternative2Handlers.handleLenChange}
                  onLieferwocheChange={alternative2Handlers.handleLieferwocheChange}
                />
                <LensParametersField
                  key="alternative3"
                  index={3}
                  ean={ean3}
                  implantat={implantat3}
                  sph={sph3}
                  cyl={cyl3}
                  ax={ax3}
                  len={len3}
                  lieferwoche={lieferwoche3}
                  onEanChange={alternative3Handlers.handleEanChange}
                  onImplantatChange={alternative3Handlers.handleImplantatChange}
                  onSphChange={alternative3Handlers.handleSphChange}
                  onCylChange={alternative3Handlers.handleCylChange}
                  onAxChange={alternative3Handlers.handleAxChange}
                  onLenChange={alternative3Handlers.handleLenChange}
                  onLieferwocheChange={alternative3Handlers.handleLieferwocheChange}
                />
              </div>
            )}

            {status === 'abgelehnt' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Begründung für die Ablehnung
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={kommentar}
                    onChange={(e) => {
                      saveScrollPosition();
                      setKommentar(e.target.value);
                      setValidationErrors({ ...validationErrors, kommentar: false });
                      requestAnimationFrame(restoreScrollPosition);
                    }}
                    className="w-full h-32 px-3 py-2 bg-white border border-gray-300 rounded-[4px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-[14px]"
                    placeholder="Bitte geben Sie einen Grund für die Ablehnung an"
                  />
                  {validationErrors.kommentar && (
                    <ValidationMessage message="Pflichtfeld: Bitte geben Sie eine Begründung ein" />
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-[38px] bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium text-[14px]"
          >
            Rückmeldung absenden
          </button>
        </form>
      </div>
    </main>
  );
} 