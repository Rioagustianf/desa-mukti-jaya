import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  View,
  Text,
  Image,
} from "@react-pdf/renderer";

export type CommonProps = {
  logoDataUri: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  alamatDesa: string;
  judulSurat: string;
  nomorSurat: string;
  nama: string;
  nik: string;
  alamat: string;
  keperluan?: string;
  tanggal: string;
  jabatanPenandatangan: string;
  namaPenandatangan: string;
  ttdDataUri?: string;
};

const base = StyleSheet.create({
  page: { paddingTop: 28, paddingHorizontal: 80, fontSize: 11, color: "#000" },
  header: { flexDirection: "row", gap: 12 },
  logo: { width: 60, height: 70 },
  headerCenter: { flex: 1, textAlign: "center" },
  kab: { fontSize: 14, fontWeight: 700, textTransform: "uppercase" },
  kec: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    marginTop: 2,
  },
  desaTxt: {
    fontSize: 16,
    fontWeight: 800,
    textTransform: "uppercase",
    marginTop: 2,
  },
  alamat: { fontSize: 9, marginTop: 3 },
  divider: { height: 2, backgroundColor: "#000", marginTop: 6 },
  title: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  nomor: { textAlign: "center", marginTop: 4 },
  section: { marginTop: 14, lineHeight: 1.5 },
  pair: { marginTop: 4 },
  bold: { fontWeight: 700 },
  ttdWrapper: { flexDirection: "row", marginTop: 24 },
  ttdBox: { width: 220, marginLeft: "auto", textAlign: "center" },
  ttdImg: { width: 140, height: 70, marginTop: 6, alignSelf: "center" },
});

function Kop(p: CommonProps) {
  return (
    <>
      <View style={base.header}>
        {p.logoDataUri ? (
          <Image style={base.logo} src={p.logoDataUri} />
        ) : (
          <View style={base.logo} />
        )}
        <View style={base.headerCenter}>
          <Text style={base.kab}>{p.kabupaten}</Text>
          <Text style={base.kec}>{p.kecamatan}</Text>
          <Text style={base.desaTxt}>{p.desa}</Text>
          <Text style={base.alamat}>{p.alamatDesa}</Text>
        </View>
      </View>
      <View style={base.divider} />
      <Text style={base.title}>{p.judulSurat}</Text>
      <Text style={base.nomor}>Nomor: {p.nomorSurat}</Text>
    </>
  );
}

function TTD(p: CommonProps) {
  return (
    <View style={base.ttdWrapper}>
      <View style={base.ttdBox}>
        <Text>Mukti Jaya, {p.tanggal}</Text>
        <Text>{p.jabatanPenandatangan}</Text>
        {p.ttdDataUri ? <Image style={base.ttdImg} src={p.ttdDataUri} /> : null}
        <Text style={[base.bold, { marginTop: 6 }]}>{p.namaPenandatangan}</Text>
      </View>
    </View>
  );
}

export function SuratSKD(p: CommonProps) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>
            Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya, Kecamatan{" "}
            {p.kecamatan}, Kabupaten {p.kabupaten}, dengan ini menerangkan
            bahwa:
          </Text>
          <Text style={base.pair}>
            Nama Lengkap : <Text style={base.bold}>{p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK: <Text style={base.bold}>{p.nik}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Lengkap: <Text style={base.bold}>{p.alamat}</Text>
          </Text>
          {p.keperluan ? (
            <Text style={base.pair}>
              Keperluan: <Text style={base.bold}>{p.keperluan}</Text>
            </Text>
          ) : null}
          <Text style={{ marginTop: 10 }}>
            Adalah benar-benar penduduk Desa Mukti Jaya dan berdomisili di
            alamat tersebut di atas. Yang bersangkutan berkelakuan baik, tidak
            pernah terlibat masalah hukum, dan dikenal sebagai warga yang taat
            pada peraturan yang berlaku.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Surat keterangan domisili ini dibuat atas permintaan yang
            bersangkutan untuk {p.keperluan || "keperluan administrasi"} dan
            untuk dipergunakan sebagaimana mestinya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Demikian surat keterangan ini dibuat dengan sebenar-benarnya
            berdasarkan data yang ada dan dapat dipertanggungjawabkan.
          </Text>
        </View>
        <TTD {...p} />
      </Page>
    </Document>
  );
}

