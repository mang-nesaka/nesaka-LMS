package com.example.eduspace.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import com.example.eduspace.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeacherAgendaScreen(
    repository: LmsRepository
) {
    val currentUser by repository.currentUser.collectAsState()
    val classrooms by repository.classrooms.collectAsState()
    val teachingAgendas by repository.teachingAgendas.collectAsState()

    var selectedBarcodeCode by remember { mutableStateOf(classrooms.firstOrNull()?.code ?: "NESAKA-X-RPL-1") }
    var teachingMaterial by remember { mutableStateOf("") }
    var classNotes by remember { mutableStateOf("") }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    var isSuccess by remember { mutableStateOf(true) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("teacher_agenda_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = EmeraldSuccess)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = PureWhite, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Scan Barcode Kelas & Agenda Guru", color = PureWhite, fontWeight = FontWeight.Black, fontSize = 16.sp)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "Pindai Barcode / QR Code di pintu ruang kelas saat masuk. Sistem secara otomatis mencatat waktu kedatangan, mencocokkan jadwal mengajar, dan mendeteksi keterlambatan.",
                        color = EmeraldLight,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        // Barcode / Class Selector Box
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Slate200, Slate200)))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("1. Pilih / Pindai Barcode Ruang Kelas:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Slate800)
                    Spacer(modifier = Modifier.height(8.dp))

                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(classrooms) { cls ->
                            val isSelected = cls.code == selectedBarcodeCode
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) IndigoLight else Slate50)
                                    .border(if (isSelected) 2.dp else 1.dp, if (isSelected) IndigoPrimary else Slate200, RoundedCornerShape(10.dp))
                                    .clickable { selectedBarcodeCode = cls.code }
                                    .padding(horizontal = 12.dp, vertical = 8.dp)
                            ) {
                                Column {
                                    Text(cls.name, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = if (isSelected) IndigoPrimary else Slate800)
                                    Text(cls.code, fontSize = 10.sp, color = Slate500)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Text("2. Materi Pokok yang Diajarkan:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Slate800)
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = teachingMaterial,
                        onValueChange = { teachingMaterial = it },
                        placeholder = { Text("Contoh: Implementasi Jetpack Compose StateFlow...") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = EmeraldSuccess)
                    )

                    Spacer(modifier = Modifier.height(10.dp))
                    Text("3. Catatan Kelas / Ketidakhadiran Siswa (Opsional):", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Slate800)
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = classNotes,
                        onValueChange = { classNotes = it },
                        placeholder = { Text("Contoh: Seluruh 36 siswa hadir, lab berjalan tertib...") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 2,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = EmeraldSuccess)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    statusMessage?.let { msg ->
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isSuccess) EmeraldLight else RoseLight,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = msg,
                                color = if (isSuccess) EmeraldSuccess else RoseError,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                    }

                    Button(
                        onClick = {
                            if (teachingMaterial.isNotBlank()) {
                                val (ok, msg) = repository.recordTeachingAgenda(selectedBarcodeCode, teachingMaterial, classNotes)
                                isSuccess = ok
                                statusMessage = msg
                                if (ok) {
                                    teachingMaterial = ""
                                    classNotes = ""
                                }
                            }
                        },
                        enabled = teachingMaterial.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("submit_agenda_button")
                    ) {
                        Icon(Icons.Default.QrCode, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Verifikasi Barcode & Simpan Agenda", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // List of Agendas Today
        item {
            Text("Agenda Mengajar Hari Ini", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate800)
        }

        items(teachingAgendas) { item ->
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
                        Text(item.classroomName, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900)
                        Surface(
                            shape = RoundedCornerShape(50),
                            color = if (item.isLate) RoseLight else EmeraldLight
                        ) {
                            Text(
                                text = if (item.isLate) "Terlambat ${item.lateMinutes}m" else "✓ Tepat Waktu",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (item.isLate) RoseError else EmeraldSuccess,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text("${item.teacherName} • ${item.subject}", fontSize = 12.sp, color = IndigoPrimary, fontWeight = FontWeight.SemiBold)
                    Text("Jadwal: ${item.scheduledStartTime} - ${item.scheduledEndTime} WIB • Scan: ${item.scanTime}", fontSize = 11.sp, color = Slate500)

                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Slate50,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("Materi yang Diajarkan:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)
                            Text(item.teachingMaterial, fontSize = 12.sp, color = Slate900)
                            if (item.notes.isNotBlank()) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Catatan: ${item.notes}", fontSize = 11.sp, color = Slate500)
                            }
                        }
                    }
                }
            }
        }
    }
}
