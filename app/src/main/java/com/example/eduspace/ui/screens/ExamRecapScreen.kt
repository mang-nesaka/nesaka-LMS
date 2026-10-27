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
fun ExamRecapScreen(
    repository: LmsRepository,
    onBack: () -> Unit
) {
    val results by repository.examResults.collectAsState()

    val totalSubmissions = results.size
    val avgScore = if (totalSubmissions > 0) results.sumOf { it.score } / totalSubmissions else 0
    val totalViolations = results.sumOf { it.violationsCount }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("exam_recap_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Kembali")
                }
                Spacer(modifier = Modifier.width(6.dp))
                Column {
                    Text("Rekapitulasi Nilai Ujian CBT", fontWeight = FontWeight.Black, fontSize = 18.sp, color = Slate900)
                    Text("Monitoring hasil & rekam jejak anti-kecurangan", fontSize = 12.sp, color = Slate500)
                }
            }
        }

        // Summary Statistics Cards
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                MetricBox(
                    title = "Total Ujian",
                    value = "$totalSubmissions Kali",
                    icon = Icons.Default.Assessment,
                    color = IndigoPrimary,
                    modifier = Modifier.weight(1f)
                )
                MetricBox(
                    title = "Rata-Rata",
                    value = "$avgScore / 100",
                    icon = Icons.Default.Star,
                    color = EmeraldSuccess,
                    modifier = Modifier.weight(1f)
                )
                MetricBox(
                    title = "Pelanggaran",
                    value = "$totalViolations x",
                    icon = Icons.Default.Warning,
                    color = AmberWarning,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        items(results) { res ->
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
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(res.studentName, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate900)
                            Text("Kelas: ${res.studentClass} • ${res.courseTitle}", fontSize = 12.sp, color = Slate500)
                        }

                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (res.score >= 75) EmeraldLight else RoseLight
                        ) {
                            Text(
                                text = "${res.score}",
                                fontWeight = FontWeight.Black,
                                fontSize = 18.sp,
                                color = if (res.score >= 75) EmeraldSuccess else RoseError,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Text(res.examTitle, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = Slate800)

                    Spacer(modifier = Modifier.height(10.dp))
                    HorizontalDivider(color = Slate100)
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Benar: ${res.totalCorrect} / ${res.totalQuestions}", fontSize = 12.sp, color = Slate600)
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = if (res.violationsCount > 0) RoseLight else EmeraldLight
                        ) {
                            Text(
                                text = if (res.violationsCount > 0) "${res.violationsCount}x Keluar Tab" else "Bersih",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (res.violationsCount > 0) RoseError else EmeraldSuccess,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                        Text(res.submittedAt, fontSize = 11.sp, color = Slate400)
                    }
                }
            }
        }
    }
}
