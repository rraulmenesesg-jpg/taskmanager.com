async function login(email, password) {
  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.log('usuario no encontrado ');
    return;
  }

  window.location.href = "tasks.html";
}

async function register(email, password) {
  const { error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    console.log('USUARIO YA EXIXTENTE ');
    return;
  }

  window.location.href = "login.html";
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    await login(email, password);
  });
});
