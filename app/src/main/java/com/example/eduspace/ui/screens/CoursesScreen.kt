package com.example.eduspace.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.eduspace.data.LmsRepository
import com.example.eduspace.model.UserRole
import com.example.eduspace.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CoursesScreen(
    repository: LmsRepository
) {
    val currentUser by repository.currentUser.collectAsState()
    val courses by repository.courses.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var showJoinDialog by remember { mutableStateOf(false) }
    var showCreateDialog by remember { mutableStateOf(false) }
    var joinCodeInput by remember { mutableStateOf("") }
    var joinMessage by remember { mutableStateOf<String?>(null) }

    var newTitle by remember { mutableStateOf("") }
    var newDescription by remember { mutableStateOf("") }
    var newCode by remember { mutableStateOf("") }

    val filteredCourses = courses.filter {
        it.title.contains(searchQuery, ignoreCase = true) ||
        it.teacherName.contains(searchQuery, ignoreCase = true) ||
        it.description.contains(searchQuery, ignoreCase = true)
    }

    val canCreate = currentUser.role == UserRole.TEACHER || currentUser.role == UserRole.ADMIN

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("courses_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Kelas Pembelajaran", fontWeight = FontWeight.Black, fontSize = 20.sp, color = Slate900)
                    Text("Daftar kelas aktif & modul belajar", fontSize = 12.sp, color = Slate500)
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilledTonalButton(
                        onClick = { showJoinDialog = true },
                        colors = ButtonDefaults.filledTonalButtonColors(containerColor = IndigoLight, contentColor = IndigoPrimary),
                        modifier = Modifier.testTag("join_course_button")
                    ) {
                        Icon(Icons.Default.GroupAdd, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Gabung", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    if (canCreate) {
                        Button(
                            onClick = { showCreateDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                            modifier = Modifier.testTag("create_course_button")
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Buat", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Search Bar
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Cari judul kelas atau nama guru...", fontSize = 13.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Slate400) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Close, contentDescription = null, tint = Slate400)
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("courses_search_field"),
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = IndigoPrimary,
                    unfocusedBorderColor = Slate200,
                    focusedContainerColor = PureWhite,
                    unfocusedContainerColor = PureWhite
                ),
                singleLine = true
            )
        }

        // Courses List
        if (filteredCourses.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.School, contentDescription = null, modifier = Modifier.size(48.dp), tint = Slate300)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Tidak ada kelas yang sesuai", color = Slate500, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        } else {
            items(filteredCourses) { course ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Slate200, Slate200)))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(IndigoLight),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.MenuBook, contentDescription = null, tint = IndigoPrimary, modifier = Modifier.size(24.dp))
                            }
                            Surface(
                                shape = RoundedCornerShape(50),
                                color = Slate100
                            ) {
                                Text(
                                    text = "KODE: ${course.inviteCode}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = IndigoPrimary,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = course.title,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = Slate900
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = course.description,
                            fontSize = 12.sp,
                            color = Slate600,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(12.dp))
                        HorizontalDivider(color = Slate100)
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Person, contentDescription = null, tint = Slate400, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(course.teacherName, fontSize = 12.sp, color = Slate700, fontWeight = FontWeight.Medium)
                            }

                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                Text("👥 ${course.enrollmentsCount} Siswa", fontSize = 11.sp, color = IndigoPrimary, fontWeight = FontWeight.Bold)
                                Text("📚 ${course.lessonsCount} Materi", fontSize = 11.sp, color = Slate500)
                            }
                        }
                    }
                }
            }
        }
    }

    // Join Course Dialog
    if (showJoinDialog) {
        AlertDialog(
            onDismissRequest = {
                showJoinDialog = false
                joinMessage = null
            },
            title = { Text("Gabung ke Kelas Pembelajaran", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Masukkan kode undangan kelas yang diberikan oleh guru mata pelajaran:", fontSize = 13.sp, color = Slate600)
                    OutlinedTextField(
                        value = joinCodeInput,
                        onValueChange = { joinCodeInput = it.uppercase() },
                        placeholder = { Text("Contoh: RPL1-WEB") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    joinMessage?.let {
                        Text(it, fontSize = 12.sp, color = if (it.contains("berhasil")) EmeraldSuccess else RoseError)
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val success = repository.joinCourse(joinCodeInput)
                        if (success) {
                            joinMessage = "Selamat, berhasil bergabung dengan kelas!"
                            joinCodeInput = ""
                        } else {
                            joinMessage = "Kode undangan kelas tidak ditemukan."
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary)
                ) {
                    Text("Gabung Kelas")
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    showJoinDialog = false
                    joinMessage = null
                }) {
                    Text("Tutup")
                }
            }
        )
    }

    // Create Course Dialog (Teachers/Admin)
    if (showCreateDialog) {
        AlertDialog(
            onDismissRequest = { showCreateDialog = false },
            title = { Text("Buat Kelas Pembelajaran Baru", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = newTitle,
                        onValueChange = { newTitle = it },
                        label = { Text("Nama Mata Pelajaran / Kelas") },
                        placeholder = { Text("Contoh: Pemrograman Mobile (XI RPL)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newDescription,
                        onValueChange = { newDescription = it },
                        label = { Text("Deskripsi Pembelajaran") },
                        placeholder = { Text("Ringkasan kompetensi dasar yang diajarkan") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )
                    OutlinedTextField(
                        value = newCode,
                        onValueChange = { newCode = it.uppercase() },
                        label = { Text("Kode Undangan (Opsional)") },
                        placeholder = { Text("Otomatis jika dikosongkan") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newTitle.isNotBlank()) {
                            repository.createCourse(newTitle, newDescription, newCode)
                            newTitle = ""
                            newDescription = ""
                            newCode = ""
                            showCreateDialog = false
                        }
                    },
                    enabled = newTitle.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary)
                ) {
                    Text("Simpan Kelas")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCreateDialog = false }) {
                    Text("Batal")
                }
            }
        )
    }
}
