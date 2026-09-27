const form = document.querySelector('#config');
const result = document.querySelector('#result');
const apply = document.querySelector('#apply');
const startStatus = document.querySelector('#start-status');
const existingChoice = document.querySelector('#existing-choice');
const existingSelect = document.querySelector('#existing-environments');
const fields = [...form.elements].filter(el => el.name);
let reviewed = '';
let operation = null;
function values() { return Object.fromEntries(fields.map(el => [el.name, el.type === 'checkbox' ? el.checked : el.value])); }
function submission() { return { ...values(), operation }; }
function dependencies() {
  document.querySelectorAll('[data-for]').forEach(el => el.hidden = !form.elements[el.dataset.for].checked);
  document.querySelectorAll('[data-for-any]').forEach(el =>
    el.hidden = !el.dataset.forAny.split(' ').some(name => form.elements[name].checked));
}
function automaticHosts() {
  let site = 'Enter a valid Site URL';
  try { site = new URL(form.elements.siteUrl.value).hostname; } catch { /* site URL may still be empty */ }
  document.querySelector('#automatic-hosts').textContent =
    `Automatically allowed: ${site} (Site URL)` +
    (form.elements.environment.value === 'development' ? '; localhost and 127.0.0.1 (local development).' : '.');
}
function invalidate() { reviewed = ''; apply.style.display = 'none'; result.textContent = ''; dependencies(); automaticHosts(); }
form.addEventListener('input', invalidate);
form.addEventListener('change', invalidate);
async function request(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
async function refreshEnvironments() {
  const { environments } = await request('/api/environments');
  existingSelect.replaceChildren(...environments.map(entry => {
    const option = document.createElement('option');
    option.value = entry.storeCode;
    option.textContent = `${entry.storeCode} — ${entry.siteUrl}`;
    return option;
  }));
  existingChoice.hidden = environments.length === 0;
  startStatus.textContent = environments.length
    ? `${environments.length} configured environment(s) found.`
    : 'No environments configured yet. Create your first one.';
}
function showConfiguration(data, nextOperation) {
  fields.forEach(el => { if (el.type === 'checkbox') el.checked = data[el.name]; else el.value = data[el.name]; });
  operation = nextOperation;
  form.hidden = false;
  form.elements.storeCode.readOnly = nextOperation === 'update';
  document.querySelector('#form-heading').textContent = nextOperation === 'create'
    ? 'Create new environment' : `Edit ${data.storeCode}`;
  invalidate();
}
async function create() {
  try {
    showConfiguration(await request('/api/config/template'), 'create');
    form.elements.storeCode.focus();
  } catch (error) { startStatus.textContent = error.message; }
}
async function load() {
  try {
    const store = existingSelect.value;
    showConfiguration(await request('/api/config?store=' + encodeURIComponent(store)), 'update');
    result.textContent = `Loaded ${store}. Review the values before saving.`;
  } catch (error) { startStatus.textContent = error.message; }
}
document.querySelector('#create').addEventListener('click', create);
document.querySelector('#load').addEventListener('click', load);
form.addEventListener('submit', async event => {
  event.preventDefault();
  const data = submission();
  try {
    const preview = await request('/api/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    reviewed = JSON.stringify(data);
    result.textContent = `Store workspace: ${preview.workspace}\nTarget workspace: ${preview.targetWorkspace}\n\nWorkspace setup:\n${preview.workspaceSetup.join('\n') || 'No new workspace paths'}\n\nAllowed URL hosts:\n${preview.allowedHosts.map(entry => `  ${entry.host} — ${entry.reason}`).join('\n')}\n\nFiles to change (${preview.changed.length}):\n${preview.changed.join('\n') || 'None'}\n\n${preview.note}`;
    apply.style.display = 'inline-block';
  } catch (error) { result.textContent = error.message; }
});
apply.addEventListener('click', async () => {
  if (!reviewed || reviewed !== JSON.stringify(submission())) return invalidate();
  try {
    const saved = await request('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: reviewed });
    operation = 'update';
    form.elements.storeCode.readOnly = true;
    document.querySelector('#form-heading').textContent = `Edit ${form.elements.storeCode.value}`;
    try {
      await refreshEnvironments();
      existingSelect.value = form.elements.storeCode.value;
    } catch (error) { startStatus.textContent = `Saved, but the environment list could not refresh: ${error.message}`; }
    reviewed = '';
    apply.style.display = 'none';
    result.textContent = `Saved ${saved.changed.length} files. Store workspace: ${saved.workspace}.`;
  } catch (error) { result.textContent = error.message; }
});
refreshEnvironments().catch(error => { startStatus.textContent = error.message; });
