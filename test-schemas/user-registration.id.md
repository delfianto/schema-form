# Formulir Pendaftaran Pengguna (Indonesian)

Ini adalah skema uji komprehensif yang mendemonstrasikan semua jenis bidang dan aturan validasi.

```yaml
fields:
  - type: TOGGLE
    name: is_human
    label: Apakah Anda manusia?
    required: true
  - type: TEXT
    name: email
    label: Alamat Email
    description: Harus dalam format email yang valid
    required: true
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  - type: TEXT
    name: phone
    label: Nomor Telepon
    description: Harus berupa nomor telepon - Format (123) 456-7890
    required: false
    regex: '^\(\d{3}\) \d{3}-\d{4}$'
  - type: TEXT
    name: username
    label: Nama Pengguna
    description: "3-20 karakter, hanya huruf dan angka"
    required: true
    regex: "^[a-zA-Z0-9]{3,20}$"
  - type: NUMBER
    name: age
    label: Usia
    description: Harus antara 13 dan 120
    required: true
    min: 13
    max: 120
    default: 25
  - type: NUMBER
    name: salary
    label: Gaji Tahunan
    description: "Opsional, minimum $15.000 jika diisi"
    required: false
    min: 15000
    max: 1000000
  - type: SELECT
    name: country
    label: Negara
    description: Pilih negara Anda
    required: true
    default: Indonesia
    options:
      - Amerika Serikat
      - Kanada
      - Inggris Raya
      - Australia
      - Jerman
      - Prancis
      - Jepang
      - Indonesia
      - Lainnya
  - type: SELECT
    name: skill_level
    label: Tingkat Kemampuan Pemrograman
    description: Bagaimana Anda menilai kemampuan pemrograman Anda?
    required: true
    default: Pemula
    options:
      - Pemula
      - Menengah
      - Mahir
      - Ahli
  - type: TEXT
    name: full_name
    label: Nama Lengkap
    description: Nama depan dan belakang wajib diisi
    required: true
    default: Budi Santoso
```
