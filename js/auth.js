function handleSignup(data) {
    // validasi awal
    if (!data.nama || !data.username || !data.telepon || !data.email || !data.password) {
    console.error("Data tidak lengkap di auth.js");
    return;
  }
  receiveFromAuth(data); // kirim data ke server.js
}