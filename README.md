
# 🎓 EduPlatform - Learning Management System

**EduPlatform** adalah sebuah platform manajemen pembelajaran (Learning Management System/LMS) berbasis web yang dirancang untuk memfasilitasi kegiatan belajar mengajar secara daring yang efektif, interaktif, dan mudah diakses.

Proyek ini bertujuan untuk menjembatani kesenjangan antara pengajar (instruktur) dan siswa melalui teknologi digital, memungkinkan distribusi materi pelajaran, pelacakan progres belajar, dan evaluasi hasil belajar dalam satu ekosistem terpadu.

---

## 👥 Tim Pengembang (Kelompok 6)

| Nama Lengkap | NIM | Peran (Role) |
| :--- | :--- | :--- |
| **Muhammad Ghama Al Fajri** | 123140182 | Backend Developer |
| **Abi Sholihan** | 123140192 | Backend Developer |
| **Andini Rahma Kemala** | 123140067 | Frontend Developer |
| **Miftahul Khoiriyah** | 123140064 | Frontend Developer |
| **Zahwa Natasya Hamzah** | 123140069 | UI/UX Designer |
| **Taufik Hidayat NST** | 123140188 | Database Design & Implementation |

---

## 🔗 Tautan Penting (Links)

* **🌐 Frontend Deployment:** [https://www.eduplatform.web.id/](https://www.eduplatform.web.id/) (Alternatif: [Vercel App](https://uas-paw-kelompok6-eduplatform.vercel.app/))
* **⚙️ Backend API:** [https://api.eduplatform.web.id/](https://api.eduplatform.web.id/)
* **🎥 Video Presentasi:** [Masukkan Link Video Di Sini]

---

## 🌟 Fitur Utama (Key Features)

Platform ini dibangun dengan fokus pada antarmuka pengguna (User Interface) yang modern dan responsif, memastikan pengalaman pengguna yang mulus baik di perangkat desktop maupun seluler.

### 1. 🔐 Autentikasi & Manajemen Peran
* **Multi-Role Access:** Pemisahan akses antara **Student** dan **Instructor**.
* **Secure Session:** Login dan Logout aman untuk menjaga sesi pengguna.

### 2. 📚 Manajemen Kursus (Instructor)
* **CRUD Capabilities:** Instruktur dapat Membuat, Melihat, Mengubah, dan Menghapus kursus.
* **Course Details:** Manajemen judul, deskripsi lengkap, dan kategori kursus.
* **Module Organization:** Memecah kursus menjadi modul/sesi terstruktur.
* **Multimedia Support:** Menambahkan teks bacaan dan tautan video materi.

### 3. 🎓 Sistem Pendaftaran (Student)
* **Student Browsing:** Menjelajahi katalog kursus berdasarkan kategori.
* **Enrollment:** Mendaftar (*Enroll*) atau membatalkan (*Unenroll*) kursus secara mandiri.
* **My Courses:** Akses cepat ke daftar kursus yang sedang diikuti.

### 4. 📊 Dashboard Terdedikasi
* **Instructor Dashboard:** Memantau kinerja kursus dan melihat daftar siswa terdaftar.
* **Student Dashboard:** Melacak progres belajar (*progress tracking*) dan deadline tugas terdekat.

---

## 🛠️ Tech Stack

**Frontend:**
* ![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB) React + Vite
* ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white) React Router DOM
* ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=flat&logo=css3&logoColor=white) CSS3 & SVG Assets