export function SuratSKU(
  p: CommonProps & {
    namaUsaha?: string;
    jenisUsaha?: string;
    alamatUsaha?: string;
  }
) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>
            Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya, Kecamatan{" "}
            {p.kecamatan}, Kabupaten {p.kabupaten}, dengan ini menerangkan
            bahwa:
          </Text>
          <Text style={base.pair}>
            Nama Lengkap: <Text style={base.bold}>{p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK: <Text style={base.bold}>{p.nik}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Rumah: <Text style={base.bold}>{p.alamat}</Text>
          </Text>
          <Text style={base.pair}>
            Nama Usaha:{" "}
            <Text style={base.bold}>{(p as any).namaUsaha || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Jenis Usaha:{" "}
            <Text style={base.bold}>{(p as any).jenisUsaha || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Usaha:{" "}
            <Text style={base.bold}>{(p as any).alamatUsaha || "-"}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            {""} Adalah benar-benar penduduk Desa Mukti Jaya dan memiliki usaha
            sebagaimana tersebut di atas. Usaha yang bersangkutan telah berjalan
            dengan baik dan sesuai dengan ketentuan yang berlaku di wilayah Desa
            Mukti Jaya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            {""} Yang bersangkutan dikenal sebagai pengusaha yang jujur,
            bertanggung jawab, dan tidak pernah melanggar peraturan yang berlaku
            dalam menjalankan usahanya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Surat keterangan usaha ini dibuat atas permintaan yang bersangkutan
            untuk {p.keperluan || "keperluan administrasi"} dan untuk
            dipergunakan sebagaimana mestinya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Demikian surat keterangan ini dibuat dengan sebenar-benarnya dan
            dapat dipertanggungjawabkan.
          </Text>
        </View>
        <TTD {...p} />
      </Page>
    </Document>
  );
}

export function SuratSKTM(p: CommonProps) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>
            Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya, Kecamatan{" "}
            {p.kecamatan}, Kabupaten {p.kabupaten}, dengan ini menerangkan
            bahwa:
          </Text>
          <Text style={base.pair}>
            Nama Lengkap : <Text style={base.bold}>{p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK: <Text style={base.bold}>{p.nik}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Lengkap: <Text style={base.bold}>{p.alamat}</Text>
          </Text>
          {p.keperluan ? (
            <Text style={base.pair}>
              Keperluan: <Text style={base.bold}>{p.keperluan}</Text>
            </Text>
          ) : null}
          <Text style={{ marginTop: 10 }}>
            Adalah benar-benar penduduk Desa Mukti Jaya yang tergolong dalam
            keluarga tidak mampu secara ekonomi. Berdasarkan data dan pengamatan
            di lapangan, yang bersangkutan memiliki kondisi ekonomi yang kurang
            mampu dan memerlukan bantuan.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Kondisi ekonomi keluarga yang bersangkutan berada di bawah garis
            kemiskinan dengan penghasilan yang tidak mencukupi untuk memenuhi
            kebutuhan hidup sehari-hari yang layak.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Surat keterangan tidak mampu ini dibuat atas permintaan yang
            bersangkutan untuk{" "}
            {p.keperluan || "keperluan administrasi bantuan sosial"} dan untuk
            dipergunakan sebagaimana mestinya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Demikian surat keterangan ini dibuat dengan sebenar-benarnya
            berdasarkan data dan kondisi yang ada serta dapat
            dipertanggungjawabkan.
          </Text>
        </View>
        <TTD {...p} />
      </Page>
    </Document>
  );
}
export function SuratSKBM(p: CommonProps) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>
            Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya, Kecamatan{" "}
            {p.kecamatan}, Kabupaten {p.kabupaten}, dengan ini menerangkan
            bahwa:
          </Text>
          <Text style={base.pair}>
            Nama Lengkap : <Text style={base.bold}>{p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK: <Text style={base.bold}>{p.nik}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Lengkap: <Text style={base.bold}>{p.alamat}</Text>
          </Text>
          {p.keperluan ? (
            <Text style={base.pair}>
              Keperluan: <Text style={base.bold}>{p.keperluan}</Text>
            </Text>
          ) : null}
          <Text style={{ marginTop: 10 }}>
            Adalah benar-benar penduduk Desa Mukti Jaya yang berkelakuan baik di
            lingkungan masyarakat. Berdasarkan pengamatan dan informasi dari
            masyarakat sekitar, yang bersangkutan dikenal sebagai pribadi yang:
          </Text>
          <Text style={base.pair}>1. Bermoral baik dan berakhlak mulia</Text>
          <Text style={base.pair}>
            2. Tidak pernah terlibat dalam tindakan kriminal atau pelanggaran
            hukum
          </Text>
          <Text style={base.pair}>
            3. Aktif dalam kegiatan kemasyarakatan dan gotong royong
          </Text>
          <Text style={base.pair}>
            4. Mentaati norma-norma yang berlaku di masyarakat
          </Text>
          <Text style={base.pair}>
            5. Tidak pernah mengganggu ketertiban dan keamanan lingkungan
          </Text>
          <Text style={{ marginTop: 8 }}>
            Yang bersangkutan juga dikenal sebagai warga yang taat beragama,
            sopan santun, dan memiliki hubungan baik dengan tetangga serta
            masyarakat sekitar.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Surat keterangan berkelakuan baik ini dibuat atas permintaan yang
            bersangkutan untuk {p.keperluan || "keperluan administrasi"} dan
            untuk dipergunakan sebagaimana mestinya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Demikian surat keterangan ini dibuat dengan sebenar-benarnya
            berdasarkan data dan fakta yang ada serta dapat
            dipertanggungjawabkan.
          </Text>
        </View>
        <TTD {...p} />
      </Page>
    </Document>
  );
}

