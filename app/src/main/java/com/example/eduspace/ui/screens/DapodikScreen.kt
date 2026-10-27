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
import com.example.eduspace.model.DapodikForm
import com.example.eduspace.model.UserRole
import com.example.eduspace.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DapodikScreen(
    repository: LmsRepository
) {
    val currentUser by repository.currentUser.collectAsState()
    val dapodikForms by repository.dapodikForms.collectAsState()

    val isStudent = currentUser.role == UserRole.STUDENT
    val myForm = dapodikForms[currentUser.id]

    // Form fields state for Student
    var namaLengkap by remember(myForm) { mutableStateOf(myForm?.namaLengkap ?: currentUser.name) }
    var nisn by remember(myForm) { mutableStateOf(myForm?.nisn ?: "0078923411") }
    var nis by remember(myForm) { mutableStateOf(myForm?.nis ?: "20260101") }
    var nik by remember(myForm) { mutableStateOf(myForm?.nik ?: "3273012304070001") }
    var tempatLahir by remember(myForm) { mutableStateOf(myForm?.tempatLahir ?: "Bandung") }
    var tanggalLahir by remember(myForm) { mutableStateOf(myForm?.tanggalLahir ?: "14 April 2010") }
    var jenisKelamin by remember(myForm) { mutableStateOf(myForm?.jenisKelamin ?: "Laki-laki") }
    var agama by remember(myForm) { mutableStateOf(myForm?.agama ?: "Islam") }
    var alamat by remember(myForm) { mutableStateOf(myForm?.alamat ?: "Jl. Terusan Buah Batu No. 45") }
    var noHp by remember(myForm) { mutableStateOf(myForm?.noHp ?: "081234567890") }
    var sekolahAsal by remember(myForm) { mutableStateOf(myForm?.sekolahAsal ?: "SMP Negeri 2 Bandung") }
    var namaAyah by remember(myForm) { mutableStateOf(myForm?.namaAyah ?: "Bambang Pratama") }
    var namaIbu by remember(myForm) { mutableStateOf(myForm?.namaIbu ?: "Dewi Lestari") }
    var pekerjaanAyah by remember(myForm) { mutableStateOf(myForm?.pekerjaanAyah ?: "Karyawan Swasta") }
    var pekerjaanIbu by remember(myForm) { mutableStateOf(myForm?.pekerjaanIbu ?: "Ibu Rumah Tangga") }

    var saveSuccessMessage by remember { mutableStateOf<String?>(null) }
    var searchQuery by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("dapodik_screen"),
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
                        Icon(Icons.Default.Feed, contentDescription = null, tint = PureWhite, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            if (isStudent) "Formulir Dapodik Siswa Baru (F-PD)" else "Rekapitulasi Formulir Dapodik (F-PD)",
                            color = PureWhite,
                            fontWeight = FontWeight.Black,
                            fontSize = 16.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "Data Pokok Pendidikan (F-PD) terintegrasi untuk pendataan resmi profil peserta didik baru kelas 10 di lingkungan sekolah.",
                        color = IndigoLight,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        // STUDENT FORM VIEW
        if (isStudent) {
            item {
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
                        Text("Data Identitas Peserta Didik", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = IndigoPrimary)

                        OutlinedTextField(
                            value = namaLengkap,
                            onValueChange = { namaLengkap = it },
                            label = { Text("Nama Lengkap Siswa (Sesuai Ijazah/Akte)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = nisn,
                                onValueChange = { nisn = it },
                                label = { Text("NISN (10 Digit)") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = nis,
                                onValueChange = { nis = it },
                                label = { Text("NIS Sekolah") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        OutlinedTextField(
                            value = nik,
                            onValueChange = { nik = it },
                            label = { Text("NIK / No. KTP Siswa (16 Digit)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = tempatLahir,
                                onValueChange = { tempatLahir = it },
                                label = { Text("Tempat Lahir") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = tanggalLahir,
                                onValueChange = { tanggalLahir = it },
                                label = { Text("Tanggal Lahir") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = jenisKelamin,
                                onValueChange = { jenisKelamin = it },
                                label = { Text("Jenis Kelamin") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = agama,
                                onValueChange = { agama = it },
                                label = { Text("Agama") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        OutlinedTextField(
                            value = alamat,
                            onValueChange = { alamat = it },
                            label = { Text("Alamat Tempat Tinggal Lengkap") },
                            modifier = Modifier.fillMaxWidth(),
                            maxLines = 2
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = noHp,
                                onValueChange = { noHp = it },
                                label = { Text("Nomor Handphone / WhatsApp") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = sekolahAsal,
                                onValueChange = { sekolahAsal = it },
                                label = { Text("Sekolah Asal SMP / MTs") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Data Orang Tua / Wali Siswa", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = IndigoPrimary)

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = namaAyah,
                                onValueChange = { namaAyah = it },
                                label = { Text("Nama Ayah Kandung") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = pekerjaanAyah,
                                onValueChange = { pekerjaanAyah = it },
                                label = { Text("Pekerjaan Ayah") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = namaIbu,
                                onValueChange = { namaIbu = it },
                                label = { Text("Nama Ibu Kandung") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = pekerjaanIbu,
                                onValueChange = { pekerjaanIbu = it },
                                label = { Text("Pekerjaan Ibu") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        saveSuccessMessage?.let { msg ->
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = EmeraldLight,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(msg, color = EmeraldSuccess, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Button(
                            onClick = {
                                val form = DapodikForm(
                                    id = myForm?.id ?: "dpk_${System.currentTimeMillis()}",
                                    studentId = currentUser.id,
                                    namaLengkap = namaLengkap,
                                    nisn = nisn,
                                    nis = nis,
                                    nik = nik,
                                    jenisKelamin = jenisKelamin,
                                    tempatLahir = tempatLahir,
                                    tanggalLahir = tanggalLahir,
                                    agama = agama,
                                    alamat = alamat,
                                    noHp = noHp,
                                    sekolahAsal = sekolahAsal,
                                    namaAyah = namaAyah,
                                    namaIbu = namaIbu,
                                    pekerjaanAyah = pekerjaanAyah,
                                    pekerjaanIbu = pekerjaanIbu,
                                    createdAt = "27 Okt 2026"
                                )
                                repository.saveDapodik(form)
                                saveSuccessMessage = "Data formulir Dapodik berhasil disimpan dan disinkronkan!"
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("save_dapodik_button")
                        ) {
                            Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Simpan & Kirim Formulir Dapodik")
                        }
                    }
                }
            }
        } else {
            // TU / ADMIN RECAP VIEW
            item {
                val totalStudents = repository.demoUsers.count { it.role == UserRole.STUDENT }
                val filledCount = dapodikForms.size
                val pendingCount = totalStudents - filledCount

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    MetricBox("Total Siswa", "$totalStudents", Icons.Default.People, IndigoPrimary, Modifier.weight(1f))
                    MetricBox("Sudah Isi", "$filledCount", Icons.Default.CheckCircle, EmeraldSuccess, Modifier.weight(1f))
                    MetricBox("Belum Isi", "$pendingCount", Icons.Default.Error, AmberWarning, Modifier.weight(1f))
                }
            }

            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Cari nama siswa atau NISN...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Slate400) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(14.dp)
                )
            }

            val submittedList = dapodikForms.values.filter {
                it.namaLengkap.contains(searchQuery, ignoreCase = true) ||
                it.nisn.contains(searchQuery)
            }

            items(submittedList.toList()) { form ->
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
                            Text(form.namaLengkap, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate900)
                            Surface(shape = RoundedCornerShape(50), color = EmeraldLight) {
                                Text("✓ ${form.status}", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldSuccess, modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp))
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("NISN: ${form.nisn} • NIK: ${form.nik}", fontSize = 12.sp, color = IndigoPrimary, fontWeight = FontWeight.SemiBold)
                        Text("TTL: ${form.tempatLahir}, ${form.tanggalLahir}", fontSize = 12.sp, color = Slate600)
                        Text("Orang Tua: ${form.namaAyah} (${form.pekerjaanAyah}) / ${form.namaIbu}", fontSize = 11.sp, color = Slate500)
                        Text("Kontak: ${form.noHp} • SMP: ${form.sekolahAsal}", fontSize = 11.sp, color = Slate500)
                    }
                }
            }
        }
    }
}
