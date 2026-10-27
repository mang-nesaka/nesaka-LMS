package com.example.nesaka.model

import kotlinx.serialization.Serializable

@Serializable
enum class UserRole(val label: String, val badgeColor: Long) {
    STUDENT("Siswa", 0xFF4F46E5),
    TEACHER("Guru Mapel", 0xFF9333EA),
    ADMIN("Administrator", 0xFFDC2626),
    TU("Tata Usaha", 0xFF0D9488),
    WALI_KELAS("Wali Kelas", 0xFF2563EB),
    KEPSEK("Kepala Sekolah", 0xFF475569),
    WAKA_KURIKULUM("Waka Kurikulum", 0xFFEA580C),
    WAKA_SARPRAS("Waka Sarpras", 0xFFD97706),
    WAKA_KESISWAAN("Waka Kesiswaan", 0xFF0284C7),
    WAKA_HUBIN("Waka Hubin", 0xFF7C3AED)
}

@Serializable
data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: UserRole,
    val avatarUrl: String? = null,
    val studentClass: String? = null,
    val nipOrNis: String? = null,
    val waliKelasOf: String? = null
)

@Serializable
data class Course(
    val id: String,
    val title: String,
    val description: String,
    val teacherId: String,
    val teacherName: String,
    val enrollmentsCount: Int = 0,
    val lessonsCount: Int = 0,
    val inviteCode: String = ""
)

@Serializable
data class Lesson(
    val id: String,
    val courseId: String,
    val title: String,
    val content: String,
    val order: Int = 1
)

@Serializable
data class AssignmentSubmission(
    val id: String,
    val assignmentId: String,
    val studentId: String,
    val studentName: String,
    val content: String,
    val submittedAt: String,
    val grade: Int? = null,
    val feedback: String? = null
)

@Serializable
data class Assignment(
    val id: String,
    val courseId: String,
    val courseTitle: String,
    val teacherName: String,
    val title: String,
    val description: String,
    val dueDate: String? = null,
    val submissionsCount: Int = 0,
    val mySubmission: AssignmentSubmission? = null
)

@Serializable
data class ExamQuestion(
    val id: String,
    val questionNumber: Int,
    val questionText: String,
    val imageUrl: String? = null,
    val optionA: String,
    val optionB: String,
    val optionC: String,
    val optionD: String,
    val optionE: String? = null,
    val correctAnswer: String = "A"
)

@Serializable
data class ExamResult(
    val id: String,
    val examId: String,
    val studentId: String,
    val studentName: String,
    val studentClass: String = "",
    val examTitle: String = "",
    val courseTitle: String = "",
    val score: Int,
    val totalCorrect: Int,
    val totalQuestions: Int,
    val violationsCount: Int,
    val submittedAt: String
)

@Serializable
data class Exam(
    val id: String,
    val courseId: String,
    val courseTitle: String,
    val title: String,
    val description: String,
    val durationMinutes: Int = 60,
    val questions: List<ExamQuestion> = emptyList(),
    val myResult: ExamResult? = null
)

@Serializable
data class AttendanceRecord(
    val id: String,
    val studentId: String,
    val studentName: String,
    val date: String,
    val checkInTime: String? = null,
    val isLate: Boolean = false,
    val lateMinutes: Int = 0,
    val checkOutTime: String? = null,
    val photoUrl: String? = null,
    val status: String = "HADIR",
    val distanceMeters: Double = 0.0
)

@Serializable
data class SchoolSetting(
    val schoolName: String = "SMK Negeri 1 (Nesaka)",
    val schoolLat: Double = -6.914744,
    val schoolLng: Double = 107.609810,
    val radiusMeters: Int = 200,
    val checkInStartTime: String = "06:30",
    val checkInLateTime: String = "07:00",
    val checkOutStartTime: String = "15:00"
)

@Serializable
data class Classroom(
    val id: String,
    val name: String,
    val code: String,
    val level: String = "10",
    val program: String = ""
)

@Serializable
data class TeachingSchedule(
    val id: String,
    val classroomId: String,
    val classroomName: String,
    val classroomCode: String,
    val teacherId: String,
    val teacherName: String,
    val subject: String,
    val dayOfWeek: Int,
    val startTime: String,
    val endTime: String
)

@Serializable
data class TeachingAgenda(
    val id: String,
    val scheduleId: String,
    val classroomId: String,
    val classroomName: String,
    val teacherId: String,
    val teacherName: String,
    val subject: String,
    val scanTime: String,
    val scheduledStartTime: String,
    val scheduledEndTime: String,
    val isLate: Boolean,
    val lateMinutes: Int,
    val teachingMaterial: String,
    val notes: String = ""
)

@Serializable
data class DapodikForm(
    val id: String,
    val studentId: String,
    val namaLengkap: String,
    val nisn: String,
    val nis: String,
    val nik: String,
    val jenisKelamin: String,
    val tempatLahir: String,
    val tanggalLahir: String,
    val agama: String,
    val alamat: String,
    val noHp: String,
    val sekolahAsal: String,
    val namaAyah: String,
    val namaIbu: String,
    val pekerjaanAyah: String,
    val pekerjaanIbu: String,
    val status: String = "TERVERIFIKASI",
    val createdAt: String
)

@Serializable
data class StudentDocument(
    val id: String,
    val studentId: String,
    val studentName: String,
    val docType: String, // "AKTE", "KK", "IJAZAH"
    val fileName: String,
    val fileSize: String,
    val status: String = "PENDING", // PENDING, VERIFIED, REJECTED
    val feedback: String? = null,
    val verifiedAt: String? = null,
    val createdAt: String
)

@Serializable
data class ActivityReport(
    val id: String,
    val authorId: String,
    val authorName: String,
    val authorRole: String, // WAKA_KURIKULUM, WAKA_KESISWAAN, WAKA_SARPRAS, WAKA_HUBIN
    val title: String,
    val category: String,
    val date: String,
    val content: String,
    val attendeesCount: Int = 0,
    val documentationNote: String = ""
)

@Serializable
data class CorrectionRequest(
    val id: String,
    val studentId: String,
    val studentName: String,
    val fieldToCorrect: String,
    val originalValue: String,
    val requestedValue: String,
    val reason: String,
    val status: String = "MENUNGGU", // MENUNGGU, DISETUJUI, DITOLAK
    val tuResponse: String? = null,
    val createdAt: String
)
