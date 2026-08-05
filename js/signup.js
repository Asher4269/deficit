/*
====================================================
    SIGN UP
====================================================
*/

redirectIfLoggedIn();

const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", signUp);

async function signUp(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value;

  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match.");

    return;
  }

  try {
    const { data, error } = await db.auth.signUp({
      email,

      password,
    });

    if (error) throw error;

    /*
            The database trigger automatically creates
            the matching row in public.profiles.
        */

    window.location.href = "profile.html";
  } catch (error) {
    console.error(error);

    alert(error.message);
  }
}
