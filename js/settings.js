/*
====================================================
    SETTINGS
====================================================
*/

initializeSettings();

async function initializeSettings() {
  const profile = await requireAuth();

  if (!profile) return;

  document.getElementById("user-email").textContent =
    profile.display_name || profile.email;

  document.getElementById("logout-btn").addEventListener("click", logout);
}
