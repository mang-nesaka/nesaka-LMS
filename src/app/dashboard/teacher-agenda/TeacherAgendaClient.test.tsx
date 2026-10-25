// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TeacherAgendaClient from './TeacherAgendaClient';

type ScanCallback = (
  result: { getText: () => string } | undefined,
  error: unknown,
  controls: { stop: () => void },
) => void;

// Kamera & action server dipalsukan: yang diuji hanya perilaku UI pop-up.
const mocks = vi.hoisted(() => ({
  scanCallback: null as ScanCallback | null,
  cameraError: null as Error | null,
  stopCamera: vi.fn(),
  submitAgenda: vi.fn(),
}));

vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: class {
    async decodeFromConstraints(_constraints: unknown, _video: unknown, callback: ScanCallback) {
      if (mocks.cameraError) throw mocks.cameraError;
      mocks.scanCallback = callback;
      return { stop: mocks.stopCamera };
    }
  },
}));

vi.mock('@/app/actions/agenda', () => ({
  scanBarcodeAndSubmitAgenda: mocks.submitAgenda,
}));

const CODE_RPL = 'NESAKA-X-RPL-1';
const CODE_TKJ = 'NESAKA-XI-TKJ-2';

const schedules = [
  {
    id: 's1',
    subject: 'Matematika',
    dayOfWeek: 1,
    startTime: '07:00',
    endTime: '08:30',
    classroom: { name: 'X RPL 1', code: CODE_RPL },
  },
  {
    id: 's2',
    subject: 'Fisika',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:30',
    classroom: { name: 'XI TKJ 2', code: CODE_TKJ },
  },
];

const savedAgenda = {
  id: 'a1',
  classScheduleId: 's1',
  classroom: { name: 'X RPL 1' },
  subject: 'Matematika',
  isLate: false,
  lateMinutes: 0,
  teachingMaterial: 'Persamaan linear satu variabel',
  scheduledStartTime: '07:00',
  scheduledEndTime: '08:30',
  scanTime: '2026-10-26T00:05:00.000Z',
};

const MSG_QR_MISMATCH = 'QR tidak cocok dengan ruang kelas pada jadwal Anda hari ini. Silakan scan ulang.';
const MSG_MATERIAL_REQUIRED = 'Materi yang diajarkan wajib diisi.';

function setup(props: Partial<React.ComponentProps<typeof TeacherAgendaClient>> = {}) {
  const user = userEvent.setup();
  render(<TeacherAgendaClient schedules={schedules} initialAgendas={[]} {...props} />);
  return user;
}

/** Buka kamera lalu "pindai" kode tertentu seolah-olah dibaca zxing. */
async function scanQr(user: ReturnType<typeof userEvent.setup>, code: string) {
  await user.click(screen.getByRole('button', { name: /buka kamera/i }));
  await waitFor(() => expect(mocks.scanCallback).not.toBeNull());
  act(() => {
    mocks.scanCallback!({ getText: () => code }, undefined, { stop: mocks.stopCamera });
  });
}

const getDialog = () => screen.queryByRole('dialog');
const getMaterial = () => screen.getByLabelText(/materi pelajaran/i) as HTMLTextAreaElement;
const getNotes = () => screen.getByLabelText(/catatan/i) as HTMLInputElement;
const getQrInput = () => screen.getByPlaceholderText('Belum discan') as HTMLInputElement;

beforeEach(() => {
  mocks.scanCallback = null;
  mocks.cameraError = null;
  mocks.stopCamera.mockClear();
  mocks.submitAgenda.mockReset();
  document.body.style.overflow = '';
});

afterEach(() => {
  cleanup();
});

describe('TeacherAgendaClient: tampilan awal', () => {
  it('belum menampilkan form materi/catatan sebelum QR discan', () => {
    setup();
    expect(getDialog()).toBeNull();
    expect(screen.queryByLabelText(/materi pelajaran/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /simpan agenda/i })).toBeNull();
    expect(getQrInput().value).toBe('');
  });

  it('menampilkan jadwal hari ini dan menandai yang sudah discan', () => {
    setup({ initialAgendas: [savedAgenda] });
    expect(screen.getByText('Sudah discan')).toBeTruthy();
    expect(screen.getByText('Menunggu scan')).toBeTruthy();
  });

  it('menonaktifkan tombol kamera dan memberi petunjuk jika tidak ada jadwal', () => {
    setup({ schedules: [] });
    expect((screen.getByRole('button', { name: /buka kamera/i }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/tidak ada jadwal hari ini/i)).toBeTruthy();
  });
});

