/**
 * Student Management System - Frontend Vanilla JavaScript
 * Interacts with Node.js/Express REST API and MongoDB Atlas
 */

// ==========================================================================
// 1. Configuration & Global State
// ==========================================================================

// Base API URL resolver:
// - If custom backend URL is saved in localStorage (e.g. Render URL), use it.
// - If served directly from Express on http://localhost:5000, use relative path ''.
// - If running via Live Server or file://, fallback to 'http://localhost:5000'.
function getApiBaseUrl() {
  const custom = localStorage.getItem('sms_backend_url');
  if (custom && custom.trim() !== '') {
    return custom.trim().replace(/\/$/, '');
  }

  // Same-origin check (served by Express)
  if (window.location.port === '5000') {
    return '';
  }

  // Local development fallback
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // Default to relative if hosted on the same domain
  return '';
}

let API_BASE_URL = getApiBaseUrl();

// App State
let studentsList = [];
let isEditing = false;
let studentToDelete = null;
let searchDebounceTimer = null;

// ==========================================================================
// 2. DOM Elements
// ==========================================================================

// Header & Status
const dbStatusBadge = document.getElementById('dbStatusBadge');
const dbStatusText = document.getElementById('dbStatusText');
const apiConfigBtn = document.getElementById('apiConfigBtn');

// Banner
const alertBanner = document.getElementById('alertBanner');
const alertIcon = document.getElementById('alertIcon');
const alertMessage = document.getElementById('alertMessage');
const alertCloseBtn = document.getElementById('alertCloseBtn');

// Stats
const totalStudentsCount = document.getElementById('totalStudentsCount');
const totalDepartmentsCount = document.getElementById('totalDepartmentsCount');

// Form
const studentForm = document.getElementById('studentForm');
const formTitle = document.getElementById('formTitle');
const formModeBadge = document.getElementById('formModeBadge');
const studentIdInput = document.getElementById('studentId');
const nameInput = document.getElementById('name');
const rollNoInput = document.getElementById('rollNo');
const emailInput = document.getElementById('email');
const departmentInput = document.getElementById('department');
const yearInput = document.getElementById('year');
const submitBtn = document.getElementById('submitBtn');
const submitBtnText = document.getElementById('submitBtnText');
const cancelBtn = document.getElementById('cancelBtn');

// Error fields
const nameError = document.getElementById('nameError');
const rollNoError = document.getElementById('rollNoError');
const emailError = document.getElementById('emailError');
const departmentError = document.getElementById('departmentError');
const yearError = document.getElementById('yearError');

// Table & Search
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const studentsTable = document.getElementById('studentsTable');
const studentsTableBody = document.getElementById('studentsTableBody');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
const emptyStateMsg = document.getElementById('emptyStateMsg');
const dbWarningBox = document.getElementById('dbWarningBox');

// Delete Modal
const deleteModal = document.getElementById('deleteModal');
const deletePreviewInfo = document.getElementById('deletePreviewInfo');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// API Config Modal
const apiModal = document.getElementById('apiModal');
const apiUrlInput = document.getElementById('apiUrlInput');
const closeApiModalBtn = document.getElementById('closeApiModalBtn');
const resetApiUrlBtn = document.getElementById('resetApiUrlBtn');
const saveApiUrlBtn = document.getElementById('saveApiUrlBtn');

// ==========================================================================
// 3. Notification & UI Helpers
// ==========================================================================

let alertTimeout = null;

function showAlert(message, type = 'info') {
  clearTimeout(alertTimeout);

  alertBanner.className = `alert-banner alert-${type}`;
  alertMessage.textContent = message;

  if (type === 'success') {
    alertIcon.textContent = '✅';
  } else if (type === 'error') {
    alertIcon.textContent = '❌';
  } else {
    alertIcon.textContent = 'ℹ️';
  }

  alertBanner.classList.remove('hidden');

  // Auto hide after 5 seconds
  alertTimeout = setTimeout(() => {
    alertBanner.classList.add('hidden');
  }, 5000);
}

