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

  const submitBtn = loginForm.querySelector(".login-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in...";

  try {
    const { error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // signInWithPassword resolves only once the session is fully
    // established, so it's safe to send the user straight to
    // profile.html from here.
    window.location.href = "profile.html";
  } catch (error) {
    console.error("login error:", error);
    alert(error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = "Log In";
  }
}
