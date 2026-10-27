package com.example.nesaka.data

import com.example.nesaka.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.*

class LmsRepository {

    // Pre-configured users for quick role selection / demo
    val demoUsers = listOf(
        User("usr_student1", "Ahmad Fauzan", "ahmad.fauzan@smkn1.sch.id", UserRole.STUDENT, studentClass = "X RPL 1", nipOrNis = "NIS-2026-0101"),
        User("usr_student2", "Siti Nurhaliza", "siti.nur@smkn1.sch.id", UserRole.STUDENT, studentClass = "X RPL 1", nipOrNis = "NIS-2026-0102"),
        User("usr_teacher1", "Drs. Budi Santoso, M.Pd", "budi.santoso@smkn1.sch.id", UserRole.TEACHER, nipOrNis = "NIP-197508122002"),
        User("usr_teacher2", "Siti Rahmawati, S.Kom", "siti.rahma@smkn1.sch.id", UserRole.TEACHER, nipOrNis = "NIP-198304212006"),
        User("usr_admin", "Administrator Utama", "admin@smkn1.sch.id", UserRole.ADMIN),
        User("usr_tu", "Hj. Endang Suryani (Staf TU)", "tu@smkn1.sch.id", UserRole.TU),
        User("usr_walikelas", "Irfan Hakim, M.Kom", "irfan.hakim@smkn1.sch.id", UserRole.WALI_KELAS, waliKelasOf = "X RPL 1"),
        User("usr_kepsek", "Dr. H. Mulyadi, M.Pd", "kepsek@smkn1.sch.id", UserRole.KEPSEK),
        User("usr_waka_kur", "Asep Saepudin, S.T", "waka.kurikulum@smkn1.sch.id", UserRole.WAKA_KURIKULUM),
        User("usr_waka_sarpras", "Dedi Kusnadi, S.Pd", "waka.sarpras@smkn1.sch.id", UserRole.WAKA_SARPRAS)
    )

    private val _currentUser = MutableStateFlow(demoUsers[0])
    val currentUser: StateFlow<User> = _currentUser.asStateFlow()

    private val _schoolSetting = MutableStateFlow(SchoolSetting())
    val schoolSetting: StateFlow<SchoolSetting> = _schoolSetting.asStateFlow()

    private val _courses = MutableStateFlow<List<Course>>(emptyList())
    val courses: StateFlow<List<Course>> = _courses.asStateFlow()

    private val _assignments = MutableStateFlow<List<Assignment>>(emptyList())
    val assignments: StateFlow<List<Assignment>> = _assignments.asStateFlow()

    private val _exams = MutableStateFlow<List<Exam>>(emptyList())
    val exams: StateFlow<List<Exam>> = _exams.asStateFlow()

    private val _examResults = MutableStateFlow<List<ExamResult>>(emptyList())
    val examResults: StateFlow<List<ExamResult>> = _examResults.asStateFlow()

    private val _attendanceRecords = MutableStateFlow<List<AttendanceRecord>>(emptyList())
    val attendanceRecords: StateFlow<List<AttendanceRecord>> = _attendanceRecords.asStateFlow()

    private val _classrooms = MutableStateFlow<List<Classroom>>(emptyList())
    val classrooms: StateFlow<List<Classroom>> = _classrooms.asStateFlow()

    private val _schedules = MutableStateFlow<List<TeachingSchedule>>(emptyList())
    val schedules: StateFlow<List<TeachingSchedule>> = _schedules.asStateFlow()

    private val _teachingAgendas = MutableStateFlow<List<TeachingAgenda>>(emptyList())
    val teachingAgendas: StateFlow<List<TeachingAgenda>> = _teachingAgendas.asStateFlow()

    private val _dapodikForms = MutableStateFlow<Map<String, DapodikForm>>(emptyMap())
    val dapodikForms: StateFlow<Map<String, DapodikForm>> = _dapodikForms.asStateFlow()

    private val _studentDocuments = MutableStateFlow<List<StudentDocument>>(emptyList())
    val studentDocuments: StateFlow<List<StudentDocument>> = _studentDocuments.asStateFlow()

    private val _activityReports = MutableStateFlow<List<ActivityReport>>(emptyList())
    val activityReports: StateFlow<List<ActivityReport>> = _activityReports.asStateFlow()

    init {
        seedInitialData()
    }

