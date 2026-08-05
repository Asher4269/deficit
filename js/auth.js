async function requireAuth() {
  const { data } = await db.auth.getSession();

  if (!data.session) {
    window.location.href = "index.html";
  }
}
