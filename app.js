// ====== EDIT THESE TWO LINES ======
const CFG = {
  API_URL: 'PASTE_APPS_SCRIPT_WEB_APP_URL',
  CLIENT_ID: 'PASTE_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
};
// ==================================
const $ = s => document.querySelector(s);
const STATUS = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const badge = s => `<span class="badge s-${String(s).replace(/\s/g, '')}">${esc(s)}</span>`;
const parse = t => { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return null; } };

let token = sessionStorage.getItem('t') || '';
let user = token ? parse(token) : null;
if (user && user.exp * 1000 < Date.now()) { sessionStorage.removeItem('t'); token = ''; user = null; }

function signOut() { sessionStorage.removeItem('t'); location.reload(); }

async function api(action, data = {}) {
  const r = await fetch(CFG.API_URL, { method: 'POST', body: JSON.stringify({ action, token, ...data }) });
  const j = await r.json();
  if (!j.ok) {
    if (/token/i.test(j.error)) { sessionStorage.removeItem('t'); alert('Your session expired. Please sign in again.'); location.reload(); }
    throw new Error(j.error);
  }
  return j;
}

// Shows #app when signed in, otherwise renders the Google button in #gbtn
function initAuth(onReady) {
  if (user) {
    $('#login').hidden = true; $('#app').hidden = false;
    $('#who').innerHTML = `${esc(user.email)} <button class="ghost" onclick="signOut()">Sign out</button>`;
    return onReady();
  }
  window.addEventListener('load', () => {
    google.accounts.id.initialize({ client_id: CFG.CLIENT_ID, callback: r => { sessionStorage.setItem('t', r.credential); location.reload(); } });
    google.accounts.id.renderButton($('#gbtn'), { theme: 'filled_blue', size: 'large', shape: 'pill' });
  });
}