describe('TeacherAgendaClient: pop-up setelah scan', () => {
  it('membuka pop-up berisi info kelas setelah QR yang cocok terbaca', async () => {
    const user = setup();
    await scanQr(user, CODE_RPL);

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByText('Isi Agenda Mengajar')).toBeTruthy();
    expect(dialog.textContent).toContain('X RPL 1');
    expect(dialog.textContent).toContain('Matematika');
    expect(dialog.textContent).toContain('07:00–08:30');
    expect(getQrInput().value).toBe(CODE_RPL);
  });

  it('langsung memfokuskan kolom materi dan menghentikan kamera', async () => {
    const user = setup();
    await scanQr(user, CODE_RPL);
    expect(document.activeElement).toBe(getMaterial());
    expect(mocks.stopCamera).toHaveBeenCalled();
  });

  it('mengabaikan perbedaan huruf besar/kecil dan spasi pada kode QR', async () => {
    const user = setup();
    await scanQr(user, '  nesaka-x-rpl-1  ');
    expect(getDialog()).not.toBeNull();
  });

  it('juga terbuka untuk ruang lain yang ada di jadwal hari ini', async () => {
    const user = setup();
    await scanQr(user, CODE_TKJ);
    expect(getDialog()!.textContent).toContain('XI TKJ 2');
    expect(getDialog()!.textContent).toContain('Fisika');
  });

  it('tidak membuka pop-up dan menampilkan pesan jika QR bukan ruang di jadwal', async () => {
    const user = setup();
    await scanQr(user, 'NESAKA-XII-AKL-1');

    expect(getDialog()).toBeNull();
    expect(screen.getByText(MSG_QR_MISMATCH)).toBeTruthy();
    expect(getQrInput().value).toBe('');
    expect(mocks.submitAgenda).not.toHaveBeenCalled();
  });

  it('menampilkan pesan kamera gagal tanpa membuka pop-up', async () => {
    mocks.cameraError = new Error('Izin kamera ditolak.');
    const user = setup();
    await user.click(screen.getByRole('button', { name: /buka kamera/i }));

    expect(await screen.findByText('Izin kamera ditolak.')).toBeTruthy();
    expect(getDialog()).toBeNull();
  });
});

