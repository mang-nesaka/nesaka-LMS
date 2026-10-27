package com.example.nesaka.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nesaka.data.LmsRepository
import com.example.nesaka.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttendanceScreen(
    repository: LmsRepository
) {
    val currentUser by repository.currentUser.collectAsState()
    val setting by repository.schoolSetting.collectAsState()
    val attendanceRecords by repository.attendanceRecords.collectAsState()

    var statusMessage by remember { mutableStateOf<String?>(null) }
    var isSuccess by remember { mutableStateOf(true) }
    var selfieCaptured by remember { mutableStateOf(false) }

    val myRecords = attendanceRecords.filter { it.studentId == currentUser.id }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("attendance_screen"),
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
                        Icon(Icons.Default.LocationOn, contentDescription = null, tint = PureWhite, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Presensi Kehadiran Siswa (GPS & Wajah)", color = PureWhite, fontWeight = FontWeight.Black, fontSize = 16.sp)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "Presensi wajib berada dalam radius maksimal ${setting.radiusMeters} meter dari gerbang ${setting.schoolName} dan melampirkan foto selfie.",
                        color = IndigoLight,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = PureWhite.copy(alpha = 0.15f),
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(8.dp)) {
                                Text("Dibuka Pagi", fontSize = 10.sp, color = IndigoLight)
                                Text("${setting.checkInStartTime} WIB", fontWeight = FontWeight.Bold, color = PureWhite, fontSize = 13.sp)
                            }
                        }
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = PureWhite.copy(alpha = 0.15f),
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(8.dp)) {
                                Text("Batas Tepat Waktu", fontSize = 10.sp, color = AmberWarning)
                                Text("< ${setting.checkInLateTime} WIB", fontWeight = FontWeight.Bold, color = PureWhite, fontSize = 13.sp)
                            }
                        }
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = PureWhite.copy(alpha = 0.15f),
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(8.dp)) {
                                Text("Presensi Pulang", fontSize = 10.sp, color = EmeraldSuccess)
                                Text("≥ ${setting.checkOutStartTime} WIB", fontWeight = FontWeight.Bold, color = PureWhite, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }
        }

        // GPS Radar & Camera Selfie Box
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Slate200, Slate200)))
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Simulated GPS radar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(EmeraldLight)
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.MyLocation, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Sinyal GPS Akurat: 65 Meter dari Sekolah", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = EmeraldSuccess)
                            Text("Koordinat terverifikasi dalam radius izin ${setting.radiusMeters}m", fontSize = 11.sp, color = Slate600)
                        }
                        Icon(Icons.Default.Check, contentDescription = null, tint = EmeraldSuccess)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Simulated Camera Selfie Box
                    Box(
                        modifier = Modifier
                            .size(140.dp)
                            .clip(RoundedCornerShape(18.dp))
                            .background(if (selfieCaptured) IndigoLight else Slate100)
                            .border(2.dp, if (selfieCaptured) EmeraldSuccess else Slate200, RoundedCornerShape(18.dp))
                            .clickable { selfieCaptured = true },
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                if (selfieCaptured) Icons.Default.Face else Icons.Default.CameraAlt,
                                contentDescription = null,
                                tint = if (selfieCaptured) EmeraldSuccess else Slate400,
                                modifier = Modifier.size(44.dp)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                if (selfieCaptured) "Foto Wajah Siap ✓" else "Ambil Foto Selfie",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (selfieCaptured) EmeraldSuccess else Slate600
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Status Message Feedback
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
                        Spacer(modifier = Modifier.height(14.dp))
                    }

                    // Action Buttons (Presensi Masuk & Pulang)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = {
                                val (ok, msg) = repository.performAttendance(isCheckIn = true)
                                isSuccess = ok
                                statusMessage = msg
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("check_in_button")
                        ) {
                            Icon(Icons.Default.Login, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Presensi Masuk", fontSize = 12.sp)
                        }

                        Button(
                            onClick = {
                                val (ok, msg) = repository.performAttendance(isCheckIn = false)
                                isSuccess = ok
                                statusMessage = msg
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("check_out_button")
                        ) {
                            Icon(Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Presensi Pulang", fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        // Attendance History List
        item {
            Text("Riwayat Presensi Saya", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate800)
        }

        if (myRecords.isEmpty()) {
            item {
                Text("Belum ada catatan presensi.", fontSize = 13.sp, color = Slate400)
            }
        } else {
            items(myRecords) { record ->
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
                            Text(record.date, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900)
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                "Masuk: ${record.checkInTime ?: "-"} • Pulang: ${record.checkOutTime ?: "-"}",
                                fontSize = 12.sp,
                                color = Slate600
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(50),
                            color = if (record.isLate) RoseLight else EmeraldLight
                        ) {
                            Text(
                                text = if (record.isLate) "Terlambat ${record.lateMinutes}m" else "Tepat Waktu",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (record.isLate) RoseError else EmeraldSuccess,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
