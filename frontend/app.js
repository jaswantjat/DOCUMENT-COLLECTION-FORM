// Configuration
const API_BASE = 'http://localhost:3001/api';

// State
let projectData = null;
let projectCode = null;
let source = null;
let tempFiles = {};
let confirmedFiles = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  projectCode = urlParams.get('code');
  source = urlParams.get('source') || 'customer';

  if (!projectCode) {
    showError('Este enlace no es válido. Contacta con tu asesor de Eltex.');
    return;
  }

  // Load project data
  loadProjectData();
}

async function loadProjectData() {
  console.log('Loading project data for code:', projectCode);
  console.log('API URL:', `${API_BASE}/project/${projectCode}`);

  try {
    const response = await fetch(`${API_BASE}/project/${projectCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);

    if (!data.success) {
      showError(data.message);
      return;
    }

    projectData = data.project;
    displayProjectInfo();
    populateExistingData();
    showScreen('form');

  } catch (error) {
    console.error('Error loading project:', error);
    console.error('Error details:', error.message);
    showError('Error al cargar el proyecto. Por favor, verifica que el servidor backend está ejecutándose en http://localhost:3001');
  }
}

function displayProjectInfo() {
  document.getElementById('customer-name').textContent = projectData.customerName;
  document.getElementById('project-address').textContent = projectData.address;
  document.getElementById('project-code').textContent = projectCode;
}

function populateExistingData() {
  // Owner match
  if (projectData.ownerMatch !== null) {
    document.getElementById('owner-buttons').classList.add('hidden');
    document.getElementById('owner-info').classList.remove('hidden');
    document.getElementById('owner-answer').textContent = projectData.ownerMatch ? 'Sí' : 'No';

    if (!projectData.ownerMatch && projectData.ownerDetails) {
      document.getElementById('owner-name').value = projectData.ownerDetails.name || '';
      document.getElementById('owner-phone').value = projectData.ownerDetails.phone || '';
      document.getElementById('owner-relation').value = projectData.ownerDetails.relation || '';
    }
  }

  // Documents
  const docMap = {
    dniFront: 'dni-front',
    dniBack: 'dni-back',
    electricityBill: 'bill',
    ibi: 'ibi'
  };

  Object.entries(docMap).forEach(([docField, prefix]) => {
    if (projectData.documents[docField]) {
      showUploadedDocument(prefix, projectData.documents[docField]);
      confirmedFiles[prefix] = projectData.documents[docField];
    }
  });

  // IBAN
  if (projectData.documents.iban) {
    document.getElementById('iban-input').value = formatIBANDisplay(projectData.documents.iban);
    document.getElementById('iban-input').classList.add('valid');
  }
}

function showUploadedDocument(prefix, url) {
  const uploadArea = document.getElementById(`${prefix}-upload`);
  const preview = document.getElementById(`${prefix}-preview`);
  const img = document.getElementById(`${prefix}-img`);

  uploadArea.classList.add('hidden');
  preview.classList.remove('hidden');
  img.src = API_BASE + url;

  // Add change button
  const changeBtn = document.createElement('button');
  changeBtn.className = 'btn btn-small btn-secondary';
  changeBtn.textContent = 'Cambiar';
  changeBtn.onclick = () => resetDocument(prefix);
  preview.querySelector('.preview-actions').appendChild(changeBtn);
}

function resetDocument(prefix) {
  const uploadArea = document.getElementById(`${prefix}-upload`);
  const preview = document.getElementById(`${prefix}-preview`);
  const img = document.getElementById(`${prefix}-img`);

  uploadArea.classList.remove('hidden');
  preview.classList.add('hidden');
  img.src = '';

  // Remove change button if exists
  const actions = preview.querySelector('.preview-actions');
  const changeBtn = actions.querySelector('.btn-small:not([onclick])');
  if (changeBtn) changeBtn.remove();

  delete confirmedFiles[prefix];
}

// Owner Handling
function setOwner(isOwner) {
  projectData.ownerMatch = isOwner;

  document.getElementById('owner-buttons').classList.add('hidden');
  document.getElementById('owner-info').classList.remove('hidden');
  document.getElementById('owner-answer').textContent = isOwner ? 'Sí' : 'No';

  if (!isOwner) {
    document.getElementById('owner-fields').classList.remove('hidden');
  }

  // Send to server
  updateOwnerOnServer();
}

function resetOwner() {
  document.getElementById('owner-buttons').classList.remove('hidden');
  document.getElementById('owner-info').classList.add('hidden');
  document.getElementById('owner-fields').classList.add('hidden');

  // Clear fields
  document.getElementById('owner-name').value = '';
  document.getElementById('owner-phone').value = '';
  document.getElementById('owner-relation').value = '';
}

async function updateOwnerOnServer() {
  try {
    const ownerDetails = !projectData.ownerMatch ? {
      name: document.getElementById('owner-name').value,
      phone: document.getElementById('owner-phone').value,
      relation: document.getElementById('owner-relation').value
    } : null;

    await fetch(`${API_BASE}/owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectCode,
        isOwner: projectData.ownerMatch,
        ownerDetails
      })
    });

    // Trigger notification if owner is different
    if (!projectData.ownerMatch && ownerDetails.phone) {
      console.log('🔔 Notificación enviada:', ownerDetails.phone);
    }

  } catch (error) {
    console.error('Error updating owner:', error);
  }
}