describe('TeacherAgendaClient: menyimpan agenda', () => {
  it('menolak materi kosong atau hanya spasi tanpa memanggil server', async () => {
    const user = setup();
    await scanQr(user, CODE_RPL);

    await user.click(screen.getByRole('button', { name: /simpan agenda mengajar/i }));
    expect((await screen.findByRole('alert')).textContent).toContain(MSG_MATERIAL_REQUIRED);

    await user.type(getMaterial(), '   ');
    await user.click(screen.getByRole('button', { name: /simpan agenda mengajar/i }));
    expect(screen.getByRole('alert').textContent).toContain(MSG_MATERIAL_REQUIRED);

    expect(mocks.submitAgenda).not.toHaveBeenCalled();
    expect(getDialog()).not.toBeNull();
  });

  it('mengirim kode QR, materi, dan catatan lalu menutup pop-up saat berhasil', async () => {
    mocks.submitAgenda.mockResolvedValue({ success: true, message: 'Agenda berhasil disimpan.', agenda: savedAgenda });
    const user = setup();
    await scanQr(user, CODE_RPL);

    await user.type(getMaterial(), 'Persamaan linear satu variabel');
    await user.type(getNotes(), 'Siswa aktif');
    await user.click(screen.getByRole('button', { name: /simpan agenda mengajar/i }));

    await waitFor(() => expect(getDialog()).toBeNull());
    expect(mocks.submitAgenda).toHaveBeenCalledTimes(1);
    expect(mocks.submitAgenda).toHaveBeenCalledWith({
      barcodeCode: CODE_RPL,
      teachingMaterial: 'Persamaan linear satu variabel',
      notes: 'Siswa aktif',
    });
    expect(screen.getByText('Agenda berhasil disimpan.')).toBeTruthy();
    expect(screen.getByText('Persamaan linear satu variabel')).toBeTruthy(); // muncul di riwayat
    expect(screen.getByText('Sudah discan')).toBeTruthy();
    expect(getQrInput().value).toBe('');
  });

  it('mengosongkan isian setelah berhasil sehingga scan berikutnya mulai bersih', async () => {
    mocks.submitAgenda.mockResolvedValue({ success: true, message: 'Tersimpan', agenda: savedAgenda });
    const user = setup();
    await scanQr(user, CODE_RPL);
    await user.type(getMaterial(), 'Materi lama');
    await user.type(getNotes(), 'Catatan lama');
    await user.click(screen.getByRole('button', { name: /simpan agenda mengajar/i }));
    await waitFor(() => expect(getDialog()).toBeNull());

    mocks.scanCallback = null;
    await scanQr(user, CODE_TKJ);
    expect(getMaterial().value).toBe('');
    expect(getNotes().value).toBe('');
  });

  it('menampilkan error server di dalam pop-up dan tidak menghapus teks yang sudah diketik', async () => {
    mocks.submitAgenda.mockResolvedValue({ error: 'Jadwal ini sudah discan hari ini.' });
    const user = setup();
    await scanQr(user, CODE_RPL);
    await user.type(getMaterial(), 'Materi yang sudah diketik');
    await user.click(screen.getByRole('button', { name: /simpan agenda mengajar/i }));

    expect((await screen.findByRole('alert')).textContent).toContain('Jadwal ini sudah discan hari ini.');
    expect(getDialog()).not.toBeNull();
    expect(getMaterial().value).toBe('Materi yang sudah diketik');
  });

  it('menampilkan pesan error jika permintaan gagal (mis. jaringan putus) dan tombol aktif lagi', async () => {
    mocks.submitAgenda.mockRejectedValue(new Error('Jaringan terputus.'));
    const user = setup();
    await scanQr(user, CODE_RPL);
    await user.type(getMaterial(), 'Materi');
    await user.click(screen.getByRole('button', { name: /simpan agenda mengajar/i }));

    expect((await screen.findByRole('alert')).textContent).toContain('Jaringan terputus.');
    expect((screen.getByRole('button', { name: /simpan agenda mengajar/i }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('mengunci tombol dan tidak bisa ditutup selama proses menyimpan', async () => {
    let finish!: (value: unknown) => void;
    mocks.submitAgenda.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const user = setup();
    await scanQr(user, CODE_RPL);
    await user.type(getMaterial(), 'Materi');
    await user.click(screen.getByRole('button', { name: /simpan agenda mengajar/i }));

    const saving = await screen.findByRole('button', { name: /menyimpan agenda/i });
    expect((saving as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /^batal$/i }) as HTMLButtonElement).disabled).toBe(true);

    await user.keyboard('{Escape}');
    expect(getDialog()).not.toBeNull();

    await act(async () => finish({ success: true, message: 'Tersimpan', agenda: savedAgenda }));
    await waitFor(() => expect(getDialog()).toBeNull());
  });
});

describe('TeacherAgendaClient: menutup pop-up', () => {
  it('tombol Batal menutup pop-up dan mengosongkan kode QR', async () => {
    const user = setup();
    await scanQr(user, CODE_RPL);
    await user.click(screen.getByRole('button', { name: /^batal$/i }));

    expect(getDialog()).toBeNull();
    expect(getQrInput().value).toBe('');
    expect(mocks.submitAgenda).not.toHaveBeenCalled();
  });

  it('tombol X menutup pop-up', async () => {
    const user = setup();
    await scanQr(user, CODE_RPL);
    await user.click(screen.getByRole('button', { name: /tutup formulir/i }));
    expect(getDialog()).toBeNull();
  });

  it('tombol Esc menutup pop-up', async () => {
    const user = setup();
    await scanQr(user, CODE_RPL);
    await user.keyboard('{Escape}');
    expect(getDialog()).toBeNull();
  });

  it('klik pada area gelap di luar pop-up tidak menutupnya (mencegah teks hilang)', async () => {
    const user = setup();
    await scanQr(user, CODE_RPL);
    await user.type(getMaterial(), 'Jangan hilang');

    await user.click(getDialog()!.parentElement!);
    expect(getDialog()).not.toBeNull();
    expect(getMaterial().value).toBe('Jangan hilang');
  });

  it('guru bisa scan ulang setelah membatalkan', async () => {
    const user = setup();
    await scanQr(user, CODE_RPL);
    await user.click(screen.getByRole('button', { name: /^batal$/i }));

    mocks.scanCallback = null;
    await scanQr(user, CODE_RPL);
    expect(getDialog()).not.toBeNull();
  });

  it('mengunci scroll halaman saat terbuka dan memulihkan nilai semula saat tertutup', async () => {
    document.body.style.overflow = 'auto';
    const user = setup();
    await scanQr(user, CODE_RPL);
    expect(document.body.style.overflow).toBe('hidden');

    await user.click(screen.getByRole('button', { name: /^batal$/i }));
    expect(document.body.style.overflow).toBe('auto');
  });

  it('memulihkan scroll halaman jika komponen dilepas saat pop-up terbuka', async () => {
    const user = setup();
    await scanQr(user, CODE_RPL);
    expect(document.body.style.overflow).toBe('hidden');
    cleanup();
    expect(document.body.style.overflow).toBe('');
  });
});
