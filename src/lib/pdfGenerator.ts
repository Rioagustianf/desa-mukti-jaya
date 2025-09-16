import jsPDF from "jspdf";

export interface SuratData {
  _id: string;
  nama: string;
  nik: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  alamat?: string;
  rt?: string;
  rw?: string;
  desa?: string;
  kecamatan?: string;
  kabupaten?: string;
  keperluan?: string;
  teleponWA?: string;
  jenisSurat: {
    nama: string;
    kode: string;
  };
  tanggalPengajuan: string;
  // Additional fields for specific letter types
  alamatTujuan?: string;
  rtTujuan?: string;
  rwTujuan?: string;
  desaTujuan?: string;
  kecamatanTujuan?: string;
  kabupatenTujuan?: string;
  alasanPindah?: string;
}

export function generateSuratPDF(suratData: SuratData): string {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PEMERINTAH DESA MUKTI JAYA", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Kecamatan Mukti Jaya, Kabupaten Mukti Jaya", 105, 30, {
    align: "center",
  });
  doc.text("Alamat: Jl. Mukti Jaya No. 1, Kode Pos 12345", 105, 40, {
    align: "center",
  });

  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 50, 190, 50);

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(suratData.jenisSurat.nama.toUpperCase(), 105, 70, {
    align: "center",
  });
  doc.text(
    `Nomor: ${suratData.jenisSurat.kode}/${new Date().getFullYear()}`,
    105,
    80,
    { align: "center" }
  );

  // Content
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  let yPosition = 100;

  doc.text(
    "Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya",
    20,
    yPosition
  );
  yPosition += 10;
  doc.text(
    "Kecamatan Mukti Jaya, Kabupaten Mukti Jaya, dengan ini menerangkan bahwa:",
    20,
    yPosition
  );
  yPosition += 20;

  // Personal data
  doc.text(`Nama               : ${suratData.nama}`, 30, yPosition);
  yPosition += 10;
  doc.text(`NIK                : ${suratData.nik}`, 30, yPosition);
  yPosition += 10;

  if (suratData.tempatLahir && suratData.tanggalLahir) {
    doc.text(
      `Tempat/Tgl Lahir   : ${suratData.tempatLahir}, ${suratData.tanggalLahir}`,
      30,
      yPosition
    );
    yPosition += 10;
  }

  if (suratData.alamat) {
    let alamatLengkap = suratData.alamat;
    if (suratData.rt && suratData.rw) {
      alamatLengkap += `, RT ${suratData.rt}/RW ${suratData.rw}`;
    }
    if (suratData.desa) {
      alamatLengkap += `, ${suratData.desa}`;
    }
    if (suratData.kecamatan) {
      alamatLengkap += `, ${suratData.kecamatan}`;
    }
    if (suratData.kabupaten) {
      alamatLengkap += `, ${suratData.kabupaten}`;
    }

    doc.text(`Alamat             : ${alamatLengkap}`, 30, yPosition);
    yPosition += 10;
  }

  if (suratData.teleponWA) {
    doc.text(`No. Telepon/WA     : ${suratData.teleponWA}`, 30, yPosition);
    yPosition += 10;
  }

  // Purpose/Content based on letter type using enhanced templates
  yPosition = generateSpecificLetterContent(suratData, doc, yPosition);

  if (suratData.keperluan) {
    yPosition += 10;
    doc.text(`Keperluan: ${suratData.keperluan}`, 20, yPosition);
    yPosition += 10;
  }

  yPosition += 15;
  doc.text(
    "Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat",
    20,
    yPosition
  );
  yPosition += 7;
  doc.text("dipergunakan sebagaimana mestinya.", 20, yPosition);

  yPosition += 15;
  doc.text(
    "Catatan: Surat ini berlaku selama 6 (enam) bulan sejak tanggal diterbitkan.",
    20,
    yPosition
  );

  // Footer with date and signature
  yPosition += 30;
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.text(`Mukti Jaya, ${currentDate}`, 120, yPosition);
  yPosition += 10;
  doc.text("Kepala Desa Mukti Jaya", 120, yPosition);

  yPosition += 40;
  doc.text("( ___________________ )", 120, yPosition);
  yPosition += 7;
  doc.text("Nama Kepala Desa", 120, yPosition);

  return doc.output("datauristring");
}

function generateSpecificLetterContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const letterType = suratData.jenisSurat.kode.toLowerCase();

  switch (letterType) {
    case "skd":
      return generateSKDContent(suratData, doc, yPosition);
    case "sku":
      return generateSKUContent(suratData, doc, yPosition);
    case "sktm":
      return generateSKTMContent(suratData, doc, yPosition);
    case "skbm":
      return generateSKBMContent(suratData, doc, yPosition);
    case "skk":
      return generateSKKContent(suratData, doc, yPosition);
    case "skl":
      return generateSKLContent(suratData, doc, yPosition);
    case "skpd":
      return generateSKPDContent(suratData, doc, yPosition);
    case "skpk":
      return generateSKPKContent(suratData, doc, yPosition);
    case "skkt":
      return generateSKKTContent(suratData, doc, yPosition);
    case "skaw":
      return generateSKAWContent(suratData, doc, yPosition);
    default:
      return generateDefaultContent(suratData, doc, yPosition);
  }
}

// SKD - Surat Keterangan Domisili
function generateSKDContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const content = `Adalah benar-benar penduduk Desa Mukti Jaya dan berdomisili di alamat tersebut di atas. Yang bersangkutan adalah warga yang taat kepada hukum dan tidak pernah terlibat dalam kegiatan yang dapat mengganggu keamanan dan ketertiban masyarakat.`;

  yPosition += 10;
  doc.text(
    "Berdasarkan keterangan yang dapat dipertanggungjawabkan, bahwa:",
    20,
    yPosition
  );
  yPosition += 10;

  const lines = doc.splitTextToSize(content, 160);
  lines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  return yPosition;
}

// SKU - Surat Keterangan Usaha
function generateSKUContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const content = `Adalah benar-benar penduduk Desa Mukti Jaya dan memiliki usaha yang beralamat di alamat tersebut di atas. Usaha yang bersangkutan telah berjalan dan tidak bertentangan dengan peraturan yang berlaku serta tidak mengganggu ketertiban umum.`;

  yPosition += 10;
  doc.text(
    "Berdasarkan keterangan yang dapat dipertanggungjawabkan, bahwa:",
    20,
    yPosition
  );
  yPosition += 10;

  const lines = doc.splitTextToSize(content, 160);
  lines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  return yPosition;
}

// SKTM - Surat Keterangan Tidak Mampu
function generateSKTMContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const content = `Adalah benar-benar penduduk Desa Mukti Jaya dan berdasarkan pengamatan serta data yang ada di kantor desa, yang bersangkutan termasuk dalam kategori keluarga tidak mampu/kurang mampu secara ekonomi.`;

  yPosition += 10;
  doc.text(
    "Berdasarkan keterangan yang dapat dipertanggungjawabkan, bahwa:",
    20,
    yPosition
  );
  yPosition += 10;

  const lines = doc.splitTextToSize(content, 160);
  lines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  return yPosition;
}

// SKBM - Surat Keterangan Belum Menikah
function generateSKBMContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const content = `Adalah benar-benar penduduk Desa Mukti Jaya dan berdasarkan data kependudukan yang ada di kantor desa, sampai dengan saat ini belum pernah menikah (masih lajang/jejaka).`;

  yPosition += 10;
  doc.text(
    "Berdasarkan keterangan yang dapat dipertanggungjawabkan, bahwa:",
    20,
    yPosition
  );
  yPosition += 10;

  const lines = doc.splitTextToSize(content, 160);
  lines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  return yPosition;
}

// SKK - Surat Keterangan Kematian
function generateSKKContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const content = `Telah meninggal dunia dan tercatat sebagai penduduk Desa Mukti Jaya. Kematian tersebut telah dilaporkan dan dicatatkan sesuai dengan ketentuan yang berlaku.`;

  yPosition += 10;
  doc.text("Berdasarkan laporan yang masuk, bahwa:", 20, yPosition);
  yPosition += 10;

  const lines = doc.splitTextToSize(content, 160);
  lines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  yPosition += 10;
  doc.text(`Tanggal Kematian: ${currentDate}`, 20, yPosition);
  yPosition += 7;

  return yPosition;
}

// SKL - Surat Keterangan Kelahiran
function generateSKLContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const content = `Telah lahir di wilayah Desa Mukti Jaya dan telah dilaporkan serta dicatatkan sesuai dengan ketentuan yang berlaku. Kelahiran tersebut merupakan anak dari pasangan yang sah.`;

  yPosition += 10;
  doc.text("Berdasarkan laporan kelahiran, bahwa:", 20, yPosition);
  yPosition += 10;

  if (suratData.tempatLahir) {
    doc.text(`Tempat Lahir: ${suratData.tempatLahir}`, 20, yPosition);
    yPosition += 7;
  }
  if (suratData.tanggalLahir) {
    doc.text(`Tanggal Lahir: ${suratData.tanggalLahir}`, 20, yPosition);
    yPosition += 7;
  }

  yPosition += 5;
  const lines = doc.splitTextToSize(content, 160);
  lines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  return yPosition;
}

