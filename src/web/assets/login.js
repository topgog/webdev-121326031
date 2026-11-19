const form = document.getElementById('login-form');
const message = document.getElementById('message');
const submit = document.getElementById('submit');

function show(kind, text) {
  message.hidden = false;
  message.className = `alert alert--${kind}`;
  message.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  message.textContent = `${kind === 'error' ? 'Грешка: ' : 'Готово: '}${text}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.hidden = true;
  submit.disabled = true;
  submit.textContent = 'Влизане…';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email.value, password: form.password.value }),
    });
    if (response.ok) {
      show('success', 'влязохте. Пренасочване…');
      window.location.assign('/labs');
      return;
    }
    const body = await response.json().catch(() => ({}));
    show('error', response.status < 500 && body.error ? body.error.message : 'Нещо се обърка. Опитайте отново.');
    form.password.focus();
  } catch {
    show('error', 'Няма връзка със сървъра. Проверете интернет връзката и опитайте отново.');
  }
  submit.disabled = false;
  submit.textContent = 'Вход';
});
