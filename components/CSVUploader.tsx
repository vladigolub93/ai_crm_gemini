
import React, { useState, useCallback } from 'react';

interface CSVUploaderProps<T> {
  onDataLoaded: (data: T[]) => void;
  buttonText: string;
}

const CSVUploader = <T extends object,>({ onDataLoaded, buttonText }: CSVUploaderProps<T>): React.ReactElement => {
  const [fileName, setFileName] = useState('');

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert("CSV must have a header row and at least one data row.");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header as keyof T] = values[index]?.trim() as any;
          return obj;
        }, {} as T);
      });
      onDataLoaded(data);
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  }, [onDataLoaded]);

  return (
    <div className="flex items-center space-x-2">
      <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md cursor-pointer transition-colors">
        <span>{buttonText}</span>
        <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      </label>
      {fileName && <span className="text-sm text-gray-400">{fileName}</span>}
    </div>
  );
};

export default CSVUploader;
