const region = document.getElementById('labs-region');
const userLabel = document.getElementById('user');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function stationsText(n) {
  return n === 1 ? '1 работна станция' : `${n} работни станции`;
}

// Loading: grey cards of the final size, so nothing jumps when the real ones arrive.
function showLoading() {
  const list = el('ul', 'cards');
  list.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 2; i += 1) list.append(el('li', 'card card--skeleton'));
  const status = el('p', 'visually-hidden', 'Зареждане на лабораториите…');
  status.setAttribute('role', 'status');
  region.replaceChildren(status, list);
}

function showEmpty() {
  const box = el('div', 'empty stack');
  box.append(el('h2', null, 'Още няма лаборатории'), el('p', 'muted', 'Когато персоналът добави лаборатория, тя ще се появи тук.'));
  region.replaceChildren(box);
}

function showError(text) {
  const box = el('div', 'alert alert--error');
  box.setAttribute('role', 'alert');
  const retry = el('button', 'button button--quiet', 'Опитай отново');
  retry.type = 'button';
  retry.addEventListener('click', loadLabs);
  box.append(el('p', null, `Грешка: ${text}`), retry);
  region.replaceChildren(box);
}

function showLabs(labs) {
  const list = el('ul', 'cards');
  for (const lab of labs) {
    const card = el('li', 'card');
    card.append(el('h2', null, lab.name), el('p', 'muted', stationsText(lab.workstations)));
    list.append(card);
  }
  region.replaceChildren(list);
}

function signedOut() {
  window.location.assign('/login');
}

async function loadLabs() {
  showLoading();
  try {
    const response = await fetch('/api/labs');
    if (response.status === 401) return signedOut();
    if (!response.ok) return showError('лабораториите не могат да се заредят. Опитайте след малко.');
    const { labs } = await response.json();
    return labs.length === 0 ? showEmpty() : showLabs(labs);
  } catch {
    return showError('няма връзка със сървъра. Проверете интернет връзката.');
  }
}

async function loadUser() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.status === 401) return signedOut();
    if (response.ok) {
      const { user } = await response.json();
      userLabel.textContent = `${user.name} · ${user.email}`;
    }
  } catch {
    // the list has its own error state; the name in the corner is not worth a second one
  }
}

document.getElementById('logout').addEventListener('click', async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } finally {
    signedOut();
  }
});

loadUser();
loadLabs();
