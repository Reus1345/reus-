const STORAGE_KEY = 'carelink-referrals-v1';
const seedReferrals = [
  { id: 'CL-2026-084', name: 'Jane M.', age: 42, concern: 'Suspected breast cancer', summary: 'Palpable breast lump requiring specialist assessment.', phone: '', priority: 'Urgent', sent: 'Today, 08:14', status: 'review' },
  { id: 'CL-2026-079', name: 'Brian K.', age: 58, concern: 'Abnormal prostate exam', summary: 'Abnormal examination with persistent urinary symptoms.', phone: '', priority: 'Routine', sent: 'Yesterday, 14:30', status: 'consult' },
  { id: 'CL-2026-074', name: 'Naomi A.', age: 36, concern: 'Cervical lesion', summary: 'Visible cervical lesion identified during screening.', phone: '', priority: 'Urgent', sent: '09 Sep, 11:05', status: 'info' },
  { id: 'CL-2026-068', name: 'Samuel O.', age: 64, concern: 'Persistent dysphagia', summary: 'Progressive difficulty swallowing for six weeks.', phone: '', priority: 'Routine', sent: '08 Sep, 09:42', status: 'plan' },
];
const statusConfig = {
  review: { label: 'CDH reviewing', next: 'consult' }, consult: { label: 'Consult booked', next: 'plan' },
  info: { label: 'More info needed', next: 'review' }, plan: { label: 'Care plan ready', next: 'plan' },
};
const elements = {
  modal: document.querySelector('#referralModal'), detailModal: document.querySelector('#detailModal'),
  form: document.querySelector('#referralForm'), toast: document.querySelector('#toast'),
  sidebar: document.querySelector('#sidebar'), menuButton: document.querySelector('#menuButton'),
  rows: document.querySelector('#referralRows'), searchInput: document.querySelector('#searchInput'),
};
let referrals = loadReferrals();
let selectedReferralId = null;
let lastFocusedElement;
let toastTimer;

function cloneSeed() { return seedReferrals.map((item) => ({ ...item })); }
function loadReferrals() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : cloneSeed();
  } catch (_error) { return cloneSeed(); }
}
function saveReferrals() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(referrals)); }
  catch (_error) { showToast('Saved for this session', 'Browser storage is unavailable, so changes may not persist.'); }
}
function escapeHtml(value) {
  const element = document.createElement('div'); element.textContent = String(value ?? ''); return element.innerHTML;
}
function initials(name) { return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
function renderReferrals(query = '') {
  const term = query.trim().toLowerCase();
  const filtered = referrals.filter((item) => [item.name, item.id, item.concern].some((value) => value.toLowerCase().includes(term)));
  elements.rows.innerHTML = filtered.length ? filtered.map((item, index) => `
    <tr><td><span class="patient-avatar p${(index % 7) + 1}">${escapeHtml(initials(item.name))}</span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.id)} · ${escapeHtml(item.age)} yrs${item.priority === 'Urgent' ? ' · Urgent' : ''}</small></div></td>
    <td>${escapeHtml(item.concern)}</td><td>${escapeHtml(item.sent)}</td><td><span class="status ${escapeHtml(item.status)}">● ${escapeHtml(statusConfig[item.status]?.label || 'Submitted')}</span></td>
    <td><button type="button" class="row-action" data-referral-id="${escapeHtml(item.id)}" aria-label="View ${escapeHtml(item.name)} referral">→</button></td></tr>`).join('') : '<tr><td colspan="5" class="empty-state">No referrals match your search.</td></tr>';
  document.querySelector('#activeCount').textContent = String(referrals.length).padStart(2, '0');
  document.querySelector('#reviewCount').textContent = String(referrals.filter(({ status }) => status === 'review').length).padStart(2, '0');
  document.querySelector('#referralSummary').textContent = term ? `${filtered.length} matching referral${filtered.length === 1 ? '' : 's'}` : 'Track patients referred to the Cancer Diagnostic Hub';
}
function showToast(title, message) {
  clearTimeout(toastTimer); elements.toast.querySelector('strong').textContent = title;
  elements.toast.querySelector('small').textContent = message; elements.toast.classList.add('show');
  toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 3500);
}
function setModal(modal, open, focusSelector) {
  if (open) lastFocusedElement = document.activeElement;
  modal.classList.toggle('open', open); modal.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open && focusSelector) setTimeout(() => modal.querySelector(focusSelector)?.focus(), 50);
  if (!open) lastFocusedElement?.focus();
}
function openDetails(id) {
  const item = referrals.find((referral) => referral.id === id); if (!item) return;
  selectedReferralId = id; document.querySelector('#detailTitle').textContent = item.name;
  document.querySelector('#detailId').textContent = `${item.id} · ${item.age} years`;
  document.querySelector('#detailContent').innerHTML = [
    ['Clinical concern', item.concern], ['Priority', item.priority], ['Current status', statusConfig[item.status]?.label],
    ['Contact', item.phone || 'Not provided'], ['Clinical summary', item.summary], ['Sent', item.sent],
  ].map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  document.querySelector('#advanceStatus').disabled = item.status === 'plan';
  setModal(elements.detailModal, true, '#closeDetail');
}

