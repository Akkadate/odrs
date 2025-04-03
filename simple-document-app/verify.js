// Document verification codes (in a real system these would be stored securely in a database)
const verificationCodes = {
  'ODOC-1234-5678-ABCD': {
    requestNumber: 'DOC-20250401-001',
    documentType: 'Graduation Certificate',
    issuedTo: 'Somsak Jaidee',
    issuedOn: '2025-04-03',
    issuedBy: 'University Registrar',
    validUntil: '2030-04-03',
    status: 'valid'
  },
  'ODOC-1111-2222-REVK': {
    requestNumber: 'DOC-20250101-045',
    documentType: 'Student Status Certificate',
    issuedTo: 'Wichai Naja',
    issuedOn: '2025-01-15',
    issuedBy: 'University Registrar',
    validUntil: '2025-07-15',
    status: 'revoked',
    revokedReason: 'Document contained incorrect information',
    revokedOn: '2025-02-20'
  },
  'ODOC-ABCD-EFGH-1234': {
    requestNumber: 'DOC-20250315-078',
    documentType: 'Transcript',
    issuedTo: 'Malee Somchai',
    issuedOn: '2025-03-15',
    issuedBy: 'University Registrar',
    validUntil: '2030-03-15',
    status: 'valid'
  },
  'ODOC-7890-WXYZ-5678': {
    requestNumber: 'DOC-20250220-033',
    documentType: 'Degree Certificate',
    issuedTo: 'Prasert Chaiyo',
    issuedOn: '2025-02-20',
    issuedBy: 'University Registrar',
    validUntil: '2030-02-20',
    status: 'valid'
  }
};

// Format dates for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Generate QR code for verification URL
function generateQRCode(verificationCode) {
  // Clear previous QR code
  document.getElementById('qrcode').innerHTML = '';
  
  // Generate a verification URL
  const verificationUrl = `${window.location.origin}${window.location.pathname}?code=${verificationCode}`;
  
  // Create QR code
  const qr = qrcode(0, 'M');
  qr.addData(verificationUrl);
  qr.make();
  
  // Render QR code
  document.getElementById('qrcode').innerHTML = qr.createImgTag(5);
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const verificationCodeInput = document.getElementById('verification-code');
  
  // Format verification code as user types (add hyphens)
  verificationCodeInput.addEventListener('input', function(e) {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0 && formattedValue.length < 18) {
        formattedValue += '-';
      }
      formattedValue += value[i];
    }
    
    e.target.value = formattedValue;
  });
  
  // Allow verification by pressing Enter key
  verificationCodeInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      checkVerificationCode();
    }
  });
  
  // Check for code parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get('code');
  
  if (codeParam) {
    // Pre-fill verification code input
    verificationCodeInput.value = codeParam;
    // Auto-verify the code
    checkVerificationCode();
  }
});

// Check verification code
function checkVerificationCode() {
  const verificationCode = document.getElementById('verification-code').value.trim();
  const verificationResult = document.getElementById('verification-result');
  
  // Clear previous results
  verificationResult.innerHTML = '';
  
  // Check if the code exists in our database
  const documentInfo = verificationCodes[verificationCode];
  
  if (!documentInfo) {
    // Invalid code
    verificationResult.innerHTML = `
      <div class="verification-error">
        <div class="verification-icon">❌</div>
        <div class="verification-message">Invalid verification code</div>
        <p>The verification code you entered does not match any document in our system.</p>
      </div>
    `;
  } else if (documentInfo.status === 'revoked') {
    // Revoked document
    verificationResult.innerHTML = `
      <div class="verification-error">
        <div class="verification-icon">⚠️</div>
        <div class="verification-message">Document Revoked</div>
        <p>This document has been revoked and is no longer valid.</p>
        <p>Reason: ${documentInfo.revokedReason || 'Not specified'}</p>
        <p>Revoked on: ${formatDate(documentInfo.revokedOn)}</p>
      </div>
    `;
  } else {
    // Valid document
    verificationResult.innerHTML = `
      <div class="verification-success">
        <div class="verification-icon">✓</div>
        <div class="verification-message">Verification Successful</div>
        <p>This document is authentic and valid.</p>
      </div>
      
      <div class="document-info">
        <h3>Document Information</h3>
        <div class="document-info-item">
          <div class="document-info-label">Document Type</div>
          <div class="document-info-value">${documentInfo.documentType}</div>
        </div>
        <div class="document-info-item">
          <div class="document-info-label">Request Number</div>
          <div class="document-info-value">${documentInfo.requestNumber}</div>
        </div>
        <div class="document-info-item">
          <div class="document-info-label">Issued To</div>
          <div class="document-info-value">${documentInfo.issuedTo}</div>
        </div>
        <div class="document-info-item">
          <div class="document-info-label">Issued On</div>
          <div class="document-info-value">${formatDate(documentInfo.issuedOn)}</div>
        </div>
        <div class="document-info-item">
          <div class="document-info-label">Issued By</div>
          <div class="document-info-value">${documentInfo.issuedBy}</div>
        </div>
        <div class="document-info-item">
          <div class="document-info-label">Valid Until</div>
          <div class="document-info-value">${formatDate(documentInfo.validUntil)}</div>
        </div>
      </div>
      
      <div class="qrcode-section">
        <div class="qrcode-container">
          <div id="qrcode"></div>
          <p class="qrcode-caption">Scan this QR code to verify this document online</p>
        </div>
      </div>
      
      <div class="verification-note">
        <p><strong>Note:</strong> This verification confirms that the document was officially issued by University Registrar. 
        If you have concerns about the authenticity of this document, please contact the Document Verification Office at verify@odocs.devapp.cc or call +66-2-123-4567.</p>
      </div>`;
      
      // Generate QR code for the verified document
      generateQRCode(verificationCode);
    }
  }
}
