const uploadInput = document.getElementById("upload-photo");
const previewImage = document.getElementById("preview-photo");

/*uploadInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            localStorage.setItem("profilePhoto", previewImage.src);
        };
        reader.readAsDataURL(file);
    }
});*/

// fungsi untuk hamburger menu
function myFunction (x) {
    x.classList.toggle("change");
    const menu = document.getElementById('menu');
    menu.classList.toggle('active');
    
    const bars = document.querySelectorAll('.bar1, .bar2, .bar3');
    bars.forEach(bar => {
        bar.classList.toggle("change");
    });
}

// fungsi untuk dropdown menu foto profil
const profileIcon = document.getElementById("profile-icon");
const dropdownMenu = document.getElementById("dropdown-menu");

profileIcon.addEventListener("click", () => {
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
    if (!profileIcon.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = "none";
    }
});

// fungsi untuk icon edit
document.querySelectorAll(".edit-icon").forEach((icon) => {
  icon.addEventListener("click", () => {
    const input = icon.previousElementSibling;
    const isPasswordField = input.type === "password" || input.dataset.originalType === "password";

    if (input.hasAttribute("readonly")) {
      // Ubah ke mode edit
      input.removeAttribute("readonly");
      input.focus();
      icon.src = "/icons/check2-square.svg"; // icon centang

      // Jika field adalah password, ubah ke text sementara
        if (isPasswordField) {
            input.dataset.originalType = "password"; // simpan type asli
            input.type = "text";
        }

    } else {
      // Validasi sebelum simpan
      if (input.value.trim() === "") {
        const konfirmasi = confirm("Apakah yakin data ini kosong?");
        if (!konfirmasi) return;
      }

      // Simpan & kunci kembali
      input.setAttribute("readonly", true);
      icon.src = "/icons/pencil-square.svg"; // kembali ke icon pensil

      // Jika sebelumnya adalah text, ubah kembali ke "password"
      if (input.dataset.originalType === "password") {
        input.type = "password";
      }
    }
  });
});

async function getProfile() {
    const url = "https://3cvjt4z6-3001.asse.devtunnels.ms/profile";

    try {
        const res = await fetch(url, {
            method: "GET",
            credentials: 'include'
        });

        if (!res.ok) {
            await Swal.fire({
                title: "Sesi Habis",
                text: "Silakan Login Kembali!",
                icon: "warning"
            });

            window.location.href = "/login.html";

            return;
        }

        const data = await res.json();

        if (data.success) {
            document.getElementById("nama").value = data.data.nama;
            document.getElementById("username").value = data.data.username;
            document.getElementById("telepon").value = data.data.telepon;
            document.getElementById("email").value = data.data.email;
            // document.getElementById("password").value = data.data.password;
            document.getElementById("tempat").value = data.data.tempat;
            document.getElementById("tanggal").value = data.data.dataTgl;
            document.getElementById("alamat").value = data.data.alamat;
            document.getElementById("gender").value = data.data.gender;
        } else {
            Swal.fire("Error", data.message, "error");
        }
    } catch(err) {
        console.error("Fetch error:", err);
        Swal.fire({
            title: "Error", 
            text: "Gagal mengambil data profil", 
            icon: "error"
        });
    };
}

getProfile();

// tombol simpan
document.getElementById("profile-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const userId = 1;
    const payload = {
        nama: document.getElementById("nama").value,
        username: document.getElementById("username").value,
        telepon: document.getElementById("telepon").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        ttl: document.getElementById("ttl").value,
        alamat: document.getElementById("alamat").value,
        jenis_kelamin: document.getElementById("gender").value
    };
        // proses simpan ke server/backend disini nanti
        fetch(`https://3cvjt4z6-3001.asse.devtunnels.ms/profile/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                Swal.fire({
                    title: 'Success', 
                    text: 'data.message', 
                    icon: 'success'
                });
            } else {
                Swal.fire({
                title: 'Gagal!', 
                text: 'data.message', 
                icon: 'error'
            });
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire({
                title: "Error!", 
                text: "Gagal terhubung ke server", 
                icon: "error"
            });
        });
    }
);

// tombol batal
document.getElementById("cancel-btn").addEventListener("click", function () {
    const confirmCancel = confirm("Anda yakin data yang ada disini kosong?");
    if (confirmCancel) {
        alert("Data kosong.");
        window.location.href = '/index.html';
        localStorage.clear();
    }
});

/*const photoInput = document.getElementById("upload-photo");
photoInput.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            // tampilan langsung ke navbar
            profileIcon.src = e.target.result;
            // simpan ke localstorage
            localStorage.setItem("profileImage", profileIcon.src);
        };

        reader.readAsDataURL(file); // konversi file ke base64
    }
});*/

// mengambil foto dari localstorage
const savedImg = localStorage.getItem("profilePhoto");
window.addEventListener("DOMContentLoaded", () => {
    if (savedImg && profileIcon) {
        profileIcon.src = savedImg;
        previewImage.src = savedImg;
    }
});

// mengambil data dari localstorage
window.addEventListener("DOMContentLoaded", function () {
    const storedData = JSON.parse(localStorage.getItem("userProfile"));
    if (storedData) {
        document.getElementById("nama").value = storedData.nama;
        document.getElementById("username").value = storedData.username;
        document.getElementById("telepon").value = storedData.telepon;
        document.getElementById("email").value = storedData.email;
        document.getElementById("password").value = storedData.password;
        document.getElementById("ttl").value = storedData.ttl;
        document.getElementById("alamat").value = storedData.alamat;
        document.getElementById("gender").value = storedData.gender;
    }
});

// fungsi untuk buka pop up modal
function openPhotoModal() {
    document.getElementById('photoModal').classList.add('active');
    const currentPhoto = document.getElementById('preview-photo').src;
    document.getElementById('modal-preview').src = currentPhoto;
}

// fungsi untuk tutup pop up modal
function closePhotoModal () {
    document.getElementById('photoModal').classList.remove('active');
}

// fungsi untuk input/upload foto
function previewInModal(input) {
    uploadInput.addEventListener('change', function () {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // tampilan langsung ke navbar
                document.getElementById('profile-icon').src = e.target.result;
                document.getElementById('modal-preview').src = e.target.result;
                document.getElementById('preview-photo').src = e.target.result;
                // simpan ke localstorage
                localStorage.setItem("profilePhoto", e.target.result);
            };        
            reader.readAsDataURL(file); // konversi file ke base64
        }
    });
}

// fungsi untuk hapus foto
function removePhoto() {
    const defaultPhoto = "/icons/person-circle (1).svg";
    document.getElementById('profile-icon').src = defaultPhoto;
    document.getElementById('modal-preview').src = defaultPhoto;
    document.getElementById('preview-photo').src = defaultPhoto;
    localStorage.removeItem('profilePhoto');
    closePhotoModal();
}
