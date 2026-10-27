package com.example.nesaka.ui.screens

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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nesaka.data.LmsRepository
import com.example.nesaka.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BeritaAcaraScreen(
    repository: LmsRepository
) {
    val reports by repository.activityReports.collectAsState()

    var selectedCategory by remember { mutableStateOf("Semua") }
    val categories = listOf("Semua", "Kurikulum", "Sarana Prasarana", "Kesiswaan", "Hubin")

    var showCreateDialog by remember { mutableStateOf(false) }
    var titleInput by remember { mutableStateOf("") }
    var categoryInput by remember { mutableStateOf("Kurikulum") }
    var contentInput by remember { mutableStateOf("") }
    var attendeesInput by remember { mutableStateOf("30") }
    var docNoteInput by remember { mutableStateOf("") }

    val filteredReports = if (selectedCategory == "Semua") reports else reports.filter {
        it.category.contains(selectedCategory, ignoreCase = true)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("berita_acara_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = AmberWarning)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Article, contentDescription = null, tint = PureWhite, modifier = Modifier.size(24.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Berita Acara Kegiatan (Waka)", color = PureWhite, fontWeight = FontWeight.Black, fontSize = 16.sp)
                        }

                        Button(
                            onClick = { showCreateDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = PureWhite, contentColor = AmberWarning),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Buat Notula", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "Dokumentasi resmi berita acara, notulensi rapat, dan tindak lanjut kegiatan pimpinan sekolah (Waka Kurikulum, Sarpras, Kesiswaan, dan Hubin).",
                        color = PureWhite.copy(alpha = 0.9f),
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        // Category Filter
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(categories) { cat ->
                    FilterChip(
                        selected = selectedCategory == cat,
                        onClick = { selectedCategory = cat },
                        label = { Text(cat, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = AmberWarning,
                            selectedLabelColor = PureWhite
                        )
                    )
                }
            }
        }

        items(filteredReports) { report ->
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
                        Surface(shape = RoundedCornerShape(50), color = AmberLight) {
                            Text(
                                report.category,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = AmberWarning,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp)
                            )
                        }
                        Text(report.date, fontSize = 11.sp, color = Slate400)
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(report.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate900)
                    Text("Oleh: ${report.authorName} • Peserta: ${report.attendeesCount} orang", fontSize = 12.sp, color = IndigoPrimary, fontWeight = FontWeight.Medium)

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(report.content, fontSize = 13.sp, color = Slate700, lineHeight = 18.sp)

                    if (report.documentationNote.isNotBlank()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Slate50,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                "📌 Catatan Notula: ${report.documentationNote}",
                                fontSize = 11.sp,
                                color = Slate600,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }
                }
            }
        }
    }

    // Create Report Dialog
    if (showCreateDialog) {
        AlertDialog(
            onDismissRequest = { showCreateDialog = false },
            title = { Text("Buat Berita Acara Baru", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = titleInput,
                        onValueChange = { titleInput = it },
                        label = { Text("Judul Kegiatan / Notulensi Rapat") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = categoryInput,
                        onValueChange = { categoryInput = it },
                        label = { Text("Kategori (Kurikulum / Sarpras / Kesiswaan)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = attendeesInput,
                        onValueChange = { attendeesInput = it },
                        label = { Text("Jumlah Hadir / Peserta") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = contentInput,
                        onValueChange = { contentInput = it },
                        label = { Text("Ringkasan Isi Kegiatan") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 4
                    )
                    OutlinedTextField(
                        value = docNoteInput,
                        onValueChange = { docNoteInput = it },
                        label = { Text("Tindak Lanjut / Kesepakatan") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 2
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (titleInput.isNotBlank() && contentInput.isNotBlank()) {
                            repository.addActivityReport(
                                titleInput,
                                categoryInput,
                                contentInput,
                                attendeesInput.toIntOrNull() ?: 0,
                                docNoteInput
                            )
                            titleInput = ""
                            contentInput = ""
                            docNoteInput = ""
                            showCreateDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AmberWarning)
                ) {
                    Text("Simpan Berita Acara")
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