    private fun seedInitialData() {
        // Seed Classrooms
        val initialClassrooms = listOf(
            Classroom("cls_1", "X Rekayasa Perangkat Lunak 1", "NESAKA-X-RPL-1", "10", "RPL"),
            Classroom("cls_2", "X Rekayasa Perangkat Lunak 2", "NESAKA-X-RPL-2", "10", "RPL"),
            Classroom("cls_3", "X Teknik Komputer & Jaringan 1", "NESAKA-X-TKJ-1", "10", "TKJ"),
            Classroom("cls_4", "XI Rekayasa Perangkat Lunak 1", "NESAKA-XI-RPL-1", "11", "RPL"),
            Classroom("cls_5", "XII Rekayasa Perangkat Lunak 1", "NESAKA-XII-RPL-1", "12", "RPL")
        )
        _classrooms.value = initialClassrooms

        // Seed Schedules
        _schedules.value = listOf(
            TeachingSchedule("sch_1", "cls_1", "X Rekayasa Perangkat Lunak 1", "NESAKA-X-RPL-1", "usr_teacher2", "Siti Rahmawati, S.Kom", "Pemrograman Web & Perangkat Bergerak", 1, "07:00", "08:30"),
            TeachingSchedule("sch_2", "cls_1", "X Rekayasa Perangkat Lunak 1", "NESAKA-X-RPL-1", "usr_teacher1", "Drs. Budi Santoso, M.Pd", "Matematika Terapan", 1, "08:45", "10:15"),
            TeachingSchedule("sch_3", "cls_3", "X Teknik Komputer & Jaringan 1", "NESAKA-X-TKJ-1", "usr_teacher2", "Siti Rahmawati, S.Kom", "Dasar Jaringan Komputer", 2, "07:00", "08:30")
        )

        // Seed Courses
        _courses.value = listOf(
            Course("crs_1", "Pemrograman Web & Mobile (X RPL 1)", "Pembelajaran HTML5, CSS3 Modern, Tailwind, JavaScript ES6 dan Kotlin Android Dasar.", "usr_teacher2", "Siti Rahmawati, S.Kom", 34, 12, "RPL1-WEB"),
            Course("crs_2", "Matematika Terapan & Logika", "Kalkulus diferensial, logika informatika, matriks dan aljabar boolean untuk rekayasa.", "usr_teacher1", "Drs. Budi Santoso, M.Pd", 36, 8, "RPL1-MTK"),
            Course("crs_3", "Basis Data & SQL Lanjutan", "Pemodelan ERD, Normalisasi, DDL, DML, Relasi Tabel, dan Stored Procedures.", "usr_teacher2", "Siti Rahmawati, S.Kom", 32, 10, "RPL1-SQL"),
            Course("crs_4", "Sejarah & Wawasan Kebangsaan", "Sejarah nasional Indonesia, pergerakan kemerdekaan, dan etika bernegara.", "usr_teacher1", "Drs. Budi Santoso, M.Pd", 35, 6, "RPL1-SJR")
        )

        // Seed Assignments
        _assignments.value = listOf(
            Assignment(
                "asg_1", "crs_1", "Pemrograman Web & Mobile (X RPL 1)", "Siti Rahmawati, S.Kom",
                "Tugas Praktik 1: Desain Halaman Profil Responsif",
                "Buatlah desain halaman profil digital siswa menggunakan HTML dan styling modern. Pastikan responsif pada tampilan mobile.",
                "Besok, 23:59 WIB", 28, null
            ),
            Assignment(
                "asg_2", "crs_2", "Matematika Terapan & Logika", "Drs. Budi Santoso, M.Pd",
                "Latihan Soal Matriks & Determinan",
                "Kerjakan 5 butir soal matriks di buku catatan, lalu foto dan serahkan rangkuman jawabannya di sini.",
                "29 Okt, 17:00 WIB", 31,
                AssignmentSubmission("sub_1", "asg_2", "usr_student1", "Ahmad Fauzan", "Jawaban telah diunggah dan diverifikasi pada lembar kerja 1-5.", "26 Okt 2026, 14:20", 92, "Penyelesaian sangat sistematis dan rapi.")
            ),
            Assignment(
                "asg_3", "crs_3", "Basis Data & SQL Lanjutan", "Siti Rahmawati, S.Kom",
                "Perancangan Skema Database Perpustakaan",
                "Rancang skema tabel relasional buku, anggota, peminjaman beserta foreign keys dan indeks yang optimal.",
                "31 Okt, 20:00 WIB", 19, null
            )
        )

        // Seed Exams with Questions
        val sampleQuestions = listOf(
            ExamQuestion(
                "q_1", 1, "Manakah pernyataan berikut yang paling tepat mengenai konsep Responsive Web Design pada pengembangan aplikasi modern?",
                null,
                "Menggunakan ukuran piksel statis untuk semua resolusi layar.",
                "Menyesuaikan tata letak komponen secara proporsional sesuai dimensi viewport perangkat.",
                "Menonaktifkan script JavaScript pada browser smartphone.",
                "Membuat URL domain yang terpisah untuk perangkat desktop dan tablet.",
                "Mengharuskan pengguna mengunduh aplikasi native APK.",
                "B"
            ),
            ExamQuestion(
                "q_2", 2, "Pada arsitektur Jetpack Compose, fungsi composable yang menyimpan state melintasi proses rekomposisi dideklarasikan dengan konstruksi:",
                null,
                "remember { mutableStateOf(...) }",
                "static var stateInstance",
                "findViewById(R.id.state)",
                "System.setProperty()",
                "Thread.sleep()",
                "A"
            ),
            ExamQuestion(
                "q_3", 3, "Dalam model relasional basis data, kolom yang berfungsi menghubungkan baris data tabel anak dengan tabel induk dinamakan:",
                null,
                "Primary Index Key",
                "Composite Unique Key",
                "Foreign Key (Kunci Tamu)",
                "Candidate Natural Key",
                "Hash Identity Key",
                "C"
            ),
            ExamQuestion(
                "q_4", 4, "Perhatikan relasi matematis f(x) = 2x^2 + 4x - 6. Turunan pertama f'(x) adalah:",
                null,
                "4x + 4",
                "2x + 4",
                "4x - 6",
                "x^2 + 4",
                "8x + 2",
                "A"
            ),
            ExamQuestion(
                "q_5", 5, "Fungsi dari atribut android:exported='true' pada manifest activity di Android 12 ke atas adalah:",
                null,
                "Menjadikan aplikasi otomatis berbayar di Google Play Store.",
                "Mengizinkan activity diakses oleh komponen sistem atau aplikasi lain (misal sebagai Launcher).",
                "Mengunggah source code ke server cloud.",
                "Menghapus cache memory secara berkala.",
                "Menyembunyikan icon aplikasi dari drawer pengguna.",
                "B"
            )
        )

        _exams.value = listOf(
            Exam(
                "ex_1", "crs_1", "Pemrograman Web & Mobile (X RPL 1)",
                "Ujian Tengah Semester (UTS) Pemrograman Web & Android",
                "Ujian CBT Pilihan Ganda Resmi. Aturan Anti-Kecurangan aktif: jangan meninggalkan aplikasi ujian atau membuka tab lain.",
                45, sampleQuestions, null
            ),
            Exam(
                "ex_2", "crs_2", "Matematika Terapan & Logika",
                "Penilaian Harian: Matriks & Aljabar Boolean",
                "Ujian evaluasi harian kompetensi dasar matriks dan sistem persamaan linier.",
                30, sampleQuestions.take(3),
                ExamResult("res_1", "ex_2", "usr_student1", "Ahmad Fauzan", "X RPL 1", "Penilaian Harian: Matriks & Aljabar Boolean", "Matematika Terapan & Logika", 90, 3, 3, 0, "25 Okt 2026, 09:40 WIB")
            )
        )

        _examResults.value = listOf(
            ExamResult("res_1", "ex_2", "usr_student1", "Ahmad Fauzan", "X RPL 1", "Penilaian Harian: Matriks & Aljabar Boolean", "Matematika Terapan & Logika", 90, 3, 3, 0, "25 Okt 2026, 09:40 WIB"),
            ExamResult("res_2", "ex_2", "usr_student2", "Siti Nurhaliza", "X RPL 1", "Penilaian Harian: Matriks & Aljabar Boolean", "Matematika Terapan & Logika", 85, 2, 3, 1, "25 Okt 2026, 09:44 WIB")
        )

        // Seed Attendance
        _attendanceRecords.value = listOf(
            AttendanceRecord("att_1", "usr_student1", "Ahmad Fauzan", "27 Okt 2026", "06:45 WIB", false, 0, "15:10 WIB", null, "HADIR", 45.0),
            AttendanceRecord("att_2", "usr_student2", "Siti Nurhaliza", "27 Okt 2026", "07:12 WIB", true, 12, null, null, "TERLAMBAT", 82.0)
        )

        // Seed Dapodik
        val student1Dapodik = DapodikForm(
            id = "dpk_1",
            studentId = "usr_student1",
            namaLengkap = "Ahmad Fauzan Pratama",
            nisn = "0078923411",
            nis = "20260101",
            nik = "3273012304070001",
            jenisKelamin = "Laki-laki",
            tempatLahir = "Bandung",
            tanggalLahir = "14 April 2010",
            agama = "Islam",
            alamat = "Jl. Terusan Buah Batu No. 45, Bandung",
            noHp = "081234567890",
            sekolahAsal = "SMP Negeri 2 Bandung",
            namaAyah = "Bambang Pratama",
            namaIbu = "Dewi Lestari",
            pekerjaanAyah = "Karyawan Swasta",
            pekerjaanIbu = "Ibu Rumah Tangga",
            status = "TERVERIFIKASI",
            createdAt = "20 Okt 2026"
        )
        _dapodikForms.value = mapOf("usr_student1" to student1Dapodik)

        // Seed Documents
        _studentDocuments.value = listOf(
            StudentDocument("doc_1", "usr_student1", "Ahmad Fauzan", "AKTE", "Akte_Kelahiran_Ahmad_Fauzan.pdf", "1.4 MB", "VERIFIED", "Dokumen akte terbaca jelas dan absah.", "22 Okt 2026", "20 Okt 2026"),
            StudentDocument("doc_2", "usr_student1", "Ahmad Fauzan", "KK", "Kartu_Keluarga_Fauzan.pdf", "2.1 MB", "VERIFIED", "Nomor KK dan NIK sesuai database Disdukcapil.", "22 Okt 2026", "20 Okt 2026"),
            StudentDocument("doc_3", "usr_student1", "Ahmad Fauzan", "IJAZAH", "Ijazah_SMP_Ahmad_Fauzan.pdf", "3.2 MB", "PENDING", null, null, "25 Okt 2026")
        )

        // Seed Teaching Agendas
        _teachingAgendas.value = listOf(
            TeachingAgenda(
                "agd_1", "sch_1", "cls_1", "X Rekayasa Perangkat Lunak 1",
                "usr_teacher2", "Siti Rahmawati, S.Kom", "Pemrograman Web & Perangkat Bergerak",
                "06:58 WIB", "07:00", "08:30", false, 0,
                "Praktik pembuatan layout grid menggunakan CSS flexbox & media query",
                "Seluruh 36 siswa hadir lengkap di lab komputer."
            ),
            TeachingAgenda(
                "agd_2", "sch_2", "cls_1", "X Rekayasa Perangkat Lunak 1",
                "usr_teacher1", "Drs. Budi Santoso, M.Pd", "Matematika Terapan",
                "08:52 WIB", "08:45", "10:15", true, 7,
                "Pembahasan determinan matriks ordo 3x3 metode Sarus",
                "2 siswa izin ke UKS."
            )
        )

        // Seed Waka Activity Reports
        _activityReports.value = listOf(
            ActivityReport("rep_1", "usr_waka_kur", "Asep Saepudin, S.T", "WAKA_KURIKULUM", "Rapat Koordinasi Penyusunan Modul Ajar Kurikulum Merdeka", "Kurikulum", "24 Okt 2026", "Pembahasan penyesuaian capaian pembelajaran dan jadwal asesmen formatif semester ganjil.", 42, "Tercapai kesepakatan timeline upload silabus."),
            ActivityReport("rep_2", "usr_waka_sarpras", "Dedi Kusnadi, S.Pd", "WAKA_SARPRAS", "Pemeriksaan Kelayakan Sarana Lab Komputer & Jaringan", "Sarana Prasarana", "25 Okt 2026", "Inspeksi 40 unit PC siswa di Lab RPL 2 dan pengecekan akses switch gigabit ethernet.", 6, "Semua PC beroperasi prima, kabel LAN lab telah ditata rapi.")
        )
    }

