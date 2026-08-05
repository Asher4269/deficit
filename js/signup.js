const form = document.getElementById("signup-form");

form.addEventListener("submit", signUp);

async function signUp(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value;

  const confirm = document.getElementById("confirm-password").value;

  if (password !== confirm) {
    alert("Passwords do not match.");

    return;
  }

  try {
    const {
      data,

      error,
    } = await db.auth.signUp({
      email,

      password,
    });

    if (error) throw error;

    window.location.href = "profile.html";
  } catch (error) {
    alert(error.message);

    console.error(error);
  }
}
