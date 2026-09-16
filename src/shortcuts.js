import defaults from './shortcuts.defaults.json';

const storageKey = 'tab-hollow-shortcuts-v1';
const limit = 8;

function normalize(items) {
  if (!Array.isArray(items) || items.length > limit) throw new Error('Use up to eight shortcuts.');
  return items.map(item => {
    if (typeof item?.name !== 'string' || !item.name.trim() || item.name.trim().length > 24) throw new Error('Give each chest a name, up to 24 characters.');
    if (typeof item.url !== 'string' || !item.url.trim()) throw new Error('Add a website address for each chest.');
    const input = item.url.trim();
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(input) ? input : 'https://' + input);
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error('Use an http or https website address without a login in the URL.');
    return {name: item.name.trim(), url: url.href};
  });
}

export function initShortcuts({onOpen = () => {}, onNavigate = () => {}} = {}) {
  const list = document.getElementById('shortcut-list');
  const dialog = document.getElementById('shortcut-editor');
  const rows = document.getElementById('shortcut-rows');
  const error = document.getElementById('shortcut-error');
  const notice = document.getElementById('shortcut-notice');
  const add = document.getElementById('shortcut-add');
  let shortcuts = defaults;
  function load() {
    try {
      const saved = localStorage.getItem(storageKey);
      shortcuts = saved === null ? normalize(defaults) : normalize(JSON.parse(saved));
      notice.textContent = '';
    } catch {
      shortcuts = normalize(defaults);
      notice.textContent = 'Saved links could not be loaded. Showing examples.';
    }
  }
  function render() {
    list.replaceChildren();
    for (const shortcut of shortcuts) {
      const link = document.createElement('a');
      link.className = 'shortcut-chest';
      link.href = shortcut.url;
      link.title = shortcut.name + ' · ' + new URL(shortcut.url).hostname;
      const icon = document.createElement('span');
      icon.className = 'chest-icon';
      icon.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'chest-label';
      label.textContent = shortcut.name;
      link.append(icon, label);
      link.addEventListener('click', onNavigate);
      list.append(link);
    }
    if (!shortcuts.length) {
      const empty = document.createElement('span');
      empty.className = 'shortcut-empty';
      empty.textContent = 'Your next stop goes here.';
      list.append(empty);
    }
  }
  function updateRows() {
    add.disabled = rows.children.length >= limit;
  }
  function addRow(item = {name: '', url: ''}) {
    if (rows.children.length >= limit) return;
    const row = document.createElement('div');
    row.className = 'shortcut-row';
    for (const [key, text, placeholder] of [['name', 'Name', 'My site'], ['url', 'Website', 'example.com']]) {
      const label = document.createElement('label');
      label.textContent = text;
      const input = document.createElement('input');
      input.name = key;
      input.value = item[key];
      input.required = true;
      input.maxLength = key === 'name' ? 24 : 2048;
      input.placeholder = placeholder;
      input.autocomplete = 'off';
      if (key === 'url') { input.inputMode = 'url'; input.spellcheck = false; }
      label.append(input);
      row.append(label);
    }
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'shortcut-remove';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      const next = row.nextElementSibling || row.previousElementSibling;
      row.remove();
      updateRows();
      (next?.querySelector('input') || add).focus();
    });
    row.append(remove);
    rows.append(row);
    updateRows();
    return row;
  }
  document.getElementById('shortcut-edit').addEventListener('click', () => {
    onOpen();
    load();
    render();
    error.textContent = '';
    rows.replaceChildren();
    shortcuts.forEach(addRow);
    updateRows();
    dialog.showModal();
  });
  add.addEventListener('click', () => addRow()?.querySelector('input').focus());
  document.getElementById('shortcut-cancel').addEventListener('click', () => dialog.close());
  document.getElementById('shortcut-form').addEventListener('submit', event => {
    event.preventDefault();
    let next;
    try {
      next = normalize([...rows.children].map(row => ({
        name: row.querySelector('[name=name]').value,
        url: row.querySelector('[name=url]').value
      })));
    } catch (cause) {
      error.textContent = cause instanceof TypeError ? 'That address does not look right. Try example.com or https://example.com.' : cause.message;
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      error.textContent = 'Your browser could not save these links. Allow site storage and try again.';
      return;
    }
    shortcuts = next;
    notice.textContent = '';
    render();
    dialog.close();
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    load();
    render();
    if (dialog.open) error.textContent = 'Links changed in another tab. Cancel to load those changes, or save to keep this edit.';
  });
  load();
  render();
}