// File Upload Handling
function handleFileSelect(prefix, event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size
  if (file.size > 10 * 1024 * 1024) {
    showErrorMessage(prefix, 'El archivo es demasiado grande. Intenta hacer la foto con menos resolución.');
    return;
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    showErrorMessage(prefix, 'Tipo de archivo no permitido. Solo se aceptan JPG, PNG y PDF.');
    return;
  }

  // Read and preview
  const reader = new FileReader();
  reader.onload = (e) => {
    showPreview(prefix, e.target.result);
    tempFiles[prefix] = file;
    clearErrorMessage(prefix);
  };
  reader.readAsDataURL(file);
}

function showPreview(prefix, dataUrl) {
  const uploadArea = document.getElementById(`${prefix}-upload`);
  const preview = document.getElementById(`${prefix}-preview`);
  const img = document.getElementById(`${prefix}-img`);

  uploadArea.classList.add('hidden');
  preview.classList.remove('hidden');
  img.src = dataUrl;
}

function retakePhoto(prefix) {
  const uploadArea = document.getElementById(`${prefix}-upload`);
  const preview = document.getElementById(`${prefix}-preview`);
  const img = document.getElementById(`${prefix}-img`);

  uploadArea.classList.remove('hidden');
  preview.classList.add('hidden');
  img.src = '';

  delete tempFiles[prefix];
}

async function confirmPhoto(prefix) {
  if (!tempFiles[prefix]) return;

  const formData = new FormData();
  formData.append('file', tempFiles[prefix]);
  formData.append('projectCode', projectCode);
  formData.append('docType', prefix);

  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    confirmedFiles[prefix] = result.fileUrl;
    tempFiles[prefix] = null;

    // Add change button
    const actions = document.getElementById(`${prefix}-preview`).querySelector('.preview-actions');
    const changeBtn = document.createElement('button');
    changeBtn.className = 'btn btn-small btn-secondary';
    changeBtn.textContent = 'Cambiar';
    changeBtn.onclick = () => resetDocument(prefix);
    actions.appendChild(changeBtn);

  } catch (error) {
    console.error('Upload error:', error);
    showErrorMessage(prefix, 'Error al subir el archivo. Por favor, inténtalo de nuevo.');
  }
}

// IBAN Handling
function formatIBAN(input) {
  let value = input.value.replace(/\s/g, '').toUpperCase();

  if (value.length > 0 && !value.startsWith('ES')) {
    input.classList.add('invalid');
    showErrorMessage('iban', 'Introduce un IBAN español válido.');
    return;
  }

  // Validate IBAN format
  if (value.length > 0) {
    const ibanRegex = /^ES\d{2}[0-9A-Z]{20}$/;
    if (value.length === 24 && ibanRegex.test(value)) {
      input.classList.remove('invalid');
      input.classList.add('valid');
      clearErrorMessage('iban');

      // Save to server
      saveIBAN(value);
    } else if (value.length === 24) {
      input.classList.add('invalid');
      input.classList.remove('valid');
      showErrorMessage('iban', 'El formato del IBAN no es válido.');
    } else {
      input.classList.remove('valid', 'invalid');
      clearErrorMessage('iban');
    }
  }

  // Format with spaces
  input.value = formatIBANDisplay(value);
}

