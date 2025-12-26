export const generateCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Extract headers from the first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle strings with commas or quotes
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    // Create Blob and Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
