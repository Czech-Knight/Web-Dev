const state = {
  token: localStorage.getItem('bt_token'),
  user: null,
  projects: [],
  users: [],
  selectedProjectId: null
};

const els = {
  loginView: document.getElementById('loginView'),
  appView: document.getElementById('appView'),
  loginForm: document.getElementById('loginForm'),
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  loginError: document.getElementById('loginError'),
  userBadge: document.getElementById('userBadge'),
  adminNav: document.getElementById('adminNav'),
  projectCards: document.getElementById('projectCards'),
  projectDetail: document.getElementById('projectDetail'),
  detailName: document.getElementById('detailName'),
  detailDescription: document.getElementById('detailDescription'),
  detailStatus: document.getElementById('detailStatus'),
  detailClient: document.getElementById('detailClient'),
  detailLocation: document.getElementById('detailLocation'),
  detailBim: document.getElementById('detailBim'),
  detailBudget: document.getElementById('detailBudget'),
  detailProgressText: document.getElementById('detailProgressText'),
  detailProgressBar: document.getElementById('detailProgressBar'),
  detailSafety: document.getElementById('detailSafety'),
  taskList: document.getElementById('taskList'),
  documentList: document.getElementById('documentList'),
  commentList: document.getElementById('commentList'),
  activityList: document.getElementById('activityList'),
  documentForm: document.getElementById('documentForm'),
  documentInput: document.getElementById('documentInput'),
  commentForm: document.getElementById('commentForm'),
  commentInput: document.getElementById('commentInput'),
  statsGrid: document.getElementById('statsGrid'),
  userList: document.getElementById('userList'),
  projectClients: document.getElementById('projectClients'),
  toast: document.getElementById('toast')
};