export function SuratSKK(
  p: CommonProps & {
    namaAlmarhum?: string;
    nikAlmarhum?: string;
    tempatLahirAlmarhum?: string;
    tanggalLahirAlmarhum?: string;
    tanggalMeninggal?: string;
    alamatTerakhir?: string;
    namaPelapor?: string;
    hubunganPelapor?: string;
  }
) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>
            Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya, Kecamatan{" "}
            {p.kecamatan}, Kabupaten {p.kabupaten}, dengan ini menerangkan
            bahwa:
          </Text>
          <Text style={base.pair}>
            Nama Pelapor:{" "}
            <Text style={base.bold}>{(p as any).namaPelapor || p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK Pelapor: <Text style={base.bold}>{p.nik}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Pelapor: <Text style={base.bold}>{p.alamat}</Text>
          </Text>
          <Text style={base.pair}>
            Hubungan dengan Almarhum:{" "}
            <Text style={base.bold}>{(p as any).hubunganPelapor || "-"}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Dengan ini melaporkan bahwa telah meninggal dunia seorang penduduk
            Desa Mukti Jaya dengan data sebagai berikut:
          </Text>
          <Text style={base.pair}>
            Nama Almarhum/Almarhumah:{" "}
            <Text style={base.bold}>{(p as any).namaAlmarhum || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            NIK Almarhum:{" "}
            <Text style={base.bold}>{(p as any).nikAlmarhum || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Tempat Lahir:{" "}
            <Text style={base.bold}>
              {(p as any).tempatLahirAlmarhum || "-"}
            </Text>
          </Text>
          <Text style={base.pair}>
            Tanggal Lahir:{" "}
            <Text style={base.bold}>
              {(p as any).tanggalLahirAlmarhum || "-"}
            </Text>
          </Text>
          <Text style={base.pair}>
            Alamat Terakhir:{" "}
            <Text style={base.bold}>{(p as any).alamatTerakhir || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Tanggal Meninggal:{" "}
            <Text style={base.bold}>{(p as any).tanggalMeninggal || "-"}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Almarhum/Almarhumah adalah benar-benar penduduk Desa Mukti Jaya yang
            telah meninggal dunia pada tanggal tersebut di atas. Kematian
            tersebut telah dilaporkan kepada pihak yang berwenang dan telah
            dilakukan prosedur pemakaman sesuai dengan ketentuan yang berlaku.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Surat keterangan kematian ini dibuat berdasarkan laporan dari
            keluarga dan saksi-saksi yang dapat dipercaya serta sesuai dengan
            data administrasi kependudukan yang ada.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Surat keterangan ini dibuat untuk{" "}
            {p.keperluan || "keperluan administrasi"} dan untuk dipergunakan
            sebagaimana mestinya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Demikian surat keterangan kematian ini dibuat dengan
            sebenar-benarnya dan dapat dipertanggungjawabkan.
          </Text>
        </View>
        <TTD {...p} />
      </Page>
    </Document>
  );
}

export function SuratSKL(
  p: CommonProps & {
    namaBayi?: string;
    tempatLahirBayi?: string;
    tanggalLahirBayi?: string;
    jenisKelaminBayi?: string;
    namaAyah?: string;
    namaIbu?: string;
    alamatOrangTua?: string;
  }
) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>
            Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya, Kecamatan{" "}
            {p.kecamatan}, Kabupaten {p.kabupaten}, dengan ini menerangkan
            bahwa:
          </Text>
          <Text style={base.pair}>
            Nama Pelapor: <Text style={base.bold}>{p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK Pelapor: <Text style={base.bold}>{p.nik}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Pelapor: <Text style={base.bold}>{p.alamat}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Dengan ini melaporkan bahwa telah lahir seorang bayi dengan data
            sebagai berikut:
          </Text>
          <Text style={base.pair}>
            Nama Bayi:{" "}
            <Text style={base.bold}>{(p as any).namaBayi || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Tempat Lahir:{" "}
            <Text style={base.bold}>{(p as any).tempatLahirBayi || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Tanggal Lahir:{" "}
            <Text style={base.bold}>{(p as any).tanggalLahirBayi || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Jenis Kelamin:{" "}
            <Text style={base.bold}>{(p as any).jenisKelaminBayi || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Nama Ayah:{" "}
            <Text style={base.bold}>{(p as any).namaAyah || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Nama Ibu: <Text style={base.bold}>{(p as any).namaIbu || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Orang Tua:{" "}
            <Text style={base.bold}>{(p as any).alamatOrangTua || "-"}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Kelahiran bayi tersebut telah terjadi di wilayah Desa Mukti Jaya dan
            telah dilaporkan kepada pihak yang berwenang. Kedua orang tua bayi
            adalah penduduk Desa Mukti Jaya yang terdaftar dan memiliki domisili
            tetap di wilayah ini.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Kelahiran ini telah disaksikan oleh bidan/tenaga kesehatan dan
            masyarakat setempat. Proses persalinan berjalan dengan lancar dan
            bayi lahir dalam keadaan sehat.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Surat keterangan kelahiran ini dibuat berdasarkan laporan dari
            keluarga dan saksi-saksi yang dapat dipercaya untuk{" "}
            {p.keperluan || "keperluan administrasi kependudukan"} dan untuk
            dipergunakan sebagaimana mestinya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Demikian surat keterangan kelahiran ini dibuat dengan
            sebenar-benarnya dan dapat dipertanggungjawabkan.
          </Text>
        </View>
        <TTD {...p} />
      </Page>
    </Document>
  );
}

export function SuratSKPD(
  p: CommonProps & {
    alamatTujuan?: string;
    asalDaerah?: string;
    alasanPindah?: string;
  }
) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>
            Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya, Kecamatan{" "}
            {p.kecamatan}, Kabupaten {p.kabupaten}, dengan ini menerangkan
            bahwa:
          </Text>
          <Text style={base.pair}>
            Nama Lengkap: <Text style={base.bold}>{p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK: <Text style={base.bold}>{p.nik}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Asal: <Text style={base.bold}>{p.alamat}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Adalah benar-benar penduduk Desa Mukti Jaya yang akan melakukan
            perpindahan domisili dengan data sebagai berikut:
          </Text>
          <Text style={base.pair}>
            Asal Daerah:{" "}
            <Text style={base.bold}>
              {(p as any).asalDaerah || "Desa Mukti Jaya"}
            </Text>
          </Text>
          <Text style={base.pair}>
            Alamat Tujuan:{" "}
            <Text style={base.bold}>{(p as any).alamatTujuan || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Alasan Pindah:{" "}
            <Text style={base.bold}>{(p as any).alasanPindah || "-"}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Yang bersangkutan telah melengkapi semua persyaratan administrasi
            yang diperlukan untuk kepindahan domisili. Selama menjadi penduduk
            Desa Mukti Jaya, yang bersangkutan berkelakuan baik, tidak pernah
            terlibat masalah hukum, dan aktif dalam kegiatan kemasyarakatan.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Tidak ada catatan pelanggaran hukum atau masalah administrasi yang
            menghalangi proses perpindahan domisili yang bersangkutan. Semua
            kewajiban sebagai penduduk telah dipenuhi dengan baik.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Surat keterangan pindah domisili ini dibuat atas permintaan yang
            bersangkutan untuk{" "}
            {p.keperluan || "keperluan administrasi perpindahan"} dan untuk
            dipergunakan sebagaimana mestinya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Demikian surat keterangan pindah domisili ini dibuat dengan
            sebenar-benarnya dan dapat dipertanggungjawabkan.
          </Text>
        </View>
        <TTD {...p} />
      </Page>
    </Document>
  );
}

export function SuratSKPK(
  p: CommonProps & { alamatTujuan?: string; alasanPindah?: string }
) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>
            Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya, Kecamatan{" "}
            {p.kecamatan}, Kabupaten {p.kabupaten}, dengan ini menerangkan
            bahwa:
          </Text>
          <Text style={base.pair}>
            Nama Lengkap: <Text style={base.bold}>{p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK: <Text style={base.bold}>{p.nik}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Asal: <Text style={base.bold}>{p.alamat}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Akan melakukan perpindahan kependudukan dari Desa Mukti Jaya ke
            alamat yang baru dengan data sebagai berikut:
          </Text>
          <Text style={base.pair}>
            Alamat Tujuan:{" "}
            <Text style={base.bold}>{(p as any).alamatTujuan || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Alasan Pindah:{" "}
            <Text style={base.bold}>{(p as any).alasanPindah || "-"}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Yang bersangkutan adalah penduduk Desa Mukti Jaya yang telah
            terdaftar dalam data kependudukan dan memiliki dokumen-dokumen yang
            sah. Selama menjadi penduduk di wilayah ini, yang bersangkutan
            berkelakuan baik dan tidak memiliki catatan pelanggaran.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Perpindahan kependudukan ini dilakukan sesuai dengan ketentuan
            peraturan perundang-undangan yang berlaku dan telah memenuhi
            persyaratan administrasi yang diperlukan.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Dengan perpindahan ini, yang bersangkutan akan melakukan pelaporan
            kepindahan kependudukan ke instansi terkait di daerah tujuan sesuai
            dengan prosedur yang berlaku.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Surat keterangan pindah kependudukan ini dibuat untuk{" "}
            {p.keperluan || "keperluan administrasi perpindahan kependudukan"}{" "}
            dan untuk dipergunakan sebagaimana mestinya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Demikian surat keterangan ini dibuat dengan sebenar-benarnya dan
            dapat dipertanggungjawabkan.
          </Text>
        </View>
        <TTD {...p} />
      </Page>
    </Document>
  );
}

export function SuratSKKT(
  p: CommonProps & {
    alamatTanah?: string;
    luasTanah?: string;
    statusKepemilikan?: string;
  }
) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>
            Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya, Kecamatan{" "}
            {p.kecamatan}, Kabupaten {p.kabupaten}, dengan ini menerangkan
            bahwa:
          </Text>
          <Text style={base.pair}>
            Nama Lengkap: <Text style={base.bold}>{p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK: <Text style={base.bold}>{p.nik}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Tempat Tinggal: <Text style={base.bold}>{p.alamat}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Adalah benar-benar penduduk Desa Mukti Jaya yang memiliki
            kepemilikan tanah dengan data sebagai berikut:
          </Text>
          <Text style={base.pair}>
            Alamat/Lokasi Tanah:{" "}
            <Text style={base.bold}>{(p as any).alamatTanah || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Luas Tanah:{" "}
            <Text style={base.bold}>{(p as any).luasTanah || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Status Kepemilikan:{" "}
            <Text style={base.bold}>{(p as any).statusKepemilikan || "-"}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Tanah tersebut berada di wilayah Desa Mukti Jaya dan telah
            dikuasai/dimiliki oleh yang bersangkutan secara turun temurun atau
            melalui jual beli yang sah. Tidak ada sengketa atau permasalahan
            hukum terkait dengan tanah tersebut.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Kepemilikan tanah ini telah diketahui dan diakui oleh masyarakat
            sekitar serta tidak ada pihak lain yang mengklaim atau
            mempermasalahkan kepemilikan tanah tersebut.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Yang bersangkutan selama ini telah memanfaatkan tanah tersebut
            dengan baik dan sesuai dengan ketentuan yang berlaku di wilayah Desa
            Mukti Jaya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Surat keterangan kepemilikan tanah ini dibuat atas permintaan yang
            bersangkutan untuk{" "}
            {p.keperluan || "keperluan administrasi pertanahan"} dan untuk
            dipergunakan sebagaimana mestinya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Demikian surat keterangan kepemilikan tanah ini dibuat dengan
            sebenar-benarnya dan dapat dipertanggungjawabkan.
          </Text>
        </View>
        <TTD {...p} />
      </Page>
    </Document>
  );
}

export function SuratSKAW(
  p: CommonProps & {
    namaPewaris?: string;
    namaAhliWaris?: string;
    hubunganAhliWaris?: string;
  }
) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>
            Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya, Kecamatan{" "}
            {p.kecamatan}, Kabupaten {p.kabupaten}, dengan ini menerangkan
            bahwa:
          </Text>
          <Text style={base.pair}>
            Nama Pemohon: <Text style={base.bold}>{p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK: <Text style={base.bold}>{p.nik}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat: <Text style={base.bold}>{p.alamat}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Adalah benar-benar penduduk Desa Mukti Jaya dan merupakan ahli waris
            yang sah dari almarhum/almarhumah dengan data sebagai berikut:
          </Text>
          <Text style={base.pair}>
            Nama Pewaris (Almarhum/Almarhumah):{" "}
            <Text style={base.bold}>{(p as any).namaPewaris || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Nama Ahli Waris:{" "}
            <Text style={base.bold}>{(p as any).namaAhliWaris || p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            Hubungan Keluarga:{" "}
            <Text style={base.bold}>{(p as any).hubunganAhliWaris || "-"}</Text>
          </Text>
          <Text style={{ marginTop: 10 }}>
            Berdasarkan keterangan dari keluarga dan masyarakat sekitar, yang
            bersangkutan adalah ahli waris yang sah dan memiliki hak waris yang
            tidak terbantahkan dari almarhum/almarhumah tersebut.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Tidak ada ahli waris lain yang mempermasalahkan atau mengklaim hak
            waris yang sama. Hubungan keluarga antara pewaris dan ahli waris
            telah diketahui dan diakui oleh masyarakat setempat.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Yang bersangkutan memiliki kedudukan yang sah sebagai ahli waris
            sesuai dengan hukum yang berlaku dan telah memenuhi persyaratan
            sebagai penerima warisan.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Surat keterangan ahli waris ini dibuat atas permintaan yang
            bersangkutan untuk {p.keperluan || "keperluan administrasi warisan"}{" "}
            dan untuk dipergunakan sebagaimana mestinya.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Demikian surat keterangan ahli waris ini dibuat dengan
            sebenar-benarnya berdasarkan data dan keterangan yang dapat
            dipercaya serta dapat dipertanggungjawabkan.
          </Text>
        </View>
        <TTD {...p} />
      </Page>
    </Document>
  );
}

export function getLetterComponentByCode(kode: string) {
  switch ((kode || "").toUpperCase()) {
    case "SKU":
      return SuratSKU;
    case "SKTM":
      return SuratSKTM;
    case "SKBM":
      return SuratSKBM;
    case "SKK":
      return SuratSKK;
    case "SKL":
      return SuratSKL;
    case "SKPD":
      return SuratSKPD;
    case "SKPK":
      return SuratSKPK;
    case "SKKT":
      return SuratSKKT;
    case "SKAW":
      return SuratSKAW;
    case "SKD":
    default:
      return SuratSKD;
  }
}
