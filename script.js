// Global variables
let currentWorkbook = null;
let currentData = null;
let filteredData = null;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const sheetSelector = document.getElementById('sheetSelector');
const tableSection = document.getElementById('tableSection');
const tableContainer = document.getElementById('tableContainer');
const searchInput = document.getElementById('searchInput');
const exportBtn = document.getElementById('exportBtn');
const errorMessage = document.getElementById('errorMessage');
const rowCount = document.getElementById('rowCount');
const colCount = document.getElementById('colCount');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // File upload events
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // Sheet selector
    sheetSelector.addEventListener('change', handleSheetChange);
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Export functionality
    exportBtn.addEventListener('click', handleExport);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    // Validate file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                       'application/vnd.ms-excel', 
                       'text/csv'];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    
    const isValidType = validTypes.includes(file.type) || 
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
        showError('Please select a valid Excel file (.xlsx, .xls) or CSV file.');
        return;
    }
    
    // Show file info
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'flex';
    hideError();
    
    // Read the file
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            currentWorkbook = XLSX.read(data, { type: 'array' });
            
            // Populate sheet selector
            populateSheetSelector();
            
            // Load first sheet by default
            if (currentWorkbook.SheetNames.length > 0) {
                loadSheet(currentWorkbook.SheetNames[0]);
            }
        } catch (error) {
            showError('Error reading file: ' + error.message);
        }
    };
    
    reader.onerror = function() {
        showError('Error reading file. Please try again.');
    };
    
    reader.readAsArrayBuffer(file);
}

function populateSheetSelector() {
    sheetSelector.innerHTML = '';
    currentWorkbook.SheetNames.forEach(sheetName => {
        const option = document.createElement('option');
        option.value = sheetName;
        option.textContent = sheetName;
        sheetSelector.appendChild(option);
    });
}

function handleSheetChange() {
    const selectedSheet = sheetSelector.value;
    if (selectedSheet) {
        loadSheet(selectedSheet);
    }
}

function loadSheet(sheetName) {
    try {
        const worksheet = currentWorkbook.Sheets[sheetName];
        currentData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        
        // Remove empty rows at the end
        while (currentData.length > 0 && currentData[currentData.length - 1].every(cell => cell === '')) {
            currentData.pop();
        }
        
        // Reset filtered data
        filteredData = [...currentData];
        
        // Clear search
        searchInput.value = '';
        
        // Render table
        renderTable();
        
        // Show table section
        tableSection.style.display = 'block';
        
    } catch (error) {
        showError('Error loading sheet: ' + error.message);
    }
}

function renderTable() {
    if (!filteredData || filteredData.length === 0) {
        tableContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No data to display</p>';
        updateTableInfo(0, 0);
        return;
    }
    
    const table = document.createElement('table');
    
    // Create header row
    if (filteredData.length > 0) {
        const headerRow = document.createElement('tr');
        const maxCols = Math.max(...filteredData.map(row => row.length));
        
        for (let i = 0; i < maxCols; i++) {
            const th = document.createElement('th');
            th.textContent = filteredData[0][i] || `Column ${i + 1}`;
            headerRow.appendChild(th);
        }
        
        const thead = document.createElement('thead');
        thead.appendChild(headerRow);
        table.appendChild(thead);
    }
    
    // Create body rows
    const tbody = document.createElement('tbody');
    const dataRows = filteredData.slice(1); // Skip header row
    
    dataRows.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        const maxCols = Math.max(...filteredData.map(row => row.length));
        
        for (let i = 0; i < maxCols; i++) {
            const td = document.createElement('td');
            const cellValue = row[i] || '';
            td.textContent = cellValue;
            
            // Add data attribute for searching
            td.setAttribute('data-original', cellValue);
            
            tr.appendChild(td);
        }
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
    
    // Update table info
    const maxCols = filteredData.length > 0 ? Math.max(...filteredData.map(row => row.length)) : 0;
    updateTableInfo(Math.max(0, filteredData.length - 1), maxCols);
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        // Reset to original data
        filteredData = [...currentData];
        renderTable();
        return;
    }
    
    // Filter data based on search term
    filteredData = currentData.filter((row, index) => {
        // Keep header row
        if (index === 0) return true;
        
        // Check if any cell in the row contains the search term
        return row.some(cell => 
            cell.toString().toLowerCase().includes(searchTerm)
        );
    });
    
    renderTable();
    highlightSearchResults(searchTerm);
}

function highlightSearchResults(searchTerm) {
    const cells = tableContainer.querySelectorAll('td');
    cells.forEach(cell => {
        const originalText = cell.getAttribute('data-original');
        if (originalText && originalText.toLowerCase().includes(searchTerm)) {
            const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
            cell.innerHTML = originalText.replace(regex, '<span class="highlight">$1</span>');
        }
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function handleExport() {
    if (!filteredData || filteredData.length === 0) {
        showError('No data to export');
        return;
    }
    
    try {
        // Convert data to CSV
        const csvContent = filteredData.map(row => 
            row.map(cell => {
                // Escape quotes and wrap in quotes if necessary
                const cellStr = cell.toString();
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return '"' + cellStr.replace(/"/g, '""') + '"';
                }
                return cellStr;
            }).join(',')
        ).join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'exported_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        showError('Error exporting data: ' + error.message);
    }
}

function updateTableInfo(rows, cols) {
    rowCount.textContent = `${rows} rows`;
    colCount.textContent = `${cols} columns`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showError(message) {
    const errorText = errorMessage.querySelector('.error-text');
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Handle file input reset when clicking upload area again
uploadArea.addEventListener('click', () => {
    fileInput.value = '';
});