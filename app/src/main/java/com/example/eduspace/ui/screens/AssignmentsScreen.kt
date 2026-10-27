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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.eduspace.data.LmsRepository
import com.example.eduspace.model.Assignment
import com.example.eduspace.model.UserRole
import com.example.eduspace.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AssignmentsScreen(
    repository: LmsRepository
) {
    val currentUser by repository.currentUser.collectAsState()
    val assignments by repository.assignments.collectAsState()

    var selectedAssignmentForSubmit by remember { mutableStateOf<Assignment?>(null) }
    var submissionContent by remember { mutableStateOf("") }
    var showSuccessSnackbar by remember { mutableStateOf(false) }

    val isStudent = currentUser.role == UserRole.STUDENT

    Scaffold(
        snackbarHost = {
            if (showSuccessSnackbar) {
                Snackbar(
                    modifier = Modifier.padding(16.dp),
                    action = {
                        TextButton(onClick = { showSuccessSnackbar = false }) {
                            Text("OK", color = PureWhite)
                        }
                    }
                ) {
                    Text("Tugas harian Anda berhasil dikumpulkan!")
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .testTag("assignments_screen"),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Column {
                    Text("Tugas Harian Siswa", fontWeight = FontWeight.Black, fontSize = 20.sp, color = Slate900)
                    Text("Kelola dan pantau tugas pembelajaran aktif", fontSize = 12.sp, color = Slate500)
                }
            }

            if (assignments.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Belum ada tugas yang diberikan.", color = Slate400, fontSize = 14.sp)
                    }
                }
            } else {
                items(assignments) { assignment ->
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
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(50),
                                    color = IndigoLight
                                ) {
                                    Text(
                                        text = assignment.courseTitle,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = IndigoPrimary,
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                    )
                                }

                                assignment.dueDate?.let {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Schedule, contentDescription = null, tint = AmberWarning, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(it, fontSize = 11.sp, color = AmberWarning, fontWeight = FontWeight.SemiBold)
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = assignment.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = Slate900
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = assignment.description,
                                fontSize = 13.sp,
                                color = Slate600
                            )

                            Spacer(modifier = Modifier.height(10.dp))
                            Text("Diberikan oleh: ${assignment.teacherName}", fontSize = 11.sp, color = Slate400)

                            // Submission Status for Student
                            if (isStudent) {
                                Spacer(modifier = Modifier.height(12.dp))
                                if (assignment.mySubmission != null) {
                                    val sub = assignment.mySubmission
                                    Surface(
                                        shape = RoundedCornerShape(12.dp),
                                        color = EmeraldLight,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Column(modifier = Modifier.padding(12.dp)) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(16.dp))
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text("Sudah Dikumpulkan (${sub.submittedAt})", color = EmeraldSuccess, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                            }
                                            sub.grade?.let { grade ->
                                                Spacer(modifier = Modifier.height(6.dp))
                                                Text("Nilai Tugas: $grade / 100", fontWeight = FontWeight.Black, color = IndigoPrimary, fontSize = 15.sp)
                                                sub.feedback?.let { fb ->
                                                    Text("Catatan Guru: $fb", color = Slate700, fontSize = 12.sp)
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    Button(
                                        onClick = {
                                            selectedAssignmentForSubmit = assignment
                                            submissionContent = ""
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                                        shape = RoundedCornerShape(12.dp),
                                        modifier = Modifier.fillMaxWidth().testTag("submit_assignment_button_${assignment.id}")
                                    ) {
                                        Icon(Icons.Default.UploadFile, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Kumpulkan Tugas")
                                    }
                                }
                            } else {
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("👥 ${assignment.submissionsCount} Siswa Telah Mengumpulkan", fontSize = 12.sp, color = IndigoPrimary, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }
        }
    }

    // Submit Assignment Dialog
    selectedAssignmentForSubmit?.let { assignment ->
        AlertDialog(
            onDismissRequest = { selectedAssignmentForSubmit = null },
            title = { Text("Kumpulkan Tugas: ${assignment.title}", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Tulis jawaban atau tautan dokumen tugas Anda di bawah ini:", fontSize = 13.sp, color = Slate600)
                    OutlinedTextField(
                        value = submissionContent,
                        onValueChange = { submissionContent = it },
                        placeholder = { Text("Ketik rangkuman jawaban tugas atau tautan Google Drive dokumen...") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp),
                        maxLines = 6
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (submissionContent.isNotBlank()) {
                            repository.submitAssignment(assignment.id, submissionContent)
                            selectedAssignmentForSubmit = null
                            showSuccessSnackbar = true
                        }
                    },
                    enabled = submissionContent.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary)
                ) {
                    Text("Serahkan Sekarang")
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedAssignmentForSubmit = null }) {
                    Text("Batal")
                }
            }
        )
    }
}