alertCloseBtn.addEventListener('click', () => {
  alertBanner.classList.add('hidden');
  clearTimeout(alertTimeout);
});

// Update Database Connectivity Badge via Health Check
async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) throw new Error('Health check failed');
    const data = await response.json();

    if (data.databaseConnected) {
      dbStatusBadge.className = 'status-badge status-online';
      dbStatusText.textContent = 'MongoDB Atlas: Connected';
      dbWarningBox.classList.add('hidden');
    } else {
      dbStatusBadge.className = 'status-badge status-offline';
      dbStatusText.textContent = 'MongoDB: Disconnected';
      dbWarningBox.classList.remove('hidden');
    }
  } catch (error) {
    dbStatusBadge.className = 'status-badge status-offline';
    dbStatusText.textContent = 'Backend Offline';
    dbWarningBox.classList.remove('hidden');
  }
}

// Update Summary Statistics
function updateStats(students) {
  totalStudentsCount.textContent = students.length;
  const uniqueDepts = new Set(students.map((s) => s.department));
  totalDepartmentsCount.textContent = uniqueDepts.size;
}

// ==========================================================================
// 4. Form Validation & Management
// ==========================================================================

function validateField(input, errorElement, validationFn, errorMessage) {
  const value = input.value.trim();
  const isValid = validationFn(value);

  if (!isValid) {
    input.classList.add('input-error');
    errorElement.textContent = errorMessage;
    return false;
  } else {
    input.classList.remove('input-error');
    errorElement.textContent = '';
    return true;
  }
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateForm() {
  let isValid = true;

  if (!validateField(nameInput, nameError, (v) => v.length >= 2, 'Name must be at least 2 characters long')) {
    isValid = false;
  }

  if (!validateField(rollNoInput, rollNoError, (v) => v.length >= 2, 'Valid roll number is required')) {
    isValid = false;
  }

  if (!validateField(emailInput, emailError, validateEmail, 'Please enter a valid email address')) {
    isValid = false;
  }

  if (!validateField(departmentInput, departmentError, (v) => v !== '', 'Please select a department')) {
    isValid = false;
  }

  if (!validateField(yearInput, yearError, (v) => v !== '', 'Please select an academic year')) {
    isValid = false;
  }

  return isValid;
}

// Clear input errors
function clearFormErrors() {
  [nameInput, rollNoInput, emailInput, departmentInput, yearInput].forEach((input) => {
    input.classList.remove('input-error');
  });
  [nameError, rollNoError, emailError, departmentError, yearError].forEach((err) => {
    err.textContent = '';
  });
}

// Reset form back to Add/Create Mode
function resetForm() {
  studentForm.reset();
  studentIdInput.value = '';
  isEditing = false;
  clearFormErrors();

  formTitle.textContent = '➕ Add New Student';
  formModeBadge.textContent = 'Create Mode';
  formModeBadge.className = 'badge badge-info';
  submitBtnText.textContent = '💾 Save Student';
  cancelBtn.classList.add('hidden');
}

// Switch form into Edit Mode
function setEditMode(student) {
  isEditing = true;
  clearFormErrors();

  studentIdInput.value = student._id;
  nameInput.value = student.name;
  rollNoInput.value = student.rollNo;
  emailInput.value = student.email;
  departmentInput.value = student.department;
  yearInput.value = student.year;

  formTitle.textContent = `✏️ Edit Student (${student.rollNo})`;
  formModeBadge.textContent = 'Update Mode';
  formModeBadge.className = 'badge badge-warning';
  submitBtnText.textContent = '🔄 Update Student';
  cancelBtn.classList.remove('hidden');

  // Smooth scroll to form on mobile/tablet
  studentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

cancelBtn.addEventListener('click', resetForm);

// Real-time field blur validation
nameInput.addEventListener('blur', () => {
  validateField(nameInput, nameError, (v) => v.length >= 2, 'Name must be at least 2 characters long');
});
rollNoInput.addEventListener('blur', () => {
  validateField(rollNoInput, rollNoError, (v) => v.length >= 2, 'Valid roll number is required');
});
emailInput.addEventListener('blur', () => {
  validateField(emailInput, emailError, validateEmail, 'Please enter a valid email address');
});
departmentInput.addEventListener('change', () => {
  validateField(departmentInput, departmentError, (v) => v !== '', 'Please select a department');
});
yearInput.addEventListener('change', () => {
  validateField(yearInput, yearError, (v) => v !== '', 'Please select an academic year');
});

// ==========================================================================
// 5. CRUD REST API Operations (fetch)
// ==========================================================================

/**
 * READ: Fetch all students from MongoDB (GET /api/students)
 */
async function fetchStudents(searchQuery = '') {
  loadingSpinner.classList.remove('hidden');
  emptyState.classList.add('hidden');

  try {
    let url = `${API_BASE_URL}/api/students`;
    if (searchQuery.trim() !== '') {
      url += `?search=${encodeURIComponent(searchQuery.trim())}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch student records');
    }

    studentsList = result.data || [];
    renderTable(studentsList, searchQuery);
    updateStats(studentsList);
  } catch (error) {
    console.error('Fetch error:', error);
    showAlert(`Error loading students: ${error.message}`, 'error');
    renderTable([], searchQuery);
  } finally {
    loadingSpinner.classList.add('hidden');
  }
}

/**
 * CREATE / UPDATE: Submit Student Form (POST or PUT /api/students)
 */
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    showAlert('Please fix the errors in the form before submitting.', 'error');
    return;
  }

  const payload = {
    name: nameInput.value.trim(),
    rollNo: rollNoInput.value.trim().toUpperCase(),
    email: emailInput.value.trim().toLowerCase(),
    department: departmentInput.value,
    year: yearInput.value,
  };

  submitBtn.disabled = true;
  submitBtnText.textContent = isEditing ? 'Updating...' : 'Saving...';

  try {
    let response;
    let url;

    if (isEditing) {
      // UPDATE operation: PUT /api/students/:id
      const id = studentIdInput.value;
      url = `${API_BASE_URL}/api/students/${id}`;
      response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      // CREATE operation: POST /api/students
      url = `${API_BASE_URL}/api/students`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to save student record');
    }

    showAlert(result.message || 'Student saved successfully!', 'success');
    resetForm();
    await fetchStudents(searchInput.value);
    await checkHealth();
  } catch (error) {
    console.error('Submit error:', error);
    showAlert(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtnText.textContent = isEditing ? '🔄 Update Student' : '💾 Save Student';
  }
});

/**
 * DELETE: Delete student record (DELETE /api/students/:id)
 */
async function deleteStudent(studentId) {
  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = 'Deleting...';

  try {
    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete student');
    }

    showAlert(result.message || 'Student deleted successfully!', 'success');
    closeDeleteModal();

    // If currently editing this student, reset the form
    if (studentIdInput.value === studentId) {
      resetForm();
    }

    await fetchStudents(searchInput.value);
    await checkHealth();
  } catch (error) {
    console.error('Delete error:', error);
    showAlert(error.message, 'error');
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = 'Confirm Delete';
  }
}

// ==========================================================================
// 6. Table Rendering & Actions
// ==========================================================================

function renderTable(students, searchQuery = '') {
  studentsTableBody.innerHTML = '';

  if (students.length === 0) {
    emptyState.classList.remove('hidden');
    if (searchQuery.trim() !== '') {
      emptyStateMsg.textContent = `No students found matching "${searchQuery}". Try a different keyword!`;
    } else {
      emptyStateMsg.textContent = 'There are currently no students in MongoDB Atlas. Add your first record using the form!';
    }
    return;
  }

  emptyState.classList.add('hidden');

  students.forEach((student, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><span class="student-roll">${escapeHtml(student.rollNo)}</span></td>
      <td><span class="student-name">${escapeHtml(student.name)}</span></td>
      <td><span class="student-email">${escapeHtml(student.email)}</span></td>
      <td><span class="dept-badge">${escapeHtml(student.department)}</span></td>
      <td><span class="year-badge">${escapeHtml(student.year)}</span></td>
      <td class="text-center">
        <div class="table-actions">
          <button class="btn btn-sm btn-action-edit" data-id="${student._id}" title="Edit Student">
            ✏️ Edit
          </button>
          <button class="btn btn-sm btn-action-delete" data-id="${student._id}" title="Delete Student">
            🗑️ Delete
          </button>
        </div>
      </td>
    `;

    // Attach Edit button listener
    const editBtn = tr.querySelector('.btn-action-edit');
    editBtn.addEventListener('click', () => {
      setEditMode(student);
    });

    // Attach Delete button listener
    const deleteBtn = tr.querySelector('.btn-action-delete');
    deleteBtn.addEventListener('click', () => {
      openDeleteModal(student);
    });

    studentsTableBody.appendChild(tr);
  });
}

// XSS Prevention helper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// 7. Search & Filter Handling
// ==========================================================================

searchInput.addEventListener('input', (e) => {
  const query = e.target.value;

  if (query.trim() !== '') {
    clearSearchBtn.classList.remove('hidden');
  } else {
    clearSearchBtn.classList.add('hidden');
  }

  // Debounce API calls (wait 300ms after user stops typing)
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    fetchStudents(query);
  }, 300);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.classList.add('hidden');
  fetchStudents('');
});

