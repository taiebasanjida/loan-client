// Export data to CSV
export const exportToCSV = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle values with commas, quotes, or newlines
          if (value === null || value === undefined) return '';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export data to PDF (simple text-based PDF)
export const exportToPDF = (data, title = 'Export', filename = 'export') => {
  if (!data || data.length === 0) {
    return;
  }

  // Create a simple text-based PDF content
  let pdfContent = `%PDF-1.4\n`;
  pdfContent += `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  pdfContent += `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  
  // Create content stream
  let textContent = `BT\n/F1 12 Tf\n50 750 Td\n(${title}) Tj\n0 -20 Td\n`;
  
  // Get headers
  const headers = Object.keys(data[0]);
  textContent += `(${headers.join(' | ')}) Tj\n0 -15 Td\n`;
  
  // Add data rows
  data.forEach((row, index) => {
    if (index > 50) return; // Limit to 50 rows for simplicity
    const rowText = headers.map((h) => String(row[h] || '')).join(' | ');
    textContent += `(${rowText.substring(0, 100)}) Tj\n0 -15 Td\n`; // Limit text length
  });
  
  textContent += `ET\n`;
  
  // For a proper PDF, we'd need a full PDF library
  // For now, we'll create a simple text file that can be opened
  const blob = new Blob([textContent], { type: 'text/plain' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.txt`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Note: For proper PDF generation, install jspdf: npm install jspdf
  // This is a simplified version that exports as text
};

// Format loan data for export
export const formatLoansForExport = (loans) => {
  return loans.map((loan) => ({
    'Loan ID': loan._id?.substring(0, 8) || 'N/A',
    Title: loan.title || 'N/A',
    Category: loan.category || 'N/A',
    'Interest Rate': `${loan.interestRate || 0}%`,
    'Max Loan Limit': `$${loan.maxLoanLimit?.toLocaleString() || 0}`,
    'Show on Home': loan.showOnHome ? 'Yes' : 'No',
    'Created By': loan.createdBy?.name || 'N/A',
    'Created At': loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : 'N/A',
  }));
};

// Format application data for export
export const formatApplicationsForExport = (applications) => {
  return applications.map((app) => ({
    'Application ID': app._id?.substring(0, 8) || 'N/A',
    'Loan Title': app.loanTitle || 'N/A',
    'Borrower Name': `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'N/A',
    'Borrower Email': app.email || 'N/A',
    'Loan Amount': `$${app.loanAmount?.toLocaleString() || 0}`,
    Status: app.status || 'N/A',
    'Application Fee Status': app.applicationFeeStatus || 'N/A',
    'Repayment Status': app.repaymentStatus || 'N/A',
    'Applied Date': app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A',
    'Approved Date': app.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : 'N/A',
  }));
};

