package com.example.nesaka.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nesaka.data.LmsRepository
import com.example.nesaka.model.UserRole
import com.example.nesaka.ui.navigation.Screen
import com.example.nesaka.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    repository: LmsRepository,
    onNavigate: (Screen) -> Unit
) {
    val currentUser by repository.currentUser.collectAsState()
    val courses by repository.courses.collectAsState()
    val assignments by repository.assignments.collectAsState()
    val exams by repository.exams.collectAsState()
    val attendanceRecords by repository.attendanceRecords.collectAsState()
    val dapodikForms by repository.dapodikForms.collectAsState()
    val teachingAgendas by repository.teachingAgendas.collectAsState()

    var showRoleDialog by remember { mutableStateOf(false) }

    val isStudent = currentUser.role == UserRole.STUDENT
    val isTeacher = currentUser.role == UserRole.TEACHER
    val isAdminOrTU = currentUser.role == UserRole.ADMIN || currentUser.role == UserRole.TU
    val isKepsekOrWaka = currentUser.role in listOf(
        UserRole.KEPSEK, UserRole.WAKA_KURIKULUM, UserRole.WAKA_SARPRAS, UserRole.WAKA_KESISWAAN, UserRole.WAKA_HUBIN
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("dashboard_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Welcome Hero Banner
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("welcome_card"),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(
                                colors = listOf(IndigoPrimary, PurpleAccent)
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                shape = RoundedCornerShape(50),
                                color = PureWhite.copy(alpha = 0.2f)
                            ) {
                                Text(
                                    text = currentUser.role.label,
                                    color = PureWhite,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                                )
                            }

                            FilledTonalButton(
                                onClick = { showRoleDialog = true },
                                colors = ButtonDefaults.filledTonalButtonColors(
                                    containerColor = PureWhite.copy(alpha = 0.25f),
                                    contentColor = PureWhite
                                ),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                                modifier = Modifier.testTag("switch_role_button")
                            ) {
                                Icon(Icons.Default.SwapHoriz, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Ganti Peran", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Halo, ${currentUser.name}! 👋",
                            color = PureWhite,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (isStudent) {
                                "Selamat datang di ruang pembelajaran mandiri SMKN 1. Selesaikan tugas harian dan ikuti evaluasi CBT daring."
                            } else if (isTeacher) {
                                "Pusat manajemen kelas, penilaian tugas, dan scan barcode ruang mengajar guru."
                            } else {
                                "Panel administrasi & monitoring akademik terpadu sekolah."
                            },
                            color = IndigoLight,
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                    }
                }
            }
        }

        // Student Dapodik Alert if not filled
        if (isStudent && !dapodikForms.containsKey(currentUser.id)) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigate(Screen.Dapodik) }
                        .testTag("dapodik_alert_card"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = AmberLight),
                    border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(AmberWarning, AmberWarning)))
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = AmberWarning, modifier = Modifier.size(28.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Formulir Dapodik Siswa Baru Belum Lengkap", color = Slate900, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("Wajib dilengkapi untuk sinkronisasi data pokok Kemdikbud.", color = Slate600, fontSize = 12.sp)
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = AmberWarning)
                    }
                }
            }
        }

        // Quick Metrics Grid
        item {
            Text("Ringkasan Akademik", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Slate800)
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (isStudent) {
                    MetricBox(
                        title = "Kelas Diikuti",
                        value = "${courses.size}",
                        icon = Icons.Default.Book,
                        color = IndigoPrimary,
                        modifier = Modifier.weight(1f)
                    )
                    MetricBox(
                        title = "Tugas Tersedia",
                        value = "${assignments.size}",
                        icon = Icons.Default.Assignment,
                        color = AmberWarning,
                        modifier = Modifier.weight(1f)
                    )
                    MetricBox(
                        title = "Ujian CBT",
                        value = "${exams.size}",
                        icon = Icons.Default.Computer,
                        color = PurpleAccent,
                        modifier = Modifier.weight(1f)
                    )
                } else if (isTeacher) {
                    MetricBox(
                        title = "Kelas Mengajar",
                        value = "${courses.size}",
                        icon = Icons.Default.School,
                        color = IndigoPrimary,
                        modifier = Modifier.weight(1f)
                    )
                    MetricBox(
                        title = "Tugas Aktif",
                        value = "${assignments.size}",
                        icon = Icons.Default.Assignment,
                        color = AmberWarning,
                        modifier = Modifier.weight(1f)
                    )
                    MetricBox(
                        title = "Agenda Hari Ini",
                        value = "${teachingAgendas.size}",
                        icon = Icons.Default.QrCodeScanner,
                        color = EmeraldSuccess,
                        modifier = Modifier.weight(1f)
                    )
                } else {
                    MetricBox(
                        title = "Siswa Terdata",
                        value = "${repository.demoUsers.count { it.role == UserRole.STUDENT }}",
                        icon = Icons.Default.People,
                        color = IndigoPrimary,
                        modifier = Modifier.weight(1f)
                    )
                    MetricBox(
                        title = "Dapodik Masuk",
                        value = "${dapodikForms.size}",
                        icon = Icons.Default.AssignmentTurnedIn,
                        color = EmeraldSuccess,
                        modifier = Modifier.weight(1f)
                    )
                    MetricBox(
                        title = "Monitoring Guru",
                        value = "${teachingAgendas.size}",
                        icon = Icons.Default.LiveTv,
                        color = RoseError,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Quick Feature Launcher
        item {
            Text("Akses Cepat Fitur Utama", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Slate800)
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                QuickActionItem(
                    title = "Ujian CBT",
                    icon = Icons.Default.Computer,
                    color = PurpleAccent,
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigate(Screen.CbtExams) }
                )
                QuickActionItem(
                    title = if (isStudent) "Presensi GPS" else "Agenda Barcode",
                    icon = if (isStudent) Icons.Default.LocationOn else Icons.Default.QrCodeScanner,
                    color = if (isStudent) IndigoPrimary else EmeraldSuccess,
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigate(if (isStudent) Screen.Attendance else Screen.TeacherAgenda) }
                )
                QuickActionItem(
                    title = "Tugas Siswa",
                    icon = Icons.Default.Assignment,
                    color = AmberWarning,
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigate(Screen.Assignments) }
                )
                QuickActionItem(
                    title = if (isStudent) "Kartu Digital" else "Monitoring",
                    icon = if (isStudent) Icons.Default.Badge else Icons.Default.LiveTv,
                    color = if (isStudent) EmeraldSuccess else RoseError,
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigate(if (isStudent) Screen.DigitalCard else Screen.Monitoring) }
                )
            }
        }

        // Active Courses Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Kelas Pembelajaran Aktif", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Slate800)
                TextButton(onClick = { onNavigate(Screen.Courses) }) {
                    Text("Lihat Semua", color = IndigoPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        items(courses.take(3)) { course ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigate(Screen.Courses) },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Slate200, Slate200)))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(IndigoLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Book, contentDescription = null, tint = IndigoPrimary, modifier = Modifier.size(24.dp))
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(course.title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        Text("Pengajar: ${course.teacherName}", fontSize = 12.sp, color = Slate500)
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text("👥 ${course.enrollmentsCount} Siswa", fontSize = 11.sp, color = IndigoPrimary, fontWeight = FontWeight.Medium)
                            Text("📚 ${course.lessonsCount} Materi", fontSize = 11.sp, color = Slate500)
                        }
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400)
                }
            }
        }
    }

    // Role Switcher Modal
    if (showRoleDialog) {
        AlertDialog(
            onDismissRequest = { showRoleDialog = false },
            title = { Text("Pilih Akun & Peran Pengguna", fontWeight = FontWeight.Bold) },
            text = {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(repository.demoUsers) { user ->
                        val isSelected = user.id == currentUser.id
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    repository.switchUser(user)
                                    showRoleDialog = false
                                },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isSelected) IndigoLight else Slate50
                            ),
                            border = if (isSelected) CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(IndigoPrimary, IndigoPrimary))) else null
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(Color(user.role.badgeColor)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = user.name.take(1),
                                        color = PureWhite,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(user.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Slate900)
                                    Text("${user.role.label} • ${user.email}", fontSize = 11.sp, color = Slate500)
                                }
                                if (isSelected) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = IndigoPrimary, modifier = Modifier.size(20.dp))
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showRoleDialog = false }) {
                    Text("Tutup", color = IndigoPrimary)
                }
            }
        )
    }
}

@Composable
fun MetricBox(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Slate200, Slate200)))
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(color.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
            }
            Text(value, fontWeight = FontWeight.Black, fontSize = 20.sp, color = Slate900)
            Text(title, fontSize = 11.sp, color = Slate500, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}

@Composable
fun QuickActionItem(
    title: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Slate200, Slate200)))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(color.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate800, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}
