package com.example.eduspace.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.eduspace.data.LmsRepository
import com.example.eduspace.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DigitalCardScreen(
    repository: LmsRepository
) {
    val currentUser by repository.currentUser.collectAsState()
    val dapodikForms by repository.dapodikForms.collectAsState()
    val myDapodik = dapodikForms[currentUser.id]

    val fullName = myDapodik?.namaLengkap ?: currentUser.name
    val nisn = myDapodik?.nisn ?: "0078923411"
    val nis = myDapodik?.nis ?: (currentUser.nipOrNis ?: "20260101")
    val studentClass = currentUser.studentClass ?: "X RPL 1"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .testTag("digital_card_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Text("Kartu Pelajar Digital", fontWeight = FontWeight.Black, fontSize = 20.sp, color = Slate900)
            Text("Tanda pengenal resmi peserta didik terverifikasi", fontSize = 12.sp, color = Slate500)
        }

        // DIGITAL ID CARD COMPONENT
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(IndigoPrimary, IndigoDark)
                        )
                    )
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Header Sekolah
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Default.School, contentDescription = null, tint = PureWhite, modifier = Modifier.size(28.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("SMK NEGERI 1 (NESAKA)", color = PureWhite, fontWeight = FontWeight.Black, fontSize = 14.sp, letterSpacing = 1.sp)
                            Text("KARTU TANDA PELAJAR ELEKTRONIK", color = IndigoLight, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = PureWhite.copy(alpha = 0.2f))
                    Spacer(modifier = Modifier.height(16.dp))

                    // Student Photo & Core Details
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Avatar Photo
                        Box(
                            modifier = Modifier
                                .size(88.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(PureWhite)
                                .border(3.dp, PureWhite, RoundedCornerShape(16.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Person, contentDescription = null, tint = IndigoPrimary, modifier = Modifier.size(54.dp))
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(fullName, color = PureWhite, fontWeight = FontWeight.Black, fontSize = 16.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("NISN: $nisn", color = IndigoLight, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            Text("NIS: $nis", color = IndigoLight, fontSize = 12.sp)
                            Text("KELAS: $studentClass", color = PureWhite, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text("PROG: Rekayasa Perangkat Lunak", color = IndigoLight, fontSize = 11.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // QR Barcode & Seal
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(PureWhite)
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.QrCode2, contentDescription = null, tint = Slate900, modifier = Modifier.size(44.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text("VALID ID VERIFIED", fontWeight = FontWeight.Black, fontSize = 10.sp, color = IndigoPrimary)
                                Text("Berlaku s/d: 2029", fontSize = 10.sp, color = Slate600)
                            }
                        }

                        Surface(
                            shape = CircleShape,
                            color = EmeraldLight
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(12.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("TERDAFTAR", color = EmeraldSuccess, fontWeight = FontWeight.Bold, fontSize = 9.sp)
                            }
                        }
                    }
                }
            }
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Slate200, Slate200)))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Ketentuan Kartu Pelajar Digital:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Slate800)
                Spacer(modifier = Modifier.height(6.dp))
                Text("1. Kartu ini merupakan identitas resmi siswa di lingkungan SMK Negeri 1.", fontSize = 11.sp, color = Slate600)
                Text("2. Digunakan untuk presensi perpustakaan, ujian CBT mandiri, dan kegiatan sekolah.", fontSize = 11.sp, color = Slate600)
                Text("3. Bila terjadi kesalahan data diri, ajukan perbaikan data ke bagian Tata Usaha.", fontSize = 11.sp, color = Slate600)
            }
        }
    }
}
