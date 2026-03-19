// fungsi untuk hamburger menu
function myFunction(x) {
    x.classList.toggle("change");
    const menu = document.getElementById('menu');
    menu.classList.toggle('active');
    const bars = document.querySelectorAll('.bar1,.bar2,.bar3');
    bars.forEach(bar => {
        bar.classList.toggle("change")
    });
}
// Seleksi semua elemen dengan class 'submit'
document.querySelectorAll('.submit').forEach(function(button) {
    // Tambahkan event listener 'click' untuk setiap tombol yang ditemukan
    button.addEventListener('click', function(event) {
        // Mencegah tindakan default dari tombol (misalnya, mencegah pengiriman form jika tombol ada dalam form)
        event.preventDefault();
        // Menampilkan alert SweetAlert2 dengan informasi bahwa fitur belum tersedia
        Swal.fire({
            title: 'Info',
            text: 'Maaf,fitur ini belum tersedia saat ini!',
            icon: 'info'
        });
    });
});