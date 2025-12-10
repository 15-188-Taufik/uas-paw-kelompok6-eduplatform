# EduPlatform - Local Development Setup

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

