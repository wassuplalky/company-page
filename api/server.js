require('dotenv').config({ path: '../.env.production' });

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const port = 3001;

const app = express();

app.use(cors({
    origin:"https://company-page-project.vercel.app",
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'OPTIONS']
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(session({
    secret: process.env.KEY_SESSION, // ganti dengan string acak yang kuat
    resave: false,
    saveUninitialized: false,
    cookies: {
        secure: false, // set ke true jika menggunakan https
        httpOnly: true, // mencegah akses cookies javascript (XSS)
        maxAge: 24 * 60 * 60 * 1000 // expired dalam 24 jam
    }
}));

console.log("secret key for session:", process.env.KEY_SESSION ? "OK" : "MISSING!");
console.log("secret key for JWT:", process.env.KEY_JWT ? "OK" : "MISSING!");
console.log("DB HOST:", process.env.DB_HOST ? "OK" : "MISSING!");
console.log("DB USER:", process.env.DB_USER ? "OK" : "MISSING!");
console.log("DB PASS:", process.env.DB_PASS ? "OK" : "MISSING!");
console.log("DB NAME:", process.env.DB_NAME ? "OK" : "MISSING!");
console.log("DB PORT:", process.env.DB_PORT ? "OK" : "MISSING!");

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
};

// koneksi database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Koneksi Database Gagal!:', err);
    } else {
        console.log('Koneksi Database Berhasil.');
    }
});

