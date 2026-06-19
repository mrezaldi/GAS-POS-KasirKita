# **📱 POS Mobile KasirKita – Panduan Instalasi**

Sistem POS ini menggunakan kombinasi **Google Sheets** (sebagai basis data real‑time cloud gratis) dan **Google Apps Script (GAS)** (sebagai backend API sekaligus server hosting web).

Sistem ini dilengkapi dengan mekanisme **Mutex Lock** untuk mencegah kondisi *race condition* ketika beberapa kasir menulis ke database secara bersamaan, sehingga stok barang tetap akurat.

---

## **🛠️ Langkah‑langkah Penerapan**

### **Langkah 1: Buat Google Spreadsheet Baru**

1. Buka [Google Sheets](https://sheets.google.com) dan buat spreadsheet kosong baru.  
2. Beri nama file tersebut, misalnya: **"Database POS KasirKita"**.

### **Langkah 2: Buka Editor Apps Script**

1. Di menu atas spreadsheet, klik **Extensions** → **Apps Script**.  
2. Anda akan masuk ke editor kode terintegrasi Google Workspace.

### **Langkah 3: Masukkan Kode Backend (Code.gs)**

1. Di panel kiri editor, Anda akan melihat file bernama `Code.gs`.  
2. Hapus semua fungsi bawaan yang ada di dalamnya.  
3. Salin kode lengkap dari file `Code.gs` (file kedua yang saya berikan sebelumnya) dan tempelkan (*paste*) langsung ke editor.  
4. Klik ikon disket hitam (atau tekan `Ctrl+S` / `Cmd+S`) untuk menyimpan.

### **Langkah 4: Masukkan Kode Frontend (index.html)**

1. Di panel kiri editor, klik tombol **"+" (Add a file)**, lalu pilih **HTML**.  
2. Beri nama file baru tersebut **index** (secara otomatis akan menjadi `index.html`).  
3. Buka `index.html`, lalu hapus semua template bawaan.  
4. Salin kode lengkap dari file `index.html` (file pertama yang saya berikan sebelumnya) dan tempelkan ke editor.  
5. Simpan file tersebut.

### **Langkah 5: Terapkan dan Jalankan Web App (Deployment)**

1. Di pojok kanan atas editor, klik **Deploy** → **New deployment**.  
2. Klik ikon roda gigi (Select type) dan pilih **Web app**.  
3. Isi konfigurasi sebagai berikut:  
   - **Description:** `KasirKita Mobile POS v1`  
   - **Execute as:** `Me (email Anda)` – **Wajib** agar aplikasi memiliki izin menulis data ke spreadsheet atas nama akun Anda.  
   - **Who has access:** `Anyone` – Pilihan terbaik agar kasir/karyawan dapat membuka aplikasi dari ponsel mereka tanpa perlu login akun Google.  
4. Klik tombol **Deploy**.  
5. Jika muncul jendela otorisasi (`Authorization required`), berikan izin akses: klik **Advanced** → **Go to Database POS KasirKita (unsafe)** → **Allow**.  
6. Google akan memberikan **Web App URL** di akhir proses. **Salin URL tersebut!**

---

## **🔗 Cara Menghubungkan ke Smartphone**

- Buka **Web App URL** yang sudah disalin di smartphone Anda (menggunakan Chrome, Safari, atau browser lain).  
- Agar terasa seperti aplikasi asli (*native app*), pilih opsi browser **"Add to Home Screen" (Tambahkan ke Layar Utama)**. Aplikasi POS akan terbuka dalam mode layar penuh tanpa bilah pencarian browser.

---

## **🗄️ Struktur Sheet yang Terbentuk Otomatis**

Setelah mengakses aplikasi pertama kali (atau menekan tombol **Sinkronisasi**), Google Sheets Anda akan otomatis membuat tab‑tab berikut:

### **1. Tab Products (Daftar Produk & Stok)**

| ID | Name | Category | Price | Cost | Stock |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | Kopi Susu Gula Aren | Minuman | 18000 | 8000 | 25 |
| 2 | Nasi Goreng Spesial | Makanan | 25000 | 12000 | 15 |

### **2. Tab Transactions (Riwayat Struk & Penjualan)**

| Transaction ID | Timestamp | Subtotal | Items JSON | Items Text | Total | Paid Amount | Change |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| TRX-10294 | 12/03/2026 15:43 | 43000 | `[{"id":"1", "name":"..."}]` | Kopi Susu (1x), Nasi Goreng (1x) | 47730 | 50000 | 2270 |

---

## **🧠 Keunggulan Arsitektur Full‑Stack GAS**

1. **Performa Instan di Mobile:** Sisi klien menggunakan kerangka Tailwind CSS yang minimalis dan modern. Sangat ringan, hemat baterai ponsel kasir, dan rendering cepat.  
2. **Keamanan Transaksi Konkuren:** Backend menggunakan `LockService` untuk mencegah konflik data jika beberapa kasir menekan tombol bayar dalam milidetik yang sama.  
3. **Penyimpanan Lokal Hybrid:** Jika koneksi internet kasir terputus, aplikasi POS tetap dapat memproses transaksi menggunakan penyimpanan lokal sementara, sehingga operasional tidak terganggu.
