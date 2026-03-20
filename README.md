# Eltex Document Collection Form - Prototype

Complete prototype implementing all 16 requirements for the Eltex document collection system.

## Features Implemented

✅ **Requirement 1**: Project code from URL - pulls data from Back Office
✅ **Requirement 2**: Live document status display
✅ **Requirement 3**: Owner check with additional fields when No
✅ **Requirement 4**: Direct camera DNI upload (front/back)
✅ **Requirement 5**: Electricity bill - camera or file upload
✅ **Requirement 6**: Optional IBI receipt upload
✅ **Requirement 7**: Real-time IBAN validation with auto-formatting
✅ **Requirement 8**: Partial submission support
✅ **Requirement 9**: Mobile-first responsive design
✅ **Requirement 10**: Confirmation screen + mock WhatsApp
✅ **Requirement 11**: Writes to Back Office API directly
✅ **Requirement 12**: Tracks source (customer/assessor) and IP
✅ **Requirement 13**: Eltex branding
✅ **Requirement 14**: Handles re-submission gracefully
✅ **Requirement 15**: Spanish language only
✅ **Requirement 16**: Error handling with data preservation

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Start the backend server:**
```bash
npm start
```

3. **Open the form in a browser:**
```
frontend/index.html?code=ELT20250001&source=customer
```

### Test Project Codes

Use these codes to test different scenarios:

- `ELT20250001` - María García, Calle Gran Via 45, Madrid
- `ELT20250002` - Juan Pérez, Avenida de la Castellana 100, Barcelona

### URL Parameters

- `code` (required): Project code from Back Office
- `source` (optional): "customer" or "assessor" (default: "customer")

Example URLs:
```
frontend/index.html?code=ELT20250001&source=customer
frontend/index.html?code=ELT20250002&source=assessor
```

## Testing the Prototype

### 1. Test with Invalid Code
```
frontend/index.html?code=INVALID123
```
Expected: Shows error message about invalid link

### 2. Test Owner Flow
1. Open with valid code
2. Click "No" on owner question
3. Fill in owner details
4. Submit
5. Reload page - should show saved "No" answer with "Cambiar" button

### 3. Test DNI Upload
1. Tap "Fotografiar DNI frontal"
2. Take photo (on mobile) or select file (on desktop)
3. Preview appears with "Repetir" and "Aceptar" buttons
4. Click "Aceptar" to upload
5. Thumbnail appears with green check status
6. "Cambiar" button allows replacement

### 4. Test IBAN Validation
1. Type: `ES1234567890123456789012`
2. Auto-formats to: `ES12 3456 7890 1234 5678 9012`
3. Border turns green when valid
4. Try invalid format - border turns red with error message

### 5. Test Partial Submission
1. Upload only DNI
2. Leave bill and IBAN empty
3. Click submit
4. Shows validation errors
5. "Enviar lo que tengo ahora" button appears
6. Click to submit partial
7. Success screen shows what's missing

### 6. Test Re-submission
1. Submit partial form
2. Reload page
3. Previous uploads show with green checks
4. Add missing documents
5. Submit again
6. Backend updates (old files archived)

### 7. Test Mobile Experience
1. Use Chrome DevTools (F12) → Toggle Device Toolbar
2. Select iPhone 12 or similar
3. Test all features
4. Verify no horizontal scrolling
5. Verify large tap targets

## Backend API Endpoints

### GET `/api/project/:code`
Returns project data for the given code.

### POST `/api/upload`
Uploads a document file.
- `projectCode`: Project identifier
- `docType`: Document type (dniFront, dniBack, electricityBill, ibi)
- `file`: File to upload (max 10MB)

### POST `/api/submit`
Submits the form and records submission metadata.

### POST `/api/owner`
Updates owner match information.

### POST `/api/iban`
Updates IBAN for the project.

### POST `/api/send-confirmation`
Sends WhatsApp confirmation (mocked in prototype).

### GET `/api/status/:code`
Debug endpoint to view full project status.

## File Structure

```
.
├── backend/
│   ├── package.json          # Backend dependencies
│   ├── server.js              # Express server with all API endpoints
│   └── uploads/               # File storage (created automatically)
├── frontend/
│   ├── index.html             # Form structure
│   ├── styles.css             # Eltex branding and responsive design
│   └── app.js                 # Form logic and API calls
└── README.md                  # This file
```

## Backend Mock Data

The backend includes mock project data:
- Project ELT20250001: María García in Madrid
- Project ELT20250002: Juan Pérez in Barcelona

Each project tracks:
- Customer information
- Document upload status
- Owner match status
- Submission history

## Browser Compatibility

- Chrome 90+ ✅
- Safari 14+ ✅
- Firefox 88+ ✅
- Edge 90+ ✅

Mobile browsers fully supported with camera integration.

## Security Notes for Production

When moving to production:

1. **HTTPS required** - Camera and file uploads require secure context
2. **Authentication** - Add JWT or API key authentication
3. **Input validation** - Server-side validation is minimal in prototype
4. **File virus scanning** - Scan uploaded files for malware
5. **Rate limiting** - Prevent abuse with rate limiting
6. **CORS configuration** - Restrict to production domains
7. **Environment variables** - Use .env for sensitive data
8. **Database** - Replace mock data with real database

## Next Steps

1. **Integration**: Connect to real Back Office API
2. **WhatsApp**: Integrate with WhatsApp Business API
3. **Database**: Set up PostgreSQL/MongoDB
4. **Storage**: Use S3 or similar for file storage
5. **Deploy**: Deploy to production environment
6. **Test**: Full QA testing with real users
7. **Monitor**: Add logging and monitoring