// route signup
app.post('/', async (req, res) => {
    const {nama, username, telepon, email, tempat, tanggal, gender, alamat,  password} = req.body;
    
    // validasi input
    if (!nama || !username || !telepon || !email || !tempat || !tanggal || !gender || !alamat || !password) {
        return res.status(400).send('Semua bidang harus diisi!.');
    }

    // validasi username
    const userRegex = /^(?=.*[0-9])(?=.*[._])[a-zA-Z0-9._]{5,}$/;
    if (!userRegex.test(username)) {
        return res.status(400).send('Username tidak valid!')
    }
    
    // validasi email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).send('Format email salah.')
    }
    
    // validasi nomor hp
    if (!/^\d{10,}$/.test(telepon)) {
        return res.status(400).send('Nomor telepon tidak valid!')
    }

    // validasi tempat lahir
    const tempatregex = /^[a-zA-Z\s.,-]+$/;
    if (!tempatregex.test(tempat)) {
        return res.status(400).send('Tempat lahir tidak valid!')
    }

    // validasi alamat
    const alamatregex = /^[a-zA-Z0-9\s.,\/-]+$/;
    if (!alamatregex.test(alamat)) {
        return res.status(400).send('Alamat tidak valid!')
    }
    
    // validasi password
    if (password.length < 6) {
        return res.status(400).send('Password terlalu pendek!')
    }
    /*res.json({ message: 'Data berhasil diterima oleh server!', data: req.body});*/

    try {
        // cek database
        const checkSql = `SELECT * FROM t_database WHERE email = ? OR username = ? OR telepon = ?`;
        db.query(checkSql, [email, username, telepon], async (err, rows) => {
            if (err) {
                console.error('Error cek data:', err);
                return res.status(500).json({ success: false, message: 'Kesalahan server saat cek data!' });
            }

            if (rows.length > 0) {
                // sudah terdaftar
                return res.status(400).json({ success: false, message: 'Sudah terdaftar, silakan login' });
            }
            // jumlah saltrounds (nilai acak untuk hashing password)
            const saltRounds = await bcrypt.genSalt(10);
            // prosess hashing password
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // simpan data ke database
            const sql = `INSERT INTO t_database (nama, username, telepon, email, tempat, tanggal, gender, alamat, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.query(sql, [nama, username, telepon, email, tempat, tanggal, gender, alamat, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Gagal simpan data:', err);
                } else {
                    res.status(201).json({ success: true, message: 'Pendaftaran berhasil!'});
                }
            });
        });
    } catch (error) {
        console.error('Gagal melakukan pendaftaran!', error);
        res.status(500).json({ success: false, message: 'Terjadi Kesalahan Server!'});
    }
});
// route login
app.post('/login', (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Semua field harus diisi!" });
    }

    // cek username di database
    db.query("SELECT * FROM `t_database` WHERE username = ?", [username], async (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Kesalahan server" });
        }

        if (result.length === 0) {
            return res.status(401).json({ success: false, message: "Username tidak ditemukan!" });
        }

        const user = result[0];

        // cek password dengan bcrypt.compare
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Password salah!" });
        }

        // buat token JWT
        const JWT_SECRET = process.env.KEY_JWT;
        const token = jwt.sign(
            { id: user.id, username: user.username }, // payload
            JWT_SECRET,
            { expiresIn: "1h" } // expired 1 jam
        );

        req.session.userId = user.user_id;
        req.session.username = user.username;
        return res.json({ success: true, message: "Login Berhasil!", token });
    });
});

// route GET profile berdasarkan user_id
app.get('/profile', isAuthenticated,(req, res) => {
    const loggedInUserId = req.session.userId;

    const sql = `SELECT nama, username, telepon, email, tempat, DATE_FORMAT(tanggal, '%Y-%m-%d') AS dataTgl, alamat, gender FROM t_database WHERE user_id = ?`;

    db.query(sql, [loggedInUserId], (err, results) => {
        if (err) {
            console.error('Error ambil data:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const user = results[0];

        /* logic penggabungan tempat dan tanggal lahir
        const tgl = user.dataTgl; // format 'YYYY-MM-DD'
        let tglFormatted = 'Tanggal tidak tersedia';

        // array nama bulan
        const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        // validasi user.dataTgl
        if (typeof tgl === 'string' && tgl !== '' && tgl !== '00/00/0000') {
            const parts = tgl.split('/'); // membersihkan "/"

            if (parts.length === 3) {
                const hari = parts[0];
                const bulanAngka = parseInt(parts[1]);
                const tahun = parts[2];

                // konversi bulan angka menjadi bulan nama
                const bulanIndonesia = namaBulan[bulanAngka - 1] || '';

                tglFormatted = `${hari} ${bulanIndonesia} ${tahun}`; // jika validasi berhasil menjadi dd mm yy (menggunakan spasi)
            }
        }
        const tempat = user.tempat || '-'; // tempat lahir jika tidak ada maka "-"
        const ttl = `${tempat}, ${tglFormatted}`; // menggabungkan tempat dan tglformatted

        // hapus alias yang lama
        delete user.tempat;
        delete user.dataTgl;

        user.ttl = ttl; // hasil dari gabungan tempat dan tgl formatted

        // field tambahan yang belum ada di DB -> kasih default "-"
        user.password = "******";
        user.gender = "--Pilih--";*/

        res.json({ success: true, message: 'Data berhasil diambil', data: user });
    });
});

// route PUT for button save
app.put('/profile/:id', (req, res) => {
    const userId = req.params.id;
    const { nama, username, telepon, email, tempat, tanggal, alamat, gender, password } = req.body;

    // ambil data
    const sqlSelect = 'SELECT * FROM t_database WHERE user_id = ?';
    db.query(sqlSelect, [userId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        if (result.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan!' });

        const oldData = result[0];

        // bandingkan data lama vs baru
        const changes = {};
        if (nama && nama !== oldData.nama) changes.nama = nama;
        if (username && username !== oldData.username) changes.username = username;
        if (telepon && telepon !== oldData.telepon) changes.telepon = telepon;
        if (email && email !== oldData.email) changes.email = email;
        if (tempat && tempat !== oldData.tempat) changes.tempat = tempat;
        if (tanggal && tanggal !== oldData.tanggal) changes.tanggal = tanggal;
        if (alamat && alamat !== oldData.alamat) changes.alamat = alamat;
        if (gender && gender !== oldData.gender) changes.gender = gender;

        // jika tidak perubahan
        if (Object.keys(changes).length === 0) {
            // tidak ada perubahan
            return res.json({ success: true, message: 'Data berhasil disimpan' });
        }

        // buat query update dinamis
        const fields = Object.keys(changes).map(key => `${key} = ?`).join(', ');
        const values = Object.values(changes);
        const sqlUpdate = `UPDATE t_database SET ${fields} WHERE user_id = ?`;

        db.query(sqlUpdate, [...values, userId], (err2) => {
            if (err2) { 
                console.error('Gagal Update Data:', err2);
                return res.status(500).json({ success: false, message: 'Gagal update data' });
            }
            return res.json({ success: true, message: "Data berhasil diperbarui" });
        });
    });
});

// route for server method get
app.get('/', (req, res) => {
    res.json({ message: 'Method Not Allowed!'});
});

app.get('/login', (req, res) => {
    res.json({ message: 'Method Not Allowed!'});
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
