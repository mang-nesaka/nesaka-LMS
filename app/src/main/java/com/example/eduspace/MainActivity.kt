package com.example.eduspace

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.eduspace.data.LmsRepository
import com.example.eduspace.model.UserRole
import com.example.eduspace.ui.navigation.Screen
import com.example.eduspace.ui.screens.*
import com.example.eduspace.ui.theme.*

class MainActivity : ComponentActivity() {
    private val repository = LmsRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            EduSpaceTheme {
                MainAppScaffold(repository = repository)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold(repository: LmsRepository) {
    val currentUser by repository.currentUser.collectAsState()
    var currentScreen by remember { mutableStateOf<Screen>(Screen.Dashboard) }
    var showMoreMenuSheet by remember { mutableStateOf(false) }
    var showRolePicker by remember { mutableStateOf(false) }

    // Intercept back press to return to Dashboard if on a subscreen
    BackHandler(enabled = currentScreen != Screen.Dashboard) {
        currentScreen = Screen.Dashboard
    }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .testTag("main_scaffold"),
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(IndigoPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.School, contentDescription = null, tint = PureWhite, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "EduSpace LMS",
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp,
                                color = Slate900
                            )
                            Text(
                                text = "SMK Negeri 1",
                                fontSize = 11.sp,
                                color = Slate500,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                },
                actions = {
                    // Current User Role Chip & Switcher
                    Surface(
                        shape = RoundedCornerShape(50),
                        color = IndigoLight,
                        modifier = Modifier
                            .clickable { showRolePicker = true }
                            .padding(end = 8.dp)
                            .testTag("top_role_switcher")
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(18.dp)
                                    .clip(CircleShape)
                                    .background(Color(currentUser.role.badgeColor)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(currentUser.name.take(1), color = PureWhite, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = currentUser.role.label,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = IndigoDark
                            )
                            Spacer(modifier = Modifier.width(2.dp))
                            Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = IndigoDark, modifier = Modifier.size(16.dp))
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PureWhite,
                    titleContentColor = Slate900
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = PureWhite,
                tonalElevation = 8.dp,
                modifier = Modifier.navigationBarsPadding()
            ) {
                val isMoreSelected = currentScreen !in listOf(
                    Screen.Dashboard, Screen.Courses, Screen.Assignments, Screen.CbtExams
                )

                NavigationBarItem(
                    selected = currentScreen == Screen.Dashboard,
                    onClick = { currentScreen = Screen.Dashboard },
                    icon = { Icon(if (currentScreen == Screen.Dashboard) Icons.Default.Dashboard else Icons.Outlined.Dashboard, contentDescription = "Beranda") },
                    label = { Text("Beranda", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = IndigoPrimary,
                        selectedTextColor = IndigoPrimary,
                        indicatorColor = IndigoLight
                    )
                )

                NavigationBarItem(
                    selected = currentScreen == Screen.Courses,
                    onClick = { currentScreen = Screen.Courses },
                    icon = { Icon(if (currentScreen == Screen.Courses) Icons.Default.Book else Icons.Outlined.Book, contentDescription = "Kelas") },
                    label = { Text("Kelas", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = IndigoPrimary,
                        selectedTextColor = IndigoPrimary,
                        indicatorColor = IndigoLight
                    )
                )

                NavigationBarItem(
                    selected = currentScreen == Screen.Assignments,
                    onClick = { currentScreen = Screen.Assignments },
                    icon = { Icon(if (currentScreen == Screen.Assignments) Icons.Default.Assignment else Icons.Outlined.Assignment, contentDescription = "Tugas") },
                    label = { Text("Tugas", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = IndigoPrimary,
                        selectedTextColor = IndigoPrimary,
                        indicatorColor = IndigoLight
                    )
                )

                NavigationBarItem(
                    selected = currentScreen == Screen.CbtExams,
                    onClick = { currentScreen = Screen.CbtExams },
                    icon = { Icon(if (currentScreen == Screen.CbtExams) Icons.Default.Computer else Icons.Outlined.Computer, contentDescription = "CBT") },
                    label = { Text("Ujian CBT", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = IndigoPrimary,
                        selectedTextColor = IndigoPrimary,
                        indicatorColor = IndigoLight
                    )
                )

                NavigationBarItem(
                    selected = isMoreSelected,
                    onClick = { showMoreMenuSheet = true },
                    icon = { Icon(Icons.Default.Menu, contentDescription = "Lainnya") },
                    label = { Text("Menu Lain", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = IndigoPrimary,
                        selectedTextColor = IndigoPrimary,
                        indicatorColor = IndigoLight
                    )
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Slate50)
        ) {
            when (currentScreen) {
                is Screen.Dashboard -> DashboardScreen(
                    repository = repository,
                    onNavigate = { screen -> currentScreen = screen }
                )
                is Screen.Courses -> CoursesScreen(repository = repository)
                is Screen.Assignments -> AssignmentsScreen(repository = repository)
                is Screen.CbtExams -> CbtExamScreen(
                    repository = repository,
                    onNavigateToRecap = { currentScreen = Screen.ExamRecap }
                )
                is Screen.ExamRecap -> ExamRecapScreen(
                    repository = repository,
                    onBack = { currentScreen = Screen.CbtExams }
                )
                is Screen.Attendance -> AttendanceScreen(repository = repository)
                is Screen.TeacherAgenda -> TeacherAgendaScreen(repository = repository)
                is Screen.Monitoring -> MonitoringScreen(repository = repository)
                is Screen.Dapodik -> DapodikScreen(repository = repository)
                is Screen.Documents -> DocumentsScreen(repository = repository)
                is Screen.DigitalCard -> DigitalCardScreen(repository = repository)
                is Screen.WaliKelas -> WaliKelasScreen(repository = repository)
                is Screen.BeritaAcara -> BeritaAcaraScreen(repository = repository)
                is Screen.Settings -> SettingsScreen(repository = repository)
                else -> DashboardScreen(repository = repository, onNavigate = { currentScreen = it })
            }
        }
    }

    // Role Switcher Modal
    if (showRolePicker) {
        AlertDialog(
            onDismissRequest = { showRolePicker = false },
            title = { Text("Ganti Peran Pengguna", fontWeight = FontWeight.Bold) },
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
                                    showRolePicker = false
                                },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isSelected) IndigoLight else PureWhite
                            ),
                            border = if (isSelected) CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(IndigoPrimary, IndigoPrimary))) else null
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(34.dp)
                                        .clip(CircleShape)
                                        .background(Color(user.role.badgeColor)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(user.name.take(1), color = PureWhite, fontWeight = FontWeight.Bold)
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(user.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Slate900)
                                    Text("${user.role.label} • ${user.email}", fontSize = 11.sp, color = Slate500)
                                }
                                if (isSelected) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = IndigoPrimary)
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showRolePicker = false }) {
                    Text("Tutup", color = IndigoPrimary)
                }
            }
        )
    }

    // Bottom Sheet for Extra Modules
    if (showMoreMenuSheet) {
        ModalBottomSheet(
            onDismissRequest = { showMoreMenuSheet = false },
            containerColor = PureWhite
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 10.dp)
                    .navigationBarsPadding(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("Semua Modul LMS EduSpace", fontWeight = FontWeight.Black, fontSize = 16.sp, color = Slate900)
                Text("Pilih fitur yang ingin Anda buka:", fontSize = 12.sp, color = Slate500)
                Spacer(modifier = Modifier.height(4.dp))

                val menuItems = listOf(
                    Triple(Screen.Attendance, "Presensi Kehadiran Siswa (GPS & Wajah)", Icons.Default.LocationOn),
                    Triple(Screen.TeacherAgenda, "Scan Barcode & Agenda Mengajar Guru", Icons.Default.QrCodeScanner),
                    Triple(Screen.Monitoring, "Monitoring Guru Mengajar Real-Time", Icons.Default.LiveTv),
                    Triple(Screen.Dapodik, "Formulir Dapodik Siswa Baru (F-PD)", Icons.Default.Feed),
                    Triple(Screen.Documents, "Verifikasi Dokumen Siswa (TU)", Icons.Default.VerifiedUser),
                    Triple(Screen.DigitalCard, "Kartu Pelajar Digital", Icons.Default.Badge),
                    Triple(Screen.WaliKelas, "Rekap Presensi Wali Kelas", Icons.Default.People),
                    Triple(Screen.BeritaAcara, "Berita Acara Kegiatan Waka", Icons.Default.Article),
                    Triple(Screen.Settings, "Pengaturan GPS & Presensi Sekolah", Icons.Default.Settings)
                )

                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(menuItems) { (screen, title, icon) ->
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (currentScreen == screen) IndigoLight else Slate50,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    currentScreen = screen
                                    showMoreMenuSheet = false
                                }
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(icon, contentDescription = null, tint = IndigoPrimary, modifier = Modifier.size(22.dp))
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = title,
                                    fontSize = 13.sp,
                                    fontWeight = if (currentScreen == screen) FontWeight.Bold else FontWeight.Medium,
                                    color = if (currentScreen == screen) IndigoPrimary else Slate800
                                )
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
            }
        }
    }
}
