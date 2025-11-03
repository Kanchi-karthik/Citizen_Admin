// Helper function to format dates
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Helper function to convert an array of objects to CSV string
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';

  const csvRows = [];
  const columnHeaders = headers || Object.keys(data[0]);
  csvRows.push(columnHeaders.join(','));

  for (const row of data) {
    const values = columnHeaders.map(header => {
      const value = row[header] !== undefined && row[header] !== null ? row[header] : '';
      const escaped = ('' + value).replace(/"/g, '""'); // Escape double quotes
      return `"${escaped}"`; // Quote all values to handle commas and special characters
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

// Helper to trigger file download
export const downloadCSV = (csvString, filename) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
