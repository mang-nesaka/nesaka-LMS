package com.example.eduspace.ui.navigation

import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String) {
    object Dashboard : Screen("dashboard", "Dashboard")
    object Courses : Screen("courses", "Kelas Pembelajaran")
    object CourseDetail : Screen("courses/{courseId}", "Detail Kelas") {
        fun createRoute(courseId: String) = "courses/$courseId"
    }
    object Assignments : Screen("assignments", "Tugas Harian")
    object CbtExams : Screen("cbt_exams", "Ujian CBT Online")
    object CbtExamActive : Screen("cbt_exams/{examId}", "Layar Ujian CBT") {
        fun createRoute(examId: String) = "cbt_exams/$examId"
    }
    object ExamRecap : Screen("exam_recap", "Rekap Nilai CBT")
    object Attendance : Screen("attendance", "Presensi Siswa (GPS & Wajah)")
    object TeacherAgenda : Screen("teacher_agenda", "Scan Barcode & Agenda Guru")
    object Monitoring : Screen("monitoring", "Monitoring Guru Real-Time")
    object Dapodik : Screen("dapodik", "Formulir Dapodik (F-PD)")
    object Documents : Screen("documents", "Verifikasi Dokumen")
    object DigitalCard : Screen("digital_card", "Kartu Pelajar Digital")
    object WaliKelas : Screen("walikelas", "Rekap Presensi Wali Kelas")
    object BeritaAcara : Screen("berita_acara", "Berita Acara Waka")
    object Settings : Screen("settings", "Pengaturan Presensi & Sekolah")
}

data class NavItem(
    val screen: Screen,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val allowedRoles: List<com.example.eduspace.model.UserRole> = emptyList()
)
