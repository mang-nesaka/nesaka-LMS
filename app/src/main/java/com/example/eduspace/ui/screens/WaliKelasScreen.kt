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
fun WaliKelasScreen(
    repository: LmsRepository
) {
    val currentUser by repository.currentUser.collectAsState()
    val attendanceRecords by repository.attendanceRecords.collectAsState()

    var selectedPeriod by remember { mutableStateOf("Harian") }
    val periods = listOf("Harian", "Mingguan", "Bulanan", "Semester")

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("walikelas_screen"),
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
                    Surface(shape = RoundedCornerShape(50), color = PureWhite.copy(alpha = 0.2f)) {
                        Text(
                            text = "Wali Kelas: ${currentUser.waliKelasOf ?: "X RPL 1"}",
                            color = PureWhite,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Rekapitulasi Presensi Kehadiran Siswa", color = PureWhite, fontWeight = FontWeight.Black, fontSize = 16.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "Pantau tingkat kehadiran, izin sakit, dan keterlambatan peserta didik binaan Anda secara terperinci.",
                        color = IndigoLight,
                        fontSize = 12.sp
                    )
                }
            }
        }

        // Period filter chips
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                periods.forEach { p ->
                    FilterChip(
                        selected = selectedPeriod == p,
                        onClick = { selectedPeriod = p },
                        label = { Text(p, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = IndigoPrimary,
                            selectedLabelColor = PureWhite
                        )
                    )
                }
            }
        }

        // Summary Metric Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                MetricBox("Hadir", "34", Icons.Default.CheckCircle, EmeraldSuccess, Modifier.weight(1f))
                MetricBox("Terlambat", "2", Icons.Default.Warning, AmberWarning, Modifier.weight(1f))
                MetricBox("Izin / Sakit", "0", Icons.Default.Info, IndigoPrimary, Modifier.weight(1f))
                MetricBox("Alpa", "0", Icons.Default.Cancel, RoseError, Modifier.weight(1f))
            }
        }

        item {
            Text("Daftar Hadir Siswa (${currentUser.waliKelasOf ?: "X RPL 1"})", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate800)
        }

        items(attendanceRecords) { rec ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Slate200, Slate200)))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(rec.studentName, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900)
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            "Masuk: ${rec.checkInTime ?: "-"} • Pulang: ${rec.checkOutTime ?: "-"}",
                            fontSize = 12.sp,
                            color = Slate600
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(50),
                        color = if (rec.isLate) RoseLight else EmeraldLight
                    ) {
                        Text(
                            text = if (rec.isLate) "Terlambat ${rec.lateMinutes}m" else "Hadir Tepat Waktu",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (rec.isLate) RoseError else EmeraldSuccess,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }
                }
            }
        }
    }
}
