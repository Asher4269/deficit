/*
====================================================
    PROFILE
====================================================
*/

initializeProfile();

async function initializeProfile() {
  await requireAuth();

  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  document.getElementById("user-email").textContent = user.email;
}
