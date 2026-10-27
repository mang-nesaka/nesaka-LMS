package com.example.eduspace.ui.screens

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
import com.example.eduspace.data.LmsRepository
import com.example.eduspace.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MonitoringScreen(
    repository: LmsRepository
) {
    val teachingAgendas by repository.teachingAgendas.collectAsState()

    val totalAgendas = teachingAgendas.size
    val onTimeCount = teachingAgendas.count { !it.isLate }
    val lateCount = teachingAgendas.count { it.isLate }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("monitoring_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LiveTv, contentDescription = null, tint = RoseError, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Monitoring Guru Mengajar Real-Time", color = PureWhite, fontWeight = FontWeight.Black, fontSize = 16.sp)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "Pengawasan langsung Kepala Sekolah & Waka Kurikulum terhadap aktivitas ruang kelas dan disiplin jam masuk guru.",
                        color = Slate400,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        // Summary Metric Cards
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                MetricBox(
                    title = "Guru Mengajar",
                    value = "$totalAgendas Kelas",
                    icon = Icons.Default.School,
                    color = IndigoPrimary,
                    modifier = Modifier.weight(1f)
                )
                MetricBox(
                    title = "Tepat Waktu",
                    value = "$onTimeCount Guru",
                    icon = Icons.Default.CheckCircle,
                    color = EmeraldSuccess,
                    modifier = Modifier.weight(1f)
                )
                MetricBox(
                    title = "Terlambat",
                    value = "$lateCount Guru",
                    icon = Icons.Default.Warning,
                    color = RoseError,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            Text("Aktivitas Pembelajaran di Kelas Saat Ini", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate800)
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
                        Text(item.teacherName, fontWeight = FontWeight.Black, fontSize = 15.sp, color = Slate900)
                        Surface(
                            shape = RoundedCornerShape(50),
                            color = if (item.isLate) RoseLight else EmeraldLight
                        ) {
                            Text(
                                text = if (item.isLate) "⚠️ TERLAMBAT ${item.lateMinutes} MENIT" else "✓ TEPAT WAKTU",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (item.isLate) RoseError else EmeraldSuccess,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text("${item.classroomName} • ${item.subject}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = IndigoPrimary)
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
