// Utility functions for exporting data to CSV

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: { key: keyof T; label: string }[]
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object if not provided
  const keys = headers 
    ? headers.map(h => h.key) 
    : (Object.keys(data[0]) as (keyof T)[]);
  
  const headerLabels = headers 
    ? headers.map(h => h.label) 
    : keys.map(k => String(k));

  // Build CSV content
  const csvRows: string[] = [];
  
  // Add header row
  csvRows.push(headerLabels.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = keys.map(key => {
      const value = row[key];
      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma
        const escaped = value.replace(/"/g, '""');
        return value.includes(',') || value.includes('"') || value.includes('\n')
          ? `"${escaped}"`
          : escaped;
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return String(value);
    });
    csvRows.push(values.join(','));
  }

  // Create blob and download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Pre-configured export functions for common entities
export function exportClients(clients: { name: string; email: string; company?: string; phone?: string }[]) {
  exportToCSV(clients, 'clientes', [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'company', label: 'Empresa' },
    { key: 'phone', label: 'Teléfono' },
  ]);
}

export function exportProjects(projects: { name: string; status: string; budget?: number; startDate?: string }[]) {
  exportToCSV(projects, 'proyectos', [
    { key: 'name', label: 'Nombre' },
    { key: 'status', label: 'Estado' },
    { key: 'budget', label: 'Presupuesto' },
    { key: 'startDate', label: 'Fecha Inicio' },
  ]);
}

export function exportInvoices(invoices: { number: string; clientName: string; total: number; status: string; dueDate?: string }[]) {
  exportToCSV(invoices, 'facturas', [
    { key: 'number', label: 'Número' },
    { key: 'clientName', label: 'Cliente' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Estado' },
    { key: 'dueDate', label: 'Fecha Vencimiento' },
  ]);
}