    fun switchUser(user: User) {
        _currentUser.value = user
    }

    fun joinCourse(code: String): Boolean {
        val course = _courses.value.find { it.inviteCode.equals(code.trim(), ignoreCase = true) }
        return if (course != null) {
            _courses.value = _courses.value.map {
                if (it.id == course.id) it.copy(enrollmentsCount = it.enrollmentsCount + 1) else it
            }
            true
        } else {
            false
        }
    }

    fun createCourse(title: String, description: String, inviteCode: String) {
        val newCourse = Course(
            id = "crs_${System.currentTimeMillis()}",
            title = title,
            description = description,
            teacherId = _currentUser.value.id,
            teacherName = _currentUser.value.name,
            enrollmentsCount = 0,
            lessonsCount = 0,
            inviteCode = inviteCode.ifEmpty { "NESAKA-${(100..999).random()}" }
        )
        _courses.value = listOf(newCourse) + _courses.value
    }

    fun submitAssignment(assignmentId: String, content: String) {
        val user = _currentUser.value
        val submission = AssignmentSubmission(
            id = "sub_${System.currentTimeMillis()}",
            assignmentId = assignmentId,
            studentId = user.id,
            studentName = user.name,
            content = content,
            submittedAt = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale("id", "ID")).format(Date()) + " WIB"
        )
        _assignments.value = _assignments.value.map { asg ->
            if (asg.id == assignmentId) {
                asg.copy(
                    submissionsCount = asg.submissionsCount + 1,
                    mySubmission = submission
                )
            } else asg
        }
    }

    fun submitExamAnswers(examId: String, answers: Map<Int, String>, violationsCount: Int): ExamResult {
        val exam = _exams.value.find { it.id == examId } ?: error("Exam not found")
        var correct = 0
        exam.questions.forEach { q ->
            if (answers[q.questionNumber].equals(q.correctAnswer, ignoreCase = true)) {
                correct++
            }
        }
        val total = exam.questions.size
        val score = if (total > 0) (correct * 100) / total else 0
        val user = _currentUser.value
        val nowFormatted = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale("id", "ID")).format(Date()) + " WIB"

        val result = ExamResult(
            id = "res_${System.currentTimeMillis()}",
            examId = examId,
            studentId = user.id,
            studentName = user.name,
            studentClass = user.studentClass ?: "X RPL 1",
            examTitle = exam.title,
            courseTitle = exam.courseTitle,
            score = score,
            totalCorrect = correct,
            totalQuestions = total,
            violationsCount = violationsCount,
            submittedAt = nowFormatted
        )

        _exams.value = _exams.value.map {
            if (it.id == examId) it.copy(myResult = result) else it
        }
        _examResults.value = listOf(result) + _examResults.value
        return result
    }

    fun performAttendance(isCheckIn: Boolean): Pair<Boolean, String> {
        val user = _currentUser.value
        val setting = _schoolSetting.value
        val now = Calendar.getInstance()
        val currentHour = now.get(Calendar.HOUR_OF_DAY)
        val currentMinute = now.get(Calendar.MINUTE)
        val currentTimeStr = String.format("%02d:%02d WIB", currentHour, currentMinute)
        val todayStr = SimpleDateFormat("dd MMM yyyy", Locale("id", "ID")).format(Date())

        // Calculate simulated distance in meters (e.g. 65 meters from school gate)
        val simulatedDistance = 65.0
        if (simulatedDistance > setting.radiusMeters) {
            return Pair(false, "Lokasi GPS Anda (${simulatedDistance.toInt()}m) berada di luar radius izin sekolah (${setting.radiusMeters}m).")
        }

        val existing = _attendanceRecords.value.find { it.studentId == user.id && it.date == todayStr }

        if (isCheckIn) {
            val lateHour = setting.checkInLateTime.split(":")[0].toIntOrNull() ?: 7
            val lateMin = setting.checkInLateTime.split(":")[1].toIntOrNull() ?: 0
            val isLate = (currentHour > lateHour) || (currentHour == lateHour && currentMinute > lateMin)
            val lateMinutes = if (isLate) ((currentHour - lateHour) * 60 + (currentMinute - lateMin)) else 0

            val record = existing?.copy(
                checkInTime = currentTimeStr,
                isLate = isLate,
                lateMinutes = lateMinutes,
                status = if (isLate) "TERLAMBAT" else "HADIR",
                distanceMeters = simulatedDistance
            ) ?: AttendanceRecord(
                id = "att_${System.currentTimeMillis()}",
                studentId = user.id,
                studentName = user.name,
                date = todayStr,
                checkInTime = currentTimeStr,
                isLate = isLate,
                lateMinutes = lateMinutes,
                status = if (isLate) "TERLAMBAT" else "HADIR",
                distanceMeters = simulatedDistance
            )
            _attendanceRecords.value = listOf(record) + _attendanceRecords.value.filterNot { it.id == record.id }
            return Pair(true, if (isLate) "Presensi masuk berhasil dicatat. Anda terlambat $lateMinutes menit." else "Presensi masuk berhasil dicatat tepat waktu.")
        } else {
            if (existing == null) {
                return Pair(false, "Anda belum melakukan presensi masuk hari ini.")
            }
            val record = existing.copy(checkOutTime = currentTimeStr)
            _attendanceRecords.value = _attendanceRecords.value.map { if (it.id == record.id) record else it }
            return Pair(true, "Presensi pulang berhasil dicatat pada $currentTimeStr.")
        }
    }

    fun recordTeachingAgenda(
        classroomCode: String,
        teachingMaterial: String,
        notes: String
    ): Pair<Boolean, String> {
        val user = _currentUser.value
        val classroom = _classrooms.value.find { it.code.equals(classroomCode.trim(), ignoreCase = true) }
            ?: return Pair(false, "Kode Barcode Ruang Kelas tidak terdaftar.")

        val now = Calendar.getInstance()
        val hour = now.get(Calendar.HOUR_OF_DAY)
        val minute = now.get(Calendar.MINUTE)
        val scanTimeStr = String.format("%02d:%02d WIB", hour, minute)

        // Find schedule for today (or default first match)
        val schedule = _schedules.value.find { it.classroomCode == classroom.code && it.teacherId == user.id }
            ?: _schedules.value.firstOrNull { it.classroomCode == classroom.code }
            ?: TeachingSchedule("sch_auto", classroom.id, classroom.name, classroom.code, user.id, user.name, "Mata Pelajaran Produktif", 1, "07:00", "08:30")

        val schedHour = schedule.startTime.split(":")[0].toIntOrNull() ?: 7
        val schedMin = schedule.startTime.split(":")[1].toIntOrNull() ?: 0
        val isLate = (hour > schedHour) || (hour == schedHour && minute > schedMin)
        val lateMinutes = if (isLate) ((hour - schedHour) * 60 + (minute - schedMin)) else 0

        val agenda = TeachingAgenda(
            id = "agd_${System.currentTimeMillis()}",
            scheduleId = schedule.id,
            classroomId = classroom.id,
            classroomName = classroom.name,
            teacherId = user.id,
            teacherName = user.name,
            subject = schedule.subject,
            scanTime = scanTimeStr,
            scheduledStartTime = schedule.startTime,
            scheduledEndTime = schedule.endTime,
            isLate = isLate,
            lateMinutes = lateMinutes,
            teachingMaterial = teachingMaterial,
            notes = notes
        )

        _teachingAgendas.value = listOf(agenda) + _teachingAgendas.value
        return Pair(true, if (isLate) "Barcode terverifikasi. Anda terlambat masuk $lateMinutes menit dari jadwal." else "Barcode kelas terverifikasi tepat waktu. Selamat mengajar!")
    }

    fun saveDapodik(form: DapodikForm) {
        val current = _dapodikForms.value.toMutableMap()
        current[form.studentId] = form
        _dapodikForms.value = current
    }

    fun updateDocumentStatus(docId: String, status: String, feedback: String?) {
        val now = SimpleDateFormat("dd MMM yyyy", Locale("id", "ID")).format(Date())
        _studentDocuments.value = _studentDocuments.value.map {
            if (it.id == docId) it.copy(status = status, feedback = feedback, verifiedAt = now) else it
        }
    }

    fun uploadStudentDocument(docType: String, fileName: String, fileSize: String) {
        val user = _currentUser.value
        val now = SimpleDateFormat("dd MMM yyyy", Locale("id", "ID")).format(Date())
        val newDoc = StudentDocument(
            id = "doc_${System.currentTimeMillis()}",
            studentId = user.id,
            studentName = user.name,
            docType = docType,
            fileName = fileName,
            fileSize = fileSize,
            status = "PENDING",
            feedback = null,
            verifiedAt = null,
            createdAt = now
        )
        _studentDocuments.value = listOf(newDoc) + _studentDocuments.value
    }

    fun addActivityReport(title: String, category: String, content: String, attendeesCount: Int, docNote: String) {
        val user = _currentUser.value
        val now = SimpleDateFormat("dd MMM yyyy", Locale("id", "ID")).format(Date())
        val report = ActivityReport(
            id = "rep_${System.currentTimeMillis()}",
            authorId = user.id,
            authorName = user.name,
            authorRole = user.role.name,
            title = title,
            category = category,
            date = now,
            content = content,
            attendeesCount = attendeesCount,
            documentationNote = docNote
        )
        _activityReports.value = listOf(report) + _activityReports.value
    }

    fun updateSchoolSetting(setting: SchoolSetting) {
        _schoolSetting.value = setting
    }
}
