package com.example.nesaka.ui.screens

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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nesaka.data.LmsRepository
import com.example.nesaka.model.StudentDocument
import com.example.nesaka.model.UserRole
import com.example.nesaka.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DocumentsScreen(
    repository: LmsRepository
) {
    val currentUser by repository.currentUser.collectAsState()
    val allDocs by repository.studentDocuments.collectAsState()

    val isStudent = currentUser.role == UserRole.STUDENT
    val myDocs = allDocs.filter { it.studentId == currentUser.id }

    var selectedDocToVerify by remember { mutableStateOf<StudentDocument?>(null) }
    var feedbackInput by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("documents_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = IndigoPrimary)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = PureWhite, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            if (isStudent) "Upload Dokumen Siswa Baru" else "Verifikasi Berkas Dokumen (TU)",
                            color = PureWhite,
                            fontWeight = FontWeight.Black,
                            fontSize = 16.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "Kelola dokumen autentik persyaratan pendaftaran: Akte Kelahiran, Kartu Keluarga (KK), dan Ijazah SMP.",
                        color = IndigoLight,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        if (isStudent) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilledTonalButton(
                        onClick = { repository.uploadStudentDocument("AKTE", "Akte_Kelahiran_${currentUser.name.replace(" ", "_")}.pdf", "1.6 MB") },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.filledTonalButtonColors(containerColor = IndigoLight, contentColor = IndigoPrimary)
                    ) {
                        Text("+ Akte", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    FilledTonalButton(
                        onClick = { repository.uploadStudentDocument("KK", "Kartu_Keluarga_${currentUser.name.replace(" ", "_")}.pdf", "2.0 MB") },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.filledTonalButtonColors(containerColor = IndigoLight, contentColor = IndigoPrimary)
                    ) {
                        Text("+ KK", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    FilledTonalButton(
                        onClick = { repository.uploadStudentDocument("IJAZAH", "Ijazah_SMP_${currentUser.name.replace(" ", "_")}.pdf", "2.8 MB") },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.filledTonalButtonColors(containerColor = IndigoLight, contentColor = IndigoPrimary)
                    ) {
                        Text("+ Ijazah", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            items(myDocs) { doc ->
                DocumentCard(
                    doc = doc,
                    showVerificationActions = false,
                    onVerifyClick = {}
                )
            }
        } else {
            item {
                Text("Daftar Dokumen Siswa Menunggu Verifikasi", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate800)
            }

            items(allDocs) { doc ->
                DocumentCard(
                    doc = doc,
                    showVerificationActions = true,
                    onVerifyClick = {
                        selectedDocToVerify = doc
                        feedbackInput = doc.feedback ?: ""
                    }
                )
            }
        }
    }

    selectedDocToVerify?.let { doc ->
        AlertDialog(
            onDismissRequest = { selectedDocToVerify = null },
            title = { Text("Verifikasi Berkas: ${doc.fileName}", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Siswa: ${doc.studentName} (${doc.docType})", fontSize = 13.sp, color = Slate700, fontWeight = FontWeight.SemiBold)
                    Text("Ukuran File: ${doc.fileSize} • Tanggal Upload: ${doc.createdAt}", fontSize = 12.sp, color = Slate500)
                    Spacer(modifier = Modifier.height(4.dp))
                    OutlinedTextField(
                        value = feedbackInput,
                        onValueChange = { feedbackInput = it },
                        label = { Text("Catatan Verifikasi / Alasan Penolakan") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        repository.updateDocumentStatus(doc.id, "VERIFIED", feedbackInput.ifBlank { "Dokumen valid dan sesuai." })
                        selectedDocToVerify = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess)
                ) {
                    Text("Setujui (Valid)")
                }
            },
            dismissButton = {
                Button(
                    onClick = {
                        repository.updateDocumentStatus(doc.id, "REJECTED", feedbackInput.ifBlank { "Dokumen buram atau tidak sesuai." })
                        selectedDocToVerify = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = RoseError)
                ) {
                    Text("Tolak Berkas")
                }
            }
        )
    }
}

@Composable
fun DocumentCard(
    doc: StudentDocument,
    showVerificationActions: Boolean,
    onVerifyClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
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
                    color = when (doc.docType) {
                        "AKTE" -> IndigoLight
                        "KK" -> PurpleLight
                        else -> AmberLight
                    }
                ) {
                    Text(
                        text = doc.docType,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = when (doc.docType) {
                            "AKTE" -> IndigoPrimary
                            "KK" -> PurpleAccent
                            else -> AmberWarning
                        },
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(50),
                    color = when (doc.status) {
                        "VERIFIED" -> EmeraldLight
                        "REJECTED" -> RoseLight
                        else -> Slate100
                    }
                ) {
                    Text(
                        text = when (doc.status) {
                            "VERIFIED" -> "✓ Terverifikasi"
                            "REJECTED" -> "✕ Ditolak"
                            else -> "⏳ Menunggu Verifikasi"
                        },
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = when (doc.status) {
                            "VERIFIED" -> EmeraldSuccess
                            "REJECTED" -> RoseError
                            else -> Slate600
                        },
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text(doc.fileName, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900)
            Text("Siswa: ${doc.studentName} • ${doc.fileSize} • ${doc.createdAt}", fontSize = 11.sp, color = Slate500)

            doc.feedback?.let { fb ->
                Spacer(modifier = Modifier.height(6.dp))
                Text("Umpan Balik TU: $fb", fontSize = 12.sp, color = if (doc.status == "REJECTED") RoseError else Slate700, fontWeight = FontWeight.Medium)
            }

            if (showVerificationActions) {
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = onVerifyClick,
                    colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Rule, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Tinjau & Verifikasi Berkas", fontSize = 12.sp)
                }
            }
        }
    }
}
