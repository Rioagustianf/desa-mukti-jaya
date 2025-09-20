import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  View,
  Text,
  Image,
} from "@react-pdf/renderer";

export interface SuratProps {
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
}

const styles = StyleSheet.create({
  page: { paddingTop: 28, paddingHorizontal: 22, fontSize: 11, color: "#000" },
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
  content: { marginTop: 14, lineHeight: 1.5 },
  pair: { marginTop: 4 },
  ttdWrapper: { flexDirection: "row", marginTop: 24 },
  ttdBox: { width: 220, marginLeft: "auto", textAlign: "center" },
  ttdImg: { width: 140, height: 70, marginTop: 6, alignSelf: "center" },
  bold: { fontWeight: 700 },
});

export const SuratKeterangan = (p: SuratProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image style={styles.logo} src={p.logoDataUri} />
        <View style={styles.headerCenter}>
          <Text style={styles.kab}>{p.kabupaten}</Text>
          <Text style={styles.kec}>{p.kecamatan}</Text>
          <Text style={styles.desaTxt}>{p.desa}</Text>
          <Text style={styles.alamat}>{p.alamatDesa}</Text>
        </View>
      </View>
      <View style={styles.divider} />

      <Text style={styles.title}>{p.judulSurat}</Text>
      <Text style={styles.nomor}>Nomor: {p.nomorSurat}</Text>

      <View style={styles.content}>
        <Text>
          Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya, Kecamatan{" "}
          {p.kecamatan}, Kabupaten {p.kabupaten}, dengan ini menerangkan bahwa:
        </Text>
        <Text style={styles.pair}>
          Nama Lengkap: <Text style={styles.bold}>{p.nama}</Text>
        </Text>
        <Text style={styles.pair}>
          NIK: <Text style={styles.bold}>{p.nik}</Text>
        </Text>
        <Text style={styles.pair}>
          Alamat Lengkap: <Text style={styles.bold}>{p.alamat}</Text>
        </Text>
        {p.keperluan ? (
          <Text style={styles.pair}>
            Keperluan: <Text style={styles.bold}>{p.keperluan}</Text>
          </Text>
        ) : null}
        <Text style={{ marginTop: 10 }}>
          Adalah benar-benar penduduk Desa Mukti Jaya yang berdomisili di alamat
          tersebut di atas. Yang bersangkutan dikenal sebagai warga yang:
        </Text>
        <Text style={styles.pair}>1. Berkelakuan baik dan bermoral</Text>
        <Text style={styles.pair}>
          2. Tidak pernah terlibat dalam tindakan kriminal
        </Text>
        <Text style={styles.pair}>3. Aktif dalam kegiatan kemasyarakatan</Text>
        <Text style={styles.pair}>4. Taat pada peraturan yang berlaku</Text>
        <Text style={{ marginTop: 10 }}>
          Surat keterangan ini dibuat atas permintaan yang bersangkutan untuk{" "}
          {p.keperluan || "keperluan administrasi"} dan untuk dipergunakan
          sebagaimana mestinya.
        </Text>
        <Text style={{ marginTop: 8 }}>
          Demikian surat keterangan ini dibuat dengan sebenar-benarnya
          berdasarkan data yang ada dan dapat dipertanggungjawabkan.
        </Text>
      </View>

      <View style={styles.ttdWrapper}>
        <View style={styles.ttdBox}>
          <Text>Mukti Jaya, {p.tanggal}</Text>
          <Text>{p.jabatanPenandatangan}</Text>
          {p.ttdDataUri ? (
            <Image style={styles.ttdImg} src={p.ttdDataUri} />
          ) : null}
          <Text style={[styles.bold, { marginTop: 6 }]}>
            {p.namaPenandatangan}
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);
