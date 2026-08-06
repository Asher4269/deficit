/*
====================================================
    PROFILE
====================================================
*/

initializeProfile();

async function initializeProfile() {
  const profile = await requireAuth();

  if (!profile) return;

  document.getElementById("user-email").textContent = profile.display_name;

  const weightEl = document.getElementById("current-weight");
  if (weightEl && profile.initial_weight != null) {
    weightEl.textContent = `${profile.initial_weight} lbs`;
  }
}
