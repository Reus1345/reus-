const modal = document.querySelector('#referralModal');
const form = document.querySelector('#referralForm');
const toast = document.querySelector('#toast');
const sidebar = document.querySelector('#sidebar');
const menuButton = document.querySelector('#menuButton');
let lastFocusedElement;
let toastTimer;

document.querySelector('#currentDate').textContent = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date()).toUpperCase();

const showToast = (title, message) => {
  window.clearTimeout(toastTimer);
  toast.querySelector('strong').textContent = title;
  toast.querySelector('small').textContent = message;
  toast.classList.add('show');
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3500);
};

const setModal = (open) => {
  if (open) lastFocusedElement = document.activeElement;
  modal.classList.toggle('open', open);
  modal.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) setTimeout(() => form.querySelector('input').focus(), 50);
  else if (lastFocusedElement) lastFocusedElement.focus();
};

document.querySelectorAll('.open-referral').forEach((button) => button.addEventListener('click', () => setModal(true)));
document.querySelector('#closeModal').addEventListener('click', () => setModal(false));
document.querySelector('#cancelModal').addEventListener('click', () => setModal(false));
modal.addEventListener('click', (event) => { if (event.target === modal) setModal(false); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setModal(false); });

form.addEventListener('submit', (event) => {
  event.preventDefault();
  setModal(false);
  form.reset();
  showToast('Referral sent securely', 'CDH has been notified for review.');
});

const setSidebar = (open) => {
  sidebar.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
};

menuButton.addEventListener('click', () => setSidebar(!sidebar.classList.contains('open')));
document.querySelectorAll('.sidebar nav a').forEach((link) => link.addEventListener('click', () => setSidebar(false)));
document.querySelector('#callCoordinator').addEventListener('click', () => {
  showToast('Coordinator requested', 'The CDH desk will call your facility shortly.');
});

document.querySelector('#joinConsultation').addEventListener('click', () => {
  showToast('Consultation room ready', 'Opening the secure CDH call in a new session.');
});

document.querySelectorAll('.row-action').forEach((button) => button.addEventListener('click', () => {
  showToast('Referral details selected', 'The full patient record will open in the connected clinical system.');
}));