function authHeaders(json = true) {
  const headers = { Authorization: `Bearer ${state.token}` };
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

async function api(path, options = {}) {
  const response = await fetch(path, options);
  if (response.status === 401) {
    logout();
    throw new Error('Your session expired. Please sign in again.');
  }
  if (!response.ok) {
    let message = 'Request failed.';
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');
  setTimeout(() => els.toast.classList.add('hidden'), 3200);
}

function formatDate(value) {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function showAuthenticated() {
  els.loginView.classList.add('hidden');
  els.appView.classList.remove('hidden');
  els.userBadge.textContent = `${state.user.fullName} · ${state.user.role}`;
  els.adminNav.classList.toggle('hidden', state.user.role !== 'Admin');
}

function showLogin() {
  els.loginView.classList.remove('hidden');
  els.appView.classList.add('hidden');
}

async function login(event) {
  event.preventDefault();
  els.loginError.textContent = '';
  try {
    const result = await api('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: els.loginEmail.value, password: els.loginPassword.value })
    });
    state.token = result.token;
    localStorage.setItem('bt_token', state.token);
    await boot();
  } catch (err) {
    els.loginError.textContent = err.message;
  }
}

function logout() {
  state.token = null;
  state.user = null;
  state.projects = [];
  state.selectedProjectId = null;
  localStorage.removeItem('bt_token');
  showLogin();
}

async function boot() {
  if (!state.token) {
    showLogin();
    return;
  }
  try {
    state.user = await api('/api/auth/me', { headers: authHeaders(false) });
    showAuthenticated();
    await loadDashboard();
    if (state.user.role === 'Admin') await loadAdmin();
  } catch (err) {
    logout();
  }
}

async function loadDashboard() {
  state.projects = await api('/api/projects', { headers: authHeaders(false) });
  renderProjectCards();
  if (state.projects.length && !state.selectedProjectId) {
    await selectProject(state.projects[0].id);
  } else if (!state.projects.length) {
    els.projectDetail.classList.add('hidden');
  }
}

function renderProjectCards() {
  els.projectCards.innerHTML = state.projects.map(project => `
    <article class="card" data-project-id="${project.id}">
      <span class="status-chip ${project.status}">${project.status}</span>
      <h3>${escapeHtml(project.name)}</h3>
      <p>${escapeHtml(project.location)} · ${escapeHtml(project.clientName)}</p>
      <div class="progress-wrap">
        <div class="progress-label"><span>Progress</span><strong>${project.progressPercent}%</strong></div>
        <div class="progress"><div style="width:${project.progressPercent}%"></div></div>
      </div>
      <div class="card-footer">
        <span>${escapeHtml(project.bimPackageReference || 'No BIM ref')}</span>
        <strong>View</strong>
      </div>
    </article>
  `).join('') || `<section class="panel"><p>No projects available yet.</p></section>`;

  els.projectCards.querySelectorAll('[data-project-id]').forEach(card => {
    card.addEventListener('click', () => selectProject(card.dataset.projectId));
  });
}

async function selectProject(id) {
  state.selectedProjectId = id;
  const project = await api(`/api/projects/${id}`, { headers: authHeaders(false) });
  els.projectDetail.classList.remove('hidden');
  els.detailName.textContent = project.name;
  els.detailDescription.textContent = project.description;
  els.detailStatus.textContent = project.status;
  els.detailStatus.className = `status-chip ${project.status}`;
  els.detailClient.textContent = project.clientName;
  els.detailLocation.textContent = project.location;
  els.detailBim.textContent = project.bimPackageReference || 'Not recorded';
  els.detailBudget.textContent = project.budgetSummary || 'Not recorded';
  els.detailProgressText.textContent = `${project.progressPercent}%`;
  els.detailProgressBar.style.width = `${project.progressPercent}%`;
  els.detailSafety.textContent = project.safetySummary || 'No safety summary recorded.';

  await Promise.all([loadTasks(id), loadDocuments(id), loadComments(id), loadActivity(id)]);
}

async function loadTasks(projectId) {
  const tasks = await api(`/api/tasks?projectId=${encodeURIComponent(projectId)}`, { headers: authHeaders(false) });
  els.taskList.innerHTML = tasks.map(task => `
    <article class="list-item">
      <h4>${escapeHtml(task.title)}</h4>
      <p>${escapeHtml(task.description)}</p>
      <div class="item-meta">
        <span class="status-chip ${task.status}">${task.status}</span>
        <span class="status-chip priority-${task.priority}">${task.priority}</span>
        <span class="status-chip">${escapeHtml(task.assignedTo || 'Unassigned')}</span>
        <span class="status-chip">${formatDate(task.dueDateUtc)}</span>
      </div>
    </article>
  `).join('') || `<p class="muted">No tasks recorded for this project.</p>`;
}

async function loadDocuments(projectId) {
  const documents = await api(`/api/documents/project/${projectId}`, { headers: authHeaders(false) });
  els.documentList.innerHTML = documents.map(doc => `
    <article class="list-item">
      <h4>${escapeHtml(doc.originalFileName)}</h4>
      <p>${formatBytes(doc.sizeBytes)} · Uploaded by ${escapeHtml(doc.uploadedByName)} · ${formatDate(doc.uploadedAtUtc)}</p>
      <button class="secondary" data-download-id="${doc.id}">Download</button>
    </article>
  `).join('') || `<p class="muted">No documents uploaded yet.</p>`;

  els.documentList.querySelectorAll('[data-download-id]').forEach(button => {
    button.addEventListener('click', () => downloadDocument(button.dataset.downloadId));
  });
}

async function loadComments(projectId) {
  const comments = await api(`/api/comments?projectId=${projectId}`, { headers: authHeaders(false) });
  els.commentList.innerHTML = comments.map(comment => `
    <article class="list-item">
      <h4>${escapeHtml(comment.authorName)}</h4>
      <p>${escapeHtml(comment.body)}</p>
      <small>${formatDate(comment.createdAtUtc)}</small>
    </article>
  `).join('') || `<p class="muted">No comments yet.</p>`;
}

async function loadActivity(projectId) {
  const logs = await api(`/api/activity?projectId=${projectId}`, { headers: authHeaders(false) });
  els.activityList.innerHTML = logs.map(log => `
    <article class="list-item">
      <h4>${escapeHtml(log.actorName)}</h4>
      <p>${escapeHtml(log.action)}</p>
      <small>${formatDate(log.createdAtUtc)}</small>
    </article>
  `).join('') || `<p class="muted">No activity recorded yet.</p>`;
}

async function uploadDocument(event) {
  event.preventDefault();
  if (!state.selectedProjectId || !els.documentInput.files.length) return;
  const data = new FormData();
  data.append('projectId', state.selectedProjectId);
  data.append('file', els.documentInput.files[0]);

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${state.token}` },
    body: data
  });
  if (!response.ok) {
    toast('Document upload failed.');
    return;
  }
  els.documentInput.value = '';
  toast('Document uploaded.');
  await Promise.all([loadDocuments(state.selectedProjectId), loadActivity(state.selectedProjectId)]);
}

async function downloadDocument(documentId) {
  const response = await fetch(`/api/documents/download/${documentId}`, { headers: { Authorization: `Bearer ${state.token}` } });
  if (!response.ok) {
    toast('Download failed.');
    return;
  }
  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  const fileName = decodeURIComponent(match?.[1] || match?.[2] || 'document');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function addComment(event) {
  event.preventDefault();
  if (!state.selectedProjectId) return;
  await api('/api/comments', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ projectId: state.selectedProjectId, body: els.commentInput.value })
  });
  els.commentInput.value = '';
  toast('Comment posted.');
  await Promise.all([loadComments(state.selectedProjectId), loadActivity(state.selectedProjectId)]);
}

async function loadAdmin() {
  const [stats, users] = await Promise.all([
    api('/api/admin/stats', { headers: authHeaders(false) }),
    api('/api/admin/users', { headers: authHeaders(false) })
  ]);
  state.users = users;
  renderStats(stats);
  renderUsers(users);
  renderClientOptions(users.filter(u => u.role === 'Client'));
}

function renderStats(stats) {
  const items = [
    ['Projects', stats.projectCount],
    ['Clients', stats.clientCount],
    ['Tasks', stats.taskCount],
    ['Open tasks', stats.openTaskCount],
    ['Documents', stats.documentCount]
  ];
  els.statsGrid.innerHTML = items.map(([label, value]) => `
    <section class="panel stat"><span class="eyebrow">${label}</span><strong>${value}</strong></section>
  `).join('');
}

function renderUsers(users) {
  els.userList.innerHTML = users.map(user => `
    <div class="table-row">
      <strong>${escapeHtml(user.fullName)}</strong>
      <span>${escapeHtml(user.email)}</span>
      <span>${escapeHtml(user.role)}</span>
      <span>${escapeHtml(user.companyName)}</span>
    </div>
  `).join('');
}

function renderClientOptions(clients) {
  els.projectClients.innerHTML = clients.map(user => `<option value="${user.id}">${escapeHtml(user.fullName)} · ${escapeHtml(user.companyName)}</option>`).join('');
}

async function createUser(event) {
  event.preventDefault();
  await api('/api/admin/users', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      fullName: document.getElementById('userFullName').value,
      email: document.getElementById('userEmail').value,
      password: document.getElementById('userPassword').value,
      role: document.getElementById('userRole').value,
      companyName: document.getElementById('userCompany').value
    })
  });
  event.target.reset();
  toast('User created.');
  await loadAdmin();
}

async function createProject(event) {
  event.preventDefault();
  const selectedClients = Array.from(els.projectClients.selectedOptions).map(option => option.value);
  await api('/api/projects', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name: document.getElementById('projectName').value,
      clientName: document.getElementById('projectClient').value,
      location: document.getElementById('projectLocation').value,
      status: document.getElementById('projectStatus').value,
      progressPercent: Number(document.getElementById('projectProgress').value),
      budgetSummary: document.getElementById('projectBudget').value,
      bimPackageReference: document.getElementById('projectBim').value,
      safetySummary: document.getElementById('projectSafety').value,
      description: document.getElementById('projectDescription').value,
      clientUserIds: selectedClients
    })
  });
  event.target.reset();
  toast('Project created.');
  await Promise.all([loadDashboard(), loadAdmin()]);
}

async function createTask(event) {
  event.preventDefault();
  if (!state.selectedProjectId) {
    toast('Select a project first.');
    return;
  }
  const dueDate = document.getElementById('taskDueDate').value;
  await api('/api/tasks', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      projectId: state.selectedProjectId,
      title: document.getElementById('taskTitle').value,
      description: document.getElementById('taskDescription').value,
      assignedTo: document.getElementById('taskAssignedTo').value,
      priority: document.getElementById('taskPriority').value,
      status: document.getElementById('taskStatus').value,
      dueDateUtc: dueDate ? new Date(`${dueDate}T00:00:00Z`).toISOString() : null
    })
  });
  event.target.reset();
  toast('Task created.');
  await Promise.all([loadTasks(state.selectedProjectId), loadActivity(state.selectedProjectId), loadAdmin()]);
}

function switchView(view) {
  document.getElementById('dashboardView').classList.toggle('hidden', view !== 'dashboard');
  document.getElementById('adminView').classList.toggle('hidden', view !== 'admin');
  document.getElementById('pageTitle').textContent = view === 'admin' ? 'Admin Panel' : 'Dashboard';
  document.querySelectorAll('.nav-link').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

els.loginForm.addEventListener('submit', login);
els.documentForm.addEventListener('submit', uploadDocument);
els.commentForm.addEventListener('submit', addComment);
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('refreshBtn').addEventListener('click', async () => {
  await loadDashboard();
  if (state.user?.role === 'Admin') await loadAdmin();
  toast('Dashboard refreshed.');
});
document.getElementById('userForm').addEventListener('submit', createUser);
document.getElementById('projectForm').addEventListener('submit', createProject);
document.getElementById('taskForm').addEventListener('submit', createTask);
document.querySelectorAll('.nav-link').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));

boot();
