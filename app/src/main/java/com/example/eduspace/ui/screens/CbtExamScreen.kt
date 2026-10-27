package com.example.eduspace.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.eduspace.data.LmsRepository
import com.example.eduspace.model.Exam
import com.example.eduspace.model.ExamResult
import com.example.eduspace.model.UserRole
import com.example.eduspace.ui.navigation.Screen
import com.example.eduspace.ui.theme.*
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CbtExamScreen(
    repository: LmsRepository,
    onNavigateToRecap: () -> Unit
) {
    val currentUser by repository.currentUser.collectAsState()
    val exams by repository.exams.collectAsState()

    var activeExam by remember { mutableStateOf<Exam?>(null) }
    var currentQuestionIndex by remember { mutableStateOf(0) }
    val userAnswers = remember { mutableStateMapOf<Int, String>() }
    var violationsCount by remember { mutableStateOf(0) }
    var showViolationBanner by remember { mutableStateOf(false) }
    var showSubmitDialog by remember { mutableStateOf(false) }
    var lastResult by remember { mutableStateOf<ExamResult?>(null) }

    // Countdown Timer state
    var remainingSeconds by remember { mutableStateOf(45 * 60) }

    LaunchedEffect(activeExam) {
        if (activeExam != null) {
            remainingSeconds = (activeExam?.durationMinutes ?: 45) * 60
            while (remainingSeconds > 0 && activeExam != null) {
                delay(1000L)
                remainingSeconds--
            }
            if (remainingSeconds <= 0 && activeExam != null) {
                // Time up auto submit
                lastResult = repository.submitExamAnswers(activeExam!!.id, userAnswers.toMap(), violationsCount)
                activeExam = null
            }
        }
    }

    // ACTIVE CBT EXAM SCREEN (Anti-Cheat & Questions)
    if (activeExam != null) {
        val exam = activeExam!!
        val questions = exam.questions
        val currentQuestion = questions.getOrNull(currentQuestionIndex) ?: questions.first()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Slate50)
                .testTag("active_cbt_exam_screen")
        ) {
            // Anti-Cheat Security Top Bar
            Surface(
                color = Slate900,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Security, contentDescription = null, tint = AmberWarning, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Sistem Anti-Kecurangan CBT", color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }

                        // Countdown Timer Display
                        val minutes = remainingSeconds / 60
                        val seconds = remainingSeconds % 60
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (minutes < 5) RoseError else IndigoPrimary
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Timer, contentDescription = null, tint = PureWhite, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    String.format("%02d:%02d", minutes, seconds),
                                    color = PureWhite,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Pelanggaran Tab: $violationsCount / 2",
                            color = if (violationsCount > 0) RoseError else EmeraldSuccess,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )

                        // Button to simulate tab switch violation for demonstration
                        TextButton(
                            onClick = {
                                violationsCount++
                                showViolationBanner = true
                                if (violationsCount >= 2) {
                                    // Auto submit
                                    lastResult = repository.submitExamAnswers(exam.id, userAnswers.toMap(), violationsCount)
                                    activeExam = null
                                }
                            },
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Icon(Icons.Default.WarningAmber, contentDescription = null, tint = AmberWarning, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Simulasi Pindah Tab", color = AmberWarning, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Violation Warning Banner
            if (showViolationBanner) {
                Surface(
                    color = RoseLight,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = RoseError, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Peringatan! Deteksi perpindahan layar/tab terdeteksi. Jawaban otomatis dikirim jika mencapai 2x pelanggaran.",
                            color = RoseError,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = { showViolationBanner = false }, modifier = Modifier.size(24.dp)) {
                            Icon(Icons.Default.Close, contentDescription = null, tint = RoseError, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }

            // Question Palette Navigation
            Surface(
                color = PureWhite,
                shadowElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
                    Text("Nomor Soal (${userAnswers.size}/${questions.size} Terjawab):", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    Spacer(modifier = Modifier.height(8.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(questions.indices.toList()) { idx ->
                            val isCurrent = idx == currentQuestionIndex
                            val isAnswered = userAnswers.containsKey(idx + 1)
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(
                                        if (isCurrent) IndigoPrimary
                                        else if (isAnswered) EmeraldLight
                                        else Slate100
                                    )
                                    .border(
                                        width = if (isCurrent) 2.dp else 1.dp,
                                        color = if (isCurrent) IndigoDark else if (isAnswered) EmeraldSuccess else Slate200,
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .clickable { currentQuestionIndex = idx },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "${idx + 1}",
                                    color = if (isCurrent) PureWhite else if (isAnswered) EmeraldSuccess else Slate700,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }
                }
            }

            // Question Content & Options
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Slate200, Slate200)))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                "Soal No. ${currentQuestion.questionNumber}",
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp,
                                color = IndigoPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = currentQuestion.questionText,
                                fontSize = 15.sp,
                                lineHeight = 22.sp,
                                color = Slate900,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                // Options List
                val options = listOf(
                    "A" to currentQuestion.optionA,
                    "B" to currentQuestion.optionB,
                    "C" to currentQuestion.optionC,
                    "D" to currentQuestion.optionD,
                    "E" to (currentQuestion.optionE ?: "")
                ).filter { it.second.isNotBlank() }

                items(options) { (optKey, optText) ->
                    val isSelected = userAnswers[currentQuestion.questionNumber] == optKey
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { userAnswers[currentQuestion.questionNumber] = optKey },
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) IndigoLight else PureWhite
                        ),
                        border = CardDefaults.outlinedCardBorder().copy(
                            brush = Brush.linearGradient(
                                if (isSelected) listOf(IndigoPrimary, IndigoPrimary) else listOf(Slate200, Slate200)
                            )
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(if (isSelected) IndigoPrimary else Slate100),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = optKey,
                                    color = if (isSelected) PureWhite else Slate700,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = optText,
                                fontSize = 14.sp,
                                color = if (isSelected) IndigoDark else Slate800,
                                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }

            // Bottom Navigation Controls
            Surface(
                color = PureWhite,
                shadowElevation = 4.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = {
                            if (currentQuestionIndex > 0) currentQuestionIndex--
                        },
                        enabled = currentQuestionIndex > 0,
                        colors = ButtonDefaults.buttonColors(containerColor = Slate700),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Sebelumnya")
                    }

                    if (currentQuestionIndex < questions.size - 1) {
                        Button(
                            onClick = { currentQuestionIndex++ },
                            colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Berikutnya")
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                        }
                    } else {
                        Button(
                            onClick = { showSubmitDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Selesai & Kumpulkan")
                        }
                    }
                }
            }
        }

        // Submit Confirmation Modal
        if (showSubmitDialog) {
            AlertDialog(
                onDismissRequest = { showSubmitDialog = false },
                title = { Text("Konfirmasi Selesai Ujian CBT", fontWeight = FontWeight.Bold) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Anda telah menjawab ${userAnswers.size} dari ${questions.size} butir soal.", fontSize = 14.sp)
                        Text("Pastikan seluruh soal telah Anda periksa. Jawaban yang telah diserahkan tidak dapat diubah kembali.", fontSize = 12.sp, color = Slate500)
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            showSubmitDialog = false
                            lastResult = repository.submitExamAnswers(exam.id, userAnswers.toMap(), violationsCount)
                            activeExam = null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess)
                    ) {
                        Text("Ya, Kumpulkan Jawaban")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showSubmitDialog = false }) {
                        Text("Periksa Kembali")
                    }
                }
            )
        }

        return
    }

    // EXAM RESULT SCORE CARD VIEW
    if (lastResult != null) {
        val result = lastResult!!
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Slate200, Slate200)))
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(EmeraldLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(36.dp))
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                    Text("Ujian CBT Selesai!", fontWeight = FontWeight.Black, fontSize = 20.sp, color = Slate900)
                    Text(result.examTitle, fontSize = 13.sp, color = Slate500, textAlign = TextAlign.Center)

                    Spacer(modifier = Modifier.height(20.dp))
                    Surface(
                        shape = RoundedCornerShape(18.dp),
                        color = IndigoLight,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(18.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("NILAI AKHIR ANDA", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = IndigoDark)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                "${result.score}",
                                fontWeight = FontWeight.Black,
                                fontSize = 48.sp,
                                color = IndigoPrimary
                            )
                            Text("dari skala 100", fontSize = 11.sp, color = Slate500)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Jawaban Benar", fontSize = 11.sp, color = Slate400)
                            Text("${result.totalCorrect} / ${result.totalQuestions}", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate800)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Pelanggaran Tab", fontSize = 11.sp, color = Slate400)
                            Text(
                                "${result.violationsCount}x",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = if (result.violationsCount > 0) RoseError else EmeraldSuccess
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))
                    Button(
                        onClick = { lastResult = null },
                        colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Kembali ke Daftar Ujian")
                    }
                }
            }
        }
        return
    }

    // DEFAULT EXAMS LIST VIEW
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("cbt_exams_screen"),
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
                    Text("Ujian CBT (Computer Based Test)", fontWeight = FontWeight.Black, fontSize = 20.sp, color = Slate900)
                    Text("Evaluasi daring terintegrasi anti-kecurangan", fontSize = 12.sp, color = Slate500)
                }

                FilledTonalButton(
                    onClick = { onNavigateToRecap() },
                    colors = ButtonDefaults.filledTonalButtonColors(containerColor = IndigoLight, contentColor = IndigoPrimary)
                ) {
                    Icon(Icons.Default.Assessment, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Rekap Nilai", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Anti-Cheat Info Banner
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = AmberLight),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(AmberWarning, AmberWarning)))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Shield, contentDescription = null, tint = AmberWarning, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        "Sistem Pengawasan CBT Aktif: Dilarang beralih tab atau meminimalisir aplikasi. Dua kali pelanggaran akan otomatis mengumpulkan ujian.",
                        color = Slate800,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        items(exams) { exam ->
            val hasResult = exam.myResult != null
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
                        Surface(shape = RoundedCornerShape(50), color = IndigoLight) {
                            Text(
                                exam.courseTitle,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = IndigoPrimary,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(50),
                            color = if (hasResult) EmeraldLight else PurpleLight
                        ) {
                            Text(
                                text = if (hasResult) "✓ Selesai" else "Siap Dikerjakan",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (hasResult) EmeraldSuccess else PurpleAccent,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Text(exam.title, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Slate900)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(exam.description, fontSize = 12.sp, color = Slate600)

                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Timer, contentDescription = null, tint = Slate400, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("${exam.durationMinutes} Menit", fontSize = 11.sp, color = Slate600)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.FormatListNumbered, contentDescription = null, tint = Slate400, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("${exam.questions.size} Butir Soal", fontSize = 11.sp, color = Slate600)
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    if (hasResult) {
                        val res = exam.myResult!!
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Slate50,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Nilai Diperoleh:", fontSize = 11.sp, color = Slate400)
                                    Text("${res.score} / 100", fontWeight = FontWeight.Black, fontSize = 20.sp, color = IndigoPrimary)
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text("Benar: ${res.totalCorrect}/${res.totalQuestions}", fontSize = 11.sp, color = Slate600)
                                    Text("Pelanggaran: ${res.violationsCount}x", fontSize = 11.sp, color = if (res.violationsCount > 0) RoseError else EmeraldSuccess)
                                }
                            }
                        }
                    } else {
                        Button(
                            onClick = {
                                userAnswers.clear()
                                violationsCount = 0
                                currentQuestionIndex = 0
                                activeExam = exam
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth().testTag("start_cbt_button_${exam.id}")
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Mulai Ujian CBT Sekarang")
                        }
                    }
                }
            }
        }
    }
}
