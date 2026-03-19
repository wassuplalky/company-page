// fungsi untuk hamburger menu
function myFunction(x) {
    x.classList.toggle("change");
    const menu = document.getElementById('menu');
    menu.classList.toggle('active');

    const bars = document.querySelectorAll('.bar-1,.bar-2,.bar-3');
    bars.forEach(bar => {
        bar.classList.toggle("change")
    });
}

// fungsi untuk icon eyes pada password
function change() {
    var x = document.getElementById('password').type

    if (x === "password") {
        document.getElementById('password').type = 'text';
        document.getElementById('shbutton').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
            </svg>
            `;
    } else {
        document.getElementById('password').type = 'password';
        document.getElementById('shbutton').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
            </svg>
            `;
    }
}

document.getElementById('login').addEventListener('click', function(event) {
    event.preventDefault(); // mencegah form reload halaman

    let form = document.getElementById('loginPage');
    let inputs = form.querySelectorAll('input');
    let isValid = true;

    /*inputs.forEach(function(input) {
        if (!input.value) {
            isValid = false;
        }
    });*/

    // ambil data
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        Swal.fire({
            title: 'Warning',
            text: 'Please fill out all fields!',
            icon: 'warning'
        });
        return;
    } 

    // kirim ke backend
    fetch("https://company-page-project.vercel.app/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            // localStorage.setItem("token", data.token);
            Swal.fire({
                title: 'Success',
                text: 'Berhasil Login!',
                icon:'success'
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: data.message || 'Terjadi Kesalahan!',
                icon: 'error'
            });
        }
    })
    .catch(error => {
        console.error("Error:", error);
        Swal.fire({
            title: 'Error',
            text: 'Server Error, coba lagi',
            icon: 'error'
        });
    });
});

document.getElementById('forgot-password-link').addEventListener('click', function(event) {
    event.preventDefault();

    Swal.fire({
        title: 'Info',
        text: 'Maaf,fitur ini belum tersedia saat ini.',
        icon: 'info'
    });
});