// SKPD - Surat Keterangan Pindah Datang
function generateSKPDContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const content = `Adalah benar-benar penduduk yang telah pindah dan datang ke Desa Mukti Jaya. Yang bersangkutan telah memenuhi persyaratan administratif dan telah terdaftar sebagai penduduk desa.`;

  yPosition += 10;
  doc.text("Berdasarkan laporan pindah datang, bahwa:", 20, yPosition);
  yPosition += 10;

  const lines = doc.splitTextToSize(content, 160);
  lines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  return yPosition;
}

// SKPK - Surat Keterangan Pindah Keluar
function generateSKPKContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const content = `Adalah benar-benar penduduk Desa Mukti Jaya yang akan pindah keluar dari desa. Yang bersangkutan telah memenuhi kewajiban administratif dan tidak memiliki tunggakan atau ikatan hukum di desa.`;

  yPosition += 10;
  doc.text("Berdasarkan permohonan pindah keluar, bahwa:", 20, yPosition);
  yPosition += 10;

  const lines = doc.splitTextToSize(content, 160);
  lines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  if (suratData.alamatTujuan) {
    yPosition += 10;
    let alamatTujuan = suratData.alamatTujuan;
    if (suratData.rtTujuan && suratData.rwTujuan) {
      alamatTujuan += `, RT ${suratData.rtTujuan}/RW ${suratData.rwTujuan}`;
    }
    if (suratData.desaTujuan) {
      alamatTujuan += `, ${suratData.desaTujuan}`;
    }
    if (suratData.kecamatanTujuan) {
      alamatTujuan += `, ${suratData.kecamatanTujuan}`;
    }
    if (suratData.kabupatenTujuan) {
      alamatTujuan += `, ${suratData.kabupatenTujuan}`;
    }

    doc.text(`Alamat Tujuan: ${alamatTujuan}`, 20, yPosition);
    yPosition += 7;
  }

  if (suratData.alasanPindah) {
    doc.text(`Alasan Pindah: ${suratData.alasanPindah}`, 20, yPosition);
    yPosition += 7;
  }

  return yPosition;
}

// SKKT - Surat Keterangan Kepemilikan Tanah
function generateSKKTContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const content = `Adalah benar-benar penduduk Desa Mukti Jaya dan memiliki/menguasai sebidang tanah yang berlokasi di wilayah Desa Mukti Jaya. Tanah tersebut dikuasai secara turun temurun dan tidak dalam sengketa.`;

  yPosition += 10;
  doc.text(
    "Berdasarkan keterangan yang dapat dipertanggungjawabkan, bahwa:",
    20,
    yPosition
  );
  yPosition += 10;

  const lines = doc.splitTextToSize(content, 160);
  lines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  yPosition += 10;
  doc.text(
    "Catatan: Surat keterangan ini bukan pengganti sertifikat tanah.",
    20,
    yPosition
  );
  yPosition += 7;

  return yPosition;
}

// SKAW - Surat Keterangan Ahli Waris
function generateSKAWContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const content = `Adalah benar-benar ahli waris yang sah dari almarhum/almarhumah sebagaimana tercatat dalam data kependudukan Desa Mukti Jaya. Yang bersangkutan berhak atas warisan sesuai dengan ketentuan hukum yang berlaku.`;

  yPosition += 10;
  doc.text("Berdasarkan data kependudukan yang ada, bahwa:", 20, yPosition);
  yPosition += 10;

  const lines = doc.splitTextToSize(content, 160);
  lines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  return yPosition;
}

// Default Content
function generateDefaultContent(
  suratData: SuratData,
  doc: jsPDF,
  yPosition: number
): number {
  const content = `Adalah benar-benar penduduk Desa Mukti Jaya dan memenuhi persyaratan sesuai dengan permohonan yang diajukan.`;

  yPosition += 10;
  doc.text(
    "Berdasarkan keterangan yang dapat dipertanggungjawabkan, bahwa:",
    20,
    yPosition
  );
  yPosition += 10;

  const lines = doc.splitTextToSize(content, 160);
  lines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  return yPosition;
}
