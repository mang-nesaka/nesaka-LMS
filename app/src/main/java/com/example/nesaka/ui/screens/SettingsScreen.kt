package com.example.nesaka.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.example.nesaka.model.SchoolSetting
import com.example.nesaka.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    repository: LmsRepository
) {
    val currentSetting by repository.schoolSetting.collectAsState()

    var schoolName by remember(currentSetting) { mutableStateOf(currentSetting.schoolName) }
    var schoolLat by remember(currentSetting) { mutableStateOf(currentSetting.schoolLat.toString()) }
    var schoolLng by remember(currentSetting) { mutableStateOf(currentSetting.schoolLng.toString()) }
    var radiusMeters by remember(currentSetting) { mutableStateOf(currentSetting.radiusMeters.toString()) }
    var checkInStartTime by remember(currentSetting) { mutableStateOf(currentSetting.checkInStartTime) }
    var checkInLateTime by remember(currentSetting) { mutableStateOf(currentSetting.checkInLateTime) }
    var checkOutStartTime by remember(currentSetting) { mutableStateOf(currentSetting.checkOutStartTime) }

    var saveSuccess by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .testTag("settings_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = Slate900)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Settings, contentDescription = null, tint = PureWhite, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Pengaturan Presensi & Lokasi GPS", color = PureWhite, fontWeight = FontWeight.Black, fontSize = 16.sp)
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    "Konfigurasi titik koordinat gerbang sekolah, radius geofence maksimal, serta jam buka dan batas terlambat presensi siswa.",
                    color = Slate400,
                    fontSize = 12.sp,
                    lineHeight = 16.sp
                )
            }
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Slate200, Slate200)))
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text("Titik Koordinat & Geofence Sekolah", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = IndigoPrimary)

                OutlinedTextField(
                    value = schoolName,
                    onValueChange = { schoolName = it },
                    label = { Text("Nama Sekolah Resmi") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = schoolLat,
                        onValueChange = { schoolLat = it },
                        label = { Text("Latitude") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = schoolLng,
                        onValueChange = { schoolLng = it },
                        label = { Text("Longitude") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                OutlinedTextField(
                    value = radiusMeters,
                    onValueChange = { radiusMeters = it },
                    label = { Text("Radius Maksimal Presensi (Meter)") },
                    supportingText = { Text("Siswa di luar radius ini otomatis ditolak saat presensi.") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(4.dp))
                Text("Jadwal Waktu Presensi Siswa", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = IndigoPrimary)

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = checkInStartTime,
                        onValueChange = { checkInStartTime = it },
                        label = { Text("Buka Presensi Pagi") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = checkInLateTime,
                        onValueChange = { checkInLateTime = it },
                        label = { Text("Batas Tepat Waktu") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                OutlinedTextField(
                    value = checkOutStartTime,
                    onValueChange = { checkOutStartTime = it },
                    label = { Text("Presensi Pulang Dibuka") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                if (saveSuccess) {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = EmeraldLight,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Pengaturan sekolah berhasil diperbarui!", color = EmeraldSuccess, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))
                Button(
                    onClick = {
                        val newSetting = SchoolSetting(
                            schoolName = schoolName,
                            schoolLat = schoolLat.toDoubleOrNull() ?: currentSetting.schoolLat,
                            schoolLng = schoolLng.toDoubleOrNull() ?: currentSetting.schoolLng,
                            radiusMeters = radiusMeters.toIntOrNull() ?: currentSetting.radiusMeters,
                            checkInStartTime = checkInStartTime,
                            checkInLateTime = checkInLateTime,
                            checkOutStartTime = checkOutStartTime
                        )
                        repository.updateSchoolSetting(newSetting)
                        saveSuccess = true
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().testTag("save_settings_button")
                ) {
                    Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Simpan Pengaturan Sekolah")
                }
            }
        }
    }
}