function formatIBANDisplay(iban) {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

async function saveIBAN(iban) {
  try {
    await fetch(`${API_BASE}/iban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectCode, iban })
    });
  } catch (error) {
    console.error('Error saving IBAN:', error);
  }
}

// Form Submission
async function submitForm() {
  if (!validateForm()) {
    return;
  }

  await submitToServer();
}

async function submitPartial() {
  await submitToServer(true);
}

function validateForm() {
  const errors = [];

  // Check owner match
  if (projectData.ownerMatch === null) {
    errors.push('Indica si eres el propietario de la vivienda');
  }

  // Check owner details if not owner
  if (projectData.ownerMatch === false) {
    if (!document.getElementById('owner-name').value.trim()) {
      errors.push('Nombre del propietario es obligatorio');
    }
    const phone = document.getElementById('owner-phone').value.trim();
    if (!validatePhone(phone)) {
      errors.push('Teléfono del propietario no válido (debe comenzar con +34 o 6/7/9)');
    }
    if (!document.getElementById('owner-relation').value) {
      errors.push('Relación con el propietario es obligatoria');
    }
  }

  // Check DNI
  if (!confirmedFiles['dni-front']) {
    errors.push('Foto frontal del DNI es obligatoria');
  }
  if (!confirmedFiles['dni-back']) {
    errors.push('Foto trasera del DNI es obligatoria');
  }

  // Check bill
  if (!confirmedFiles['bill']) {
    errors.push('Factura de luz es obligatoria');
  }

  // Check IBAN
  const iban = document.getElementById('iban-input').value.replace(/\s/g, '');
  if (!iban || iban.length !== 24) {
    errors.push('IBAN es obligatorio');
  }

  if (errors.length > 0) {
    showValidationErrors(errors);
    return false;
  }

  return true;
}

function validatePhone(phone) {
  const phoneRegex = /^(\+34\s?)?[67]\d{8}|^(\+34\s?)?9\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

function showValidationErrors(errors) {
  const container = document.getElementById('validation-errors');
  const missingRequired = errors.filter(e => e.includes('obligator') || e.includes('obligatoria'));

  container.innerHTML = `
    <h4>Faltan campos obligatorios</h4>
    <ul>
      ${errors.map(e => `<li>${e}</li>`).join('')}
    </ul>
  `;

  container.classList.remove('hidden');

  // Show partial submit option if some documents are uploaded
  const hasSomeDocs = Object.keys(confirmedFiles).length > 0;
  if (hasSomeDocs) {
    document.getElementById('submit-partial-btn').classList.remove('hidden');
  }
}

// Save owner details before submission
async function saveOwnerDetails() {
  if (projectData.ownerMatch === false) {
    const ownerDetails = {
      name: document.getElementById('owner-name').value,
      phone: document.getElementById('owner-phone').value,
      relation: document.getElementById('owner-relation').value
    };

    try {
      await fetch(`${API_BASE}/owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectCode,
          isOwner: false,
          ownerDetails
        })
      });
    } catch (error) {
      console.error('Error saving owner details:', error);
    }
  }
}

async function submitToServer(isPartial = false) {
  try {
    // Save any pending data
    await saveOwnerDetails();

    const response = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectCode,
        source,
        ipAddress: await getIPAddress()
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Send WhatsApp confirmation
    await sendWhatsAppConfirmation(result);

    // Show success screen
    showSuccessScreen(result, isPartial);

  } catch (error) {
    console.error('Submit error:', error);
    showModal(error.message || 'Hubo un problema al enviar tus documentos. Por favor, inténtalo de nuevo.');
  }
}

async function sendWhatsAppConfirmation(result) {
  try {
    const message = `Hemos recibido tus documentos para tu proyecto en ${projectData.address}. Si necesitas añadir algo, abre este enlace: ${window.location.href}`;

    await fetch(`${API_BASE}/send-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectCode,
        phoneNumber: projectData.phone,
        message
      })
    });
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
  }
}

function showSuccessScreen(result, isPartial) {
  showScreen('success');

  const summary = document.getElementById('success-summary');
  const missingDocs = document.getElementById('missing-docs');

  let summaryHTML = '<h4>Documentos recibidos:</h4><ul>';

  if (confirmedFiles['dni-front']) summaryHTML += '<li class="received">DNI frontal</li>';
  if (confirmedFiles['dni-back']) summaryHTML += '<li class="received">DNI trasero</li>';
  if (confirmedFiles['bill']) summaryHTML += '<li class="received">Factura de luz</li>';
  if (confirmedFiles['ibi']) summaryHTML += '<li class="received">IBI</li>';
  if (document.getElementById('iban-input').value) summaryHTML += '<li class="received">IBAN</li>';

  summaryHTML += '</ul>';
  summary.innerHTML = summaryHTML;

  if (result.missingRequired && result.missingRequired.length > 0) {
    missingDocs.classList.remove('hidden');
    missingDocs.innerHTML += `
      <p><strong>Documentos pendientes:</strong></p>
      <ul>
        ${result.missingRequired.map(doc => `<li>${doc}</li>`).join('')}
      </ul>
    `;
  }

  if (result.missingOptional && result.missingOptional.length > 0) {
    missingDocs.classList.remove('hidden');
  }
}

// Utility Functions
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
}

function showError(message) {
  document.getElementById('error-message').textContent = message;
  showScreen('error');
}

function showErrorMessage(prefix, message) {
  const errorEl = document.getElementById(`${prefix}-error`);
  errorEl.textContent = message;
}

function clearErrorMessage(prefix) {
  document.getElementById(`${prefix}-error').textContent = '';
}

function showModal(message) {
  document.getElementById('modal-message').textContent = message;
  document.getElementById('error-modal').classList.remove('hidden');
}

function closeErrorModal() {
  document.getElementById('error-modal').classList.add('hidden');
}

async function getIPAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

// Handle paste for IBAN
document.addEventListener('paste', (e) => {
  if (e.target.id === 'iban-input') {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    e.target.value = formatIBANDisplay(text.replace(/[^A-Z0-9]/g, '').toUpperCase());
    formatIBAN(e.target);
  }
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeErrorModal();
  }
});
