# 📊 Excel File Viewer

A modern web application that allows you to open Excel files (.xlsx, .xls) and CSV files, then display the data in a beautiful, interactive table.

## Features

- **Drag & Drop Upload**: Simply drag your Excel file into the upload area
- **Multiple Sheet Support**: Switch between different worksheets in your Excel file
- **Inline Data Editing**: Click "Edit Mode" to modify data directly in the table
- **Change Tracking**: Visual indicators show which cells have been modified
- **Save & Cancel**: Save your changes or cancel to restore original data
- **Search Functionality**: Search through your data with real-time highlighting
- **Export to CSV**: Export filtered data to CSV format
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## How to Use

1. Open `index.html` in your web browser
2. Upload an Excel file by:
   - Dragging and dropping it onto the upload area, OR
   - Clicking the upload area and selecting a file
3. If your Excel file has multiple sheets, select the desired sheet from the dropdown
4. **View Mode** (default):
   - Use the search box to filter data in real-time
   - Export filtered data using the "Export CSV" button
5. **Edit Mode**:
   - Click "✏️ Edit Mode" to enable data editing
   - Click any cell to edit its content
   - Press Enter to confirm changes or Escape to cancel
   - Changed cells are highlighted with a yellow background
   - Click "💾 Save Changes" to permanently save modifications
   - Click "❌ Cancel" to discard all changes and restore original data

## Supported File Types

- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)
- `.csv` (Comma Separated Values)

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- Uses SheetJS library for Excel file parsing
- No server required - runs entirely in the browser
- Modern CSS with gradients, animations, and responsive design

## Browser Compatibility

Works in all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Getting Started

Simply open `index.html` in your web browser - no installation or setup required!