document.querySelector('#currentDate').textContent = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase();
document.querySelectorAll('.open-referral').forEach((button) => button.addEventListener('click', () => setModal(elements.modal, true, 'input')));
document.querySelector('#closeModal').addEventListener('click', () => setModal(elements.modal, false));
document.querySelector('#cancelModal').addEventListener('click', () => setModal(elements.modal, false));
document.querySelector('#closeDetail').addEventListener('click', () => setModal(elements.detailModal, false));
document.querySelector('#closeDetailAction').addEventListener('click', () => setModal(elements.detailModal, false));
[elements.modal, elements.detailModal].forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) setModal(modal, false); }));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') [elements.modal, elements.detailModal].filter((modal) => modal.classList.contains('open')).forEach((modal) => setModal(modal, false)); });
elements.form.addEventListener('submit', (event) => {
  event.preventDefault(); const data = new FormData(elements.form); const now = new Date();
  referrals.unshift({ id: `CL-${now.getFullYear()}-${String(Date.now()).slice(-5)}`, name: data.get('patientName').trim(), age: Number(data.get('patientAge')),
    concern: data.get('clinicalConcern'), summary: data.get('clinicalSummary').trim(), phone: data.get('patientPhone').trim(), priority: data.get('priority'),
    sent: `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, status: 'review' });
  saveReferrals(); elements.searchInput.value = ''; renderReferrals(); setModal(elements.modal, false); elements.form.reset();
  showToast('Referral saved', 'The prototype referral is now in the active list.');
});
elements.rows.addEventListener('click', (event) => { const button = event.target.closest('[data-referral-id]'); if (button) openDetails(button.dataset.referralId); });
document.querySelector('#advanceStatus').addEventListener('click', () => {
  const item = referrals.find(({ id }) => id === selectedReferralId); if (!item || item.status === 'plan') return;
  item.status = statusConfig[item.status].next; saveReferrals(); renderReferrals(elements.searchInput.value); openDetails(item.id);
  showToast('Status updated', `Referral moved to “${statusConfig[item.status].label}”.`);
});
elements.searchInput.addEventListener('input', () => renderReferrals(elements.searchInput.value));
document.querySelector('#searchButton').addEventListener('click', () => {
  const wrap = document.querySelector('#searchWrap'); wrap.classList.toggle('open');
  document.querySelector('#searchButton').setAttribute('aria-expanded', String(wrap.classList.contains('open')));
  if (wrap.classList.contains('open')) elements.searchInput.focus();
});
document.querySelector('#resetDemo').addEventListener('click', () => { referrals = cloneSeed(); saveReferrals(); elements.searchInput.value = ''; renderReferrals(); showToast('Demo data reset', 'Original referral examples restored.'); });
const setSidebar = (open) => { elements.sidebar.classList.toggle('open', open); elements.menuButton.setAttribute('aria-expanded', String(open)); };
elements.menuButton.addEventListener('click', () => setSidebar(!elements.sidebar.classList.contains('open')));
document.querySelectorAll('.sidebar nav a').forEach((link) => link.addEventListener('click', (event) => {
  setSidebar(false);
  const target = link.getAttribute('href');
  if (target === '#' || (target.startsWith('#') && !document.getElementById(target.slice(1)))) {
    event.preventDefault();
    showToast('Prototype section', 'This module is planned for the production application.');
  }
}));
document.querySelector('#callCoordinator').addEventListener('click', () => showToast('Coordinator requested', 'Demo only — no real call has been placed.'));
document.querySelector('#joinConsultation').addEventListener('click', () => showToast('Teleconsultation demo', 'A production version would open an approved secure video service.'));
renderReferrals();
