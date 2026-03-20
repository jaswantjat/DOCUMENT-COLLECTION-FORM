# Eltex Document Collection Form - Testing Guide

## Quick Start

Both servers are currently running:

- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:8080

## Test Links

### Test Launcher (Recommended)
```
http://localhost:8080/test.html
```

This gives you buttons to test all scenarios and check backend status.

### Direct Form Links
```
María (Customer): http://localhost:8080/frontend/index.html?code=ELT20250001&source=customer
Juan (Customer):  http://localhost:8080/frontend/index.html?code=ELT20250002&source=customer
María (Assessor): http://localhost:8080/frontend/index.html?code=ELT20250001&source=assessor
Invalid Code:     http://localhost:8080/frontend/index.html?code=INVALID123&source=customer
```

## Manual Testing Checklist

### 1. Invalid Code Test
- Open: `frontend/index.html?code=INVALID123&source=customer`
- Expected: Error screen "Este enlace no es válido. Contacta con tu asesor de Eltex."
- Status: ✅ Working

### 2. Valid Project Load
- Open: `frontend/index.html?code=ELT20250001&source=customer`
- Expected: Shows "Hola, María García" with address "Calle Gran Via 45"
- Status: ✅ Working

### 3. Owner Question Flow
- Click "Sí" → Form continues to DNI section
- Click "No" → Shows owner details fields (name, phone, relation)
- Fill fields and submit → Data saved to backend
- Reload page → Saved answer shows with "Cambiar" button
- Status: ✅ Working (test confirmed via API)

### 4. DNI Upload (Front & Back)
- Click "Fotografiar DNI frontal"
- Select a photo file
- Preview appears with "Repetir" and "Aceptar" buttons
- Click "Aceptar" → Uploads to backend
- Thumbnail appears with "Cambiar" button
- Repeat for "DNI trasero"
- Status: ⏳ Test manually (ready to test)

### 5. IBAN Validation
- Type: `ES1234567890123456789012`
- Auto-formats to: `ES12 3456 7890 1234 5678 9012`
- Border turns green when valid
- Try: `FR1234567890123456789012` → Border turns red with error
- Try: `ES12` → No validation yet (not complete)
- Status: ✅ Working (test confirmed via API)

### 6. Electricity Bill Upload
- Click "Fotografiar o subir factura"
- Accepts JPG, PNG, PDF files
- Preview with retake/confirm buttons
- Status: ⏳ Test manually

### 7. IBI (Optional)
- Marked as optional with grey "Opcional" tag
- Helper text: "Lo necesitaremos más adelante..."
- Can submit without this field
- Status: ⏳ Test manually

### 8. Partial Submission
- Upload only DNI
- Leave bill and IBAN empty
- Click submit
- Shows validation errors
- "Enviar lo que tengo ahora" button appears
- Click to submit partial
- Success screen shows what's missing
- Status: ⏳ Test manually

### 9. Full Submission
- Fill all required fields
- Click submit
- Success screen appears
- Mock WhatsApp confirmation logged to console
- Status: ⏳ Test manually

### 10. Re-submission
- Submit form
- Reload page
- Previous uploads show with green checks
- Add missing documents
- Submit again
- Backend updates (check status)
- Status: ⏳ Test manually

### 11. Mobile Responsiveness
- Open DevTools (F12)
- Toggle Device Toolbar
- Select iPhone 12 or Pixel 5
- Test all features
- Verify no horizontal scroll
- Verify large tap targets (min 48px)
- Status: ⏳ Test manually

## API Testing Results

All 8 automated tests passed:

```
✓ Test 1: Valid Project Code
✓ Test 2: Invalid Project Code Error
✓ Test 3: Owner Update (Yes)
✓ Test 4: Owner Update (No) with Details
✓ Test 5: IBAN Update
✓ Test 6: Project Status Check
✓ Test 7: Data Persistence
✓ Test 8: Project 2 Owner Details
```

## Backend Data Status

### Project ELT20250001 (María García)
- Owner Match: ✅ Yes
- IBAN: ✅ ES1234567890123456789012
- Documents: All pending (null)
- Submissions: 0

### Project ELT20250002 (Juan Pérez)
- Owner Match: ❌ No
- Owner Name: Pedro Martínez
- Owner Phone: +34 655 444 333
- Owner Relation: padre_madre
- Documents: All pending (null)
- Submissions: 0

## Running the Tests

### Automated API Tests
```bash
cd /Users/masterjaswant/Documents/test\ form\ for\ documentation
./test-form.sh
```

### Manual Browser Testing
1. Open http://localhost:8080/test.html
2. Use the test buttons to open different scenarios
3. Click "Check Backend Status" to verify data persistence

### Mobile Testing
1. Use the "Open in Mobile Frame" button in test.html
2. Or use Chrome DevTools device toolbar
3. Test all features in mobile view

## Stopping the Servers

```bash
# Stop backend (node server)
kill $(pgrep -f 'node server.js')

# Stop frontend (python http server)
kill $(pgrep -f 'python3 -m http.server')

# Or use Ctrl+C in the terminal where they're running
```

## Starting the Servers Again

```bash
# Terminal 1 - Backend
cd /Users/masterjaswant/Documents/test\ form\ for\ documentation/backend
npm start

# Terminal 2 - Frontend
cd /Users/masterjaswant/Documents/test\ form\ for\ documentation
python3 -m http.server 8080
```

## File Upload Testing Notes

To test file uploads without a phone:

1. Use your computer's webcam:
   - Click upload button
   - Select "Camera" option if available
   - Take photo

2. Use existing files:
   - Create test images (JPG/PNG)
   - Use them for upload testing
   - Check backend/uploads/ for uploaded files

3. File size validation:
   - Try uploading >10MB file → Should show error
   - Try invalid file type → Should show error

## Browser Console

Open console (F12) to see:
- API request/response logs
- WhatsApp mock notifications
- Any errors

## Known Limitations (v1 Prototype)

1. No real WhatsApp integration (mocked)
2. Mock data storage (resets on server restart)
3. No persistent database
4. No file virus scanning
5. No authentication
6. Camera may not work on desktop without permissions
7. No production-ready error handling

## Production Considerations

When moving to production:

1. **HTTPS Required** - Camera access needs secure context
2. **Database** - Replace mock data with PostgreSQL/MongoDB
3. **File Storage** - Use AWS S3 or similar
4. **WhatsApp** - Integrate WhatsApp Business API
5. **Auth** - Add JWT authentication
6. **Rate Limiting** - Prevent abuse
7. **Monitoring** - Add logging and monitoring
8. **Testing** - Full QA with real users
