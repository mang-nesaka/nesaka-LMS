# EduSpace LMS - Android Application

A comprehensive School Learning Management System (LMS) rewritten for Android using Kotlin and Jetpack Compose, based on `mang-nesaka/nesaka-LMS`.

## Features Ported

1. **Multi-Role Authentication & Quick Switcher:**
   - Seamless role-based portal for `STUDENT`, `TEACHER`, `ADMIN`, `TU` (Tata Usaha), `WALI_KELAS`, `KEPSEK` (Kepala Sekolah), and `WAKA` (Kurikulum, Sarpras, Kesiswaan, Hubin).
   - Real-time role switcher modal for live testing and demonstration.

2. **Dashboard & Academic Metrics:**
   - Personalized greeting banner with Material 3 gradient styling.
   - Live academic summary metrics (Enrolled Classes, Pending Assignments, Available CBT Exams, Completed Tasks).
   - Dapodik completion status alerts for Grade 10 students.
   - Quick action shortcuts to primary modules.

3. **Classes & Learning Management (Kelas Pembelajaran):**
   - Active course directory with enrolled student counts, teacher profiles, and syllabus modules.
   - "Gabung Kelas" with class invite codes (e.g., `RPL1-WEB`).
   - "Buat Kelas Baru" for Teachers and Administrators.

4. **Daily Assignments (Tugas Harian):**
   - Assignment listings with due dates and submission statuses.
   - Student submission interface with answer summaries and document links.
   - Teacher grading and feedback notes display.

5. **Anti-Cheat CBT Exam Engine (Computer Based Test):**
   - Live countdown timer for active exams.
   - Question palette navigator for jumping between questions and tracking answered items.
   - Multiple choice selection (A, B, C, D, E) with immediate state preservation.
   - Active anti-cheat tab-switching violation tracker with automatic exam submission upon reaching violation limits.
   - Final score report card (Score / 100, correct count, violations, completion timestamp).
   - School-wide CBT exam recap view with statistics.

6. **Student Attendance (Presensi GPS & Wajah):**
   - Geofence radius validation against school gate coordinates.
   - Camera selfie capture preview indicator.
   - Morning check-in (Masuk Pagi) with automatic punctuality calculation (late threshold at 07:00 WIB).
   - Afternoon check-out (Presensi Pulang) after 15:00 WIB.
   - Student personal attendance history log.

7. **Classroom Barcode Scanning & Teacher Agenda:**
   - Quick classroom barcode selector / scanner (e.g. `NESAKA-X-RPL-1`, `NESAKA-X-TKJ-1`).
   - Automated teaching schedule matching.
   - Lateness detection comparing arrival scan time to scheduled class start time.
   - Teaching material and classroom notes logging.

8. **Real-time Teacher Monitoring (Kepsek & Waka):**
   - Live feed of all classrooms and teacher activities.
   - Instant metrics: Active classes, on-time teachers, late arrivals.

9. **Dapodik F-PD Registration (Data Pokok Pendidikan):**
   - Complete F-PD form for new 10th graders (NISN, NIS, NIK, Tempat/Tanggal Lahir, Agama, Alamat, No HP, Sekolah Asal, Orang Tua).
   - Administrative review table with search and filtering for TU and Admins.

10. **Student Document Management (Verifikasi Dokumen TU):**
    - Student upload interface for Birth Certificate (Akte), Family Card (KK), and Junior High Diploma (Ijazah SMP).
    - Status badges: Menunggu Verifikasi, Terverifikasi, Ditolak.
    - TU verification queue with approval and rejection feedback workflows.

11. **Digital Student ID Card (Kartu Pelajar Digital):**
    - High-fidelity electronic student card with student avatar, NISN/NIS, class, program, QR verification badge, and validity seal.

12. **Homeroom Teacher Portal (Wali Kelas):**
    - Class attendance breakdown across daily, weekly, monthly, and semester periods.
    - Individual student attendance status logs.

13. **Vice Principal Activity Logs (Berita Acara Waka):**
    - Activity and meeting minutes logger for Waka Kurikulum, Sarpras, Kesiswaan, and Hubin.
    - Category filtering and documentation notes.

14. **School Settings:**
    - Configurable school GPS coordinates, geofence radius (meters), and morning/afternoon attendance hours.

## Architecture

- **Language:** Kotlin
- **UI Framework:** Jetpack Compose with Material Design 3 (M3)
- **Architecture Pattern:** MVVM with reactive Kotlin Flows and StateFlow
- **Navigation:** Multi-pane responsive scaffold with Material Navigation Bar, TopAppBar, and BottomSheet drawer
- **Theme:** Dynamic Light and Dark modes with custom Indigo and Purple palettes
- **Icon:** Custom adaptive launcher icon with vector foreground and background