**Backend:**
* ![Python](https://img.shields.io/badge/python-3670A0?style=flat&logo=python&logoColor=ffdd54) Python 3.10+
* **Pyramid Framework:** Framework web Python yang fleksibel.
* **SQLAlchemy:** ORM untuk interaksi database.
* **Waitress:** WSGI server untuk production/development.

**Database & Tools:**
* ![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=flat&logo=postgresql&logoColor=white) PostgreSQL (Neon Tech)
* **Cloudinary:** Penyimpanan media/gambar.

---

## 🚀 Instalasi & Menjalankan (Local Development)

Dokumentasi ini menjelaskan cara menjalankan aplikasi EduPlatform di komputer lokal (Local Environment). Aplikasi ini dibangun menggunakan **Python (Pyramid Framework)** dan menggunakan database **PostgreSQL (Neon Console)**.

## 📋 Prasyarat (Prerequisites)

Pastikan tools berikut sudah terinstall di komputermu:

1.  **Python 3.10+** (Disarankan Python 3.11 atau 3.12 untuk stabilitas).
2.  **Git** (Untuk clone repository).
3.  **Virtual Environment** (Bawaan Python).

## 🚀 Instalasi & Setup

Ikuti langkah-langkah berikut secara berurutan di terminal (CMD/PowerShell/Terminal).

### 1. Clone Repository
```bash
git clone [https://github.com/username-kamu/eduplatform.git](https://github.com/username-kamu/eduplatform.git)
cd eduplatform
```

### 2. Buat & Aktifkan Virtual Environment
Sangat disarankan menggunakan virtual environment agar library tidak bentrok.

Windows:
```bash
python -m venv env
.\env\Scripts\activate
```
Mac/Linux:
```bash
python3 -m venv env
source env/bin/activate
```

### 3. Install Dependencies 
Install paket utama aplikasi dalam mode editable dan library pendukung (Database & Cloudinary).
```bash
# Install aplikasi dalam mode development
pip install -e .

# Install driver database (PostgreSQL) untuk Windows
pip install psycopg2-binary

# Install library Cloudinary untuk upload gambar
pip install cloudinary
```
(Opsional: Jika ada file requirements.txt)

```bash 
pip install -r requirements.txt
```

### 4. Konfigurasi Environment (development.ini)
Buka file development.ini. Pastikan konfigurasi berikut sudah sesuai:
```bash
sqlalchemy.url = postgresql://user:password@endpoint-neon.tech/dbname?sslmode=require
#Konfigurasi Server (Agar akses lancar di localhost) Ubah bagian [server:main] agar menggunakan IPv4:
[server:main]
use = egg:waitress#main
listen = 127.0.0.1:8080
```

### ▶️ Menjalankan Aplikasi
Setelah semua terinstall, jalankan perintah berikut:
diterminal root:
```bash 
pserve development.ini --reload
```
Jika sukses, terminal akan menampilkan: Serving on http://127.0.0.1:8080

Buka browser dan akses: http://localhost:8080

### Frontend 
https://uas-paw-kelompok6-eduplatform.vercel.app/

## 📡 Dokumentasi API (Endpoints)

Format Request & Response umumnya menggunakan JSON.

| Method | Endpoint | Deskripsi | Auth Required |
| --- | --- | --- | --- |
| **POST** | `/auth/register` | Mendaftar akun baru (Student/Instructor) | Yes |
| **POST** | `/auth/login` | Masuk ke sistem dan mendapatkan token | No |
| **GET** | `/courses` | Mengambil semua daftar kursus | Yes |
| **POST** | `/courses` | Membuat kursus baru (Instructor Only) | Yes |
| **GET** | `/courses/{id}` | Melihat detail kursus tertentu | Yes |
| **POST** | `/courses/{id}/enroll` | Mendaftar ke dalam kursus | Yes |
| **GET** | `/users/my-courses` | Melihat kursus yang diikuti user saat ini | Yes |
| **POST** | `/modules` | Menambahkan materi ke kursus | Yes |

## 📸 Dokumentasi Website

Berikut adalah tampilan antarmuka aplikasi EduPlatform:

### 👨‍🎓 Tampilan Siswa (Student View)

| Dashboard Pembelajaran | Kursus Saya |
| :---: | :---: |
| ![Dashboard Siswa](documentation/DashboardSiswa.png) | ![Kursus Saya](documentation/KursusSaya.png) |
| *Ringkasan aktivitas belajar siswa* | *Daftar kursus yang sedang diikuti* |

**Timeline Deadline**
![Timeline Deadline](documentation/timeline.png)
*Fitur pemantauan deadline tugas dan kursus*

### 👨‍🏫 Tampilan Instruktur (Instructor View)

| Dashboard Instruktur | Manajemen Kursus |
| :---: | :---: |
| ![Dashboard Instruktur](documentation/DashboardInstruktur.png) | ![Manajemen Instruktur](documentation/ManajemenInstruktur.png) |
| *Statistik ringkas untuk pengajar* | *Menu pengelolaan kelas dan materi* |

### 🏠 Halaman Utama (General)
![Halaman Utama](documentation/Dashboard.png)
*Katalog kursus yang tersedia untuk dijelajahi*

---
Made with ❤️ by Kelompok 6