refreshBtn.addEventListener('click', () => {
  checkHealth();
  fetchStudents(searchInput.value);
  showAlert('Refreshed records from MongoDB Atlas!', 'info');
});

// ==========================================================================
// 8. Delete Confirmation Modal
// ==========================================================================

function openDeleteModal(student) {
  studentToDelete = student;
  deletePreviewInfo.innerHTML = `
    <strong>Student:</strong> ${escapeHtml(student.name)}<br>
    <strong>Roll No:</strong> ${escapeHtml(student.rollNo)}<br>
    <strong>Department:</strong> ${escapeHtml(student.department)}
  `;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  studentToDelete = null;
}

closeModalBtn.addEventListener('click', closeDeleteModal);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);

confirmDeleteBtn.addEventListener('click', () => {
  if (studentToDelete && studentToDelete._id) {
    deleteStudent(studentToDelete._id);
  }
});

// Close modal if clicked outside
window.addEventListener('click', (e) => {
  if (e.target === deleteModal) closeDeleteModal();
  if (e.target === apiModal) closeApiModal();
});

// ==========================================================================
// 9. API Configuration Modal (For Vercel/Render switching)
// ==========================================================================

function openApiModal() {
  apiUrlInput.value = localStorage.getItem('sms_backend_url') || '';
  apiModal.classList.remove('hidden');
}

function closeApiModal() {
  apiModal.classList.add('hidden');
}

apiConfigBtn.addEventListener('click', openApiModal);
closeApiModalBtn.addEventListener('click', closeApiModal);

resetApiUrlBtn.addEventListener('click', () => {
  localStorage.removeItem('sms_backend_url');
  API_BASE_URL = getApiBaseUrl();
  apiUrlInput.value = '';
  showAlert('Backend API URL reset to default!', 'info');
  closeApiModal();
  checkHealth();
  fetchStudents('');
});

saveApiUrlBtn.addEventListener('click', () => {
  const customUrl = apiUrlInput.value.trim().replace(/\/$/, '');
  if (customUrl) {
    localStorage.setItem('sms_backend_url', customUrl);
    API_BASE_URL = customUrl;
    showAlert(`Backend URL set to: ${customUrl}`, 'success');
  } else {
    localStorage.removeItem('sms_backend_url');
    API_BASE_URL = getApiBaseUrl();
    showAlert('Using default backend URL', 'info');
  }
  closeApiModal();
  checkHealth();
  fetchStudents('');
});

// ==========================================================================
// 10. Initialization on DOM Loaded
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  fetchStudents();
});

