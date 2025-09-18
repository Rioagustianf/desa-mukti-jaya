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
        <Image style={base.logo} src={p.logoDataUri} />
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
            Yang bertanda tangan di bawah ini, Kepala Desa Mukti Jaya,
            menerangkan:
          </Text>
          <Text style={base.pair}>
            Nama: <Text style={base.bold}>{p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK: <Text style={base.bold}>{p.nik}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat: <Text style={base.bold}>{p.alamat}</Text>
          </Text>
          {p.keperluan ? (
            <Text style={base.pair}>
              Keperluan: <Text style={base.bold}>{p.keperluan}</Text>
            </Text>
          ) : null}
          <Text style={{ marginTop: 10 }}>
            Demikian untuk dipergunakan sebagaimana mestinya.
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
          <Text>Dengan ini menerangkan data usaha berikut:</Text>
          <Text style={base.pair}>
            Nama Pemohon: <Text style={base.bold}>{p.nama}</Text>
          </Text>
          <Text style={base.pair}>
            NIK: <Text style={base.bold}>{p.nik}</Text>
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
        </View>
        <TTD {...p} />
      </Page>
    </Document>
  );
}

export function SuratSKTM(p: CommonProps) {
  return <SuratSKD {...p} />;
}
export function SuratSKBM(p: CommonProps) {
  return <SuratSKD {...p} />;
}

export function SuratSKK(
  p: CommonProps & {
    namaAlmarhum?: string;
    tanggalMeninggal?: string;
    alamatTerakhir?: string;
  }
) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>Telah meninggal dunia:</Text>
          <Text style={base.pair}>
            Nama:{" "}
            <Text style={base.bold}>{(p as any).namaAlmarhum || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Terakhir:{" "}
            <Text style={base.bold}>{(p as any).alamatTerakhir || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Tanggal Meninggal:{" "}
            <Text style={base.bold}>{(p as any).tanggalMeninggal || "-"}</Text>
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
    tanggalLahirBayi?: string;
    namaAyah?: string;
    namaIbu?: string;
  }
) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Kop {...p} />
        <View style={base.section}>
          <Text>Telah lahir seorang anak:</Text>
          <Text style={base.pair}>
            Nama Bayi:{" "}
            <Text style={base.bold}>{(p as any).namaBayi || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Tanggal Lahir:{" "}
            <Text style={base.bold}>{(p as any).tanggalLahirBayi || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Ayah: <Text style={base.bold}>{(p as any).namaAyah || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Ibu: <Text style={base.bold}>{(p as any).namaIbu || "-"}</Text>
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
          <Text>Data kepindahan:</Text>
          <Text style={base.pair}>
            Asal Daerah:{" "}
            <Text style={base.bold}>{(p as any).asalDaerah || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Alamat Tujuan:{" "}
            <Text style={base.bold}>{(p as any).alamatTujuan || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Alasan Pindah:{" "}
            <Text style={base.bold}>{(p as any).alasanPindah || "-"}</Text>
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
  return <SuratSKPD {...p} />;
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
          <Text>Data tanah:</Text>
          <Text style={base.pair}>
            Alamat Tanah:{" "}
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
          <Text>Data ahli waris:</Text>
          <Text style={base.pair}>
            Nama Pewaris:{" "}
            <Text style={base.bold}>{(p as any).namaPewaris || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Nama Ahli Waris:{" "}
            <Text style={base.bold}>{(p as any).namaAhliWaris || "-"}</Text>
          </Text>
          <Text style={base.pair}>
            Hubungan:{" "}
            <Text style={base.bold}>{(p as any).hubunganAhliWaris || "-"}</Text>
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
