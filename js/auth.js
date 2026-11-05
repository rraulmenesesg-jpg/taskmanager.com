// Auth local. Control de UX, no de seguridad.
async function hashPassword(pw) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

async function login(email, password) {
  email = email.trim().toLowerCase();
  const data = db.read();
  const user = data.users.find(u => u.email === email);
  if (!user || user.hash !== await hashPassword(password)) {
    alert("Correo o contraseña incorrectos");
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, email: user.email }));
  window.location.href = "tasks.html";
}

async function register(email, password) {
  email = email.trim().toLowerCase();
  if (password.length < 6) { alert("La contraseña debe tener mínimo 6 caracteres"); return; }
  const data = db.read();
  if (data.users.some(u => u.email === email)) {
    alert("Ese correo ya está registrado");
    return;
  }
  data.users.push({ id: uid(), email, hash: await hashPassword(password) });
  db.write(data);
  window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}
