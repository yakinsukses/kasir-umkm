// Helper auth dipakai di semua halaman (kecuali index.html/login)
async function requireLogin(requiredRole = null) {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return null;
  }
  const { data: profile, error } = await db
    .from("users_profile")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    alert("Akun kamu belum punya profil/role. Hubungi admin.");
    await db.auth.signOut();
    window.location.href = "index.html";
    return null;
  }

  if (requiredRole && profile.role !== requiredRole) {
    window.location.href = "kasir.html";
    return null;
  }
  return { user: session.user, role: profile.role };
}

async function logout() {
  await db.auth.signOut();
  window.location.href = "index.html";
}

function formatRupiah(angka) {
  return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}
