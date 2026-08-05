/*
====================================================
    LOGIN
====================================================
*/

redirectIfLoggedIn();

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", login);

async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value;

  const rememberMe = document.getElementById("remember-me").checked;

  try {
    const { error } = await db.auth.signInWithPassword({
      email,

      password,
    });

    if (error) throw error;

    /*
            We will later use rememberMe
            if we decide to customize session behavior.
            For now, Supabase persists sessions automatically.
        */

    window.location.href = "profile.html";
  } catch (error) {
    console.error(error);

    alert(error.message);
  }
}
