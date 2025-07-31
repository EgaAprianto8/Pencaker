    // components/ui/sektor-jabatan-map.ts

    export const sektorJabatanMap = [
    { sektor: "Manajerial", jabatan: ["manajer", "manajemen/direksi", "supervisor"] }, // Tambahkan 'manajemen/direksi', 'supervisor'
    { sektor: "Profesional, Ilmiah, & Teknis", jabatan: [
        "tenaga profesional", "teknisi dan asisten profesional",
        "aktivitas profesional, ilmiah, dan teknis", "it/software", // Tambahkan
        "engineer", "analis", "konsultasi", "desain/kreatif", // Tambahkan
        "riset/penelitian", "arsitektur/tata kota", "multimedia",
        "jasa profesional", "drafter", "informatika", "hukum",
        "laboratorium"
    ]},
    { sektor: "Administrasi & Tata Usaha", jabatan: ["tenaga tata usaha", "administrasi/staf umum", "resepsionis", "arsiparis", "staff", "staff purchasing"] }, // Tambahkan
    { sektor: "Jasa & Penjualan", jabatan: [
        "tenaga usaha jasa dan tenaga penjualan",
        "perdagangan besar dan eceran, reparasi, dan perawatan mobil dan sepeda motor.",
        "sales/marketing", "customer service/telemarketing", // Tambahkan
        "pramuniaga spg  kasir", "retail", "brand ambassador", "e-commerce"
    ]},
    { sektor: "Pertanian, Kehutanan, & Perikanan", jabatan: ["pekerja terampil pertanian, kehutanan, dan perikanan", "pertanian tanaman padi dan palawijaya", "hortikultura", "perkebunan", "perikanan", "peternakan", "kehutanan dan pertanian lainnya", "pertanian/agribisnis"] }, // Tambahkan
    { sektor: "Industri & Konstruksi", jabatan: [
        "pekerja pengolahan, kerajinan, dan yang berhubungan dengan itu",
        "operator dan perakitan mesin", "industri pengolahan", "konstruksi",
        "produksi/operasional", "teknisi/maintenance", "quality control/assurance",
        "pabrik/manufaktur", "produksi  manufaktur", "bagian produksi  kasir"
    ]}, // Tambahkan
    { sektor: "Pekerja Kasar & Umum", jabatan: ["pekerja kasar", "pekerja umum", "lapangan"] }, // Tambahkan 'pekerja umum'
    { sektor: "Layanan Publik & Sosial", jabatan: [
        "administrasi pemerintahan, pertahanan, dan jaminan sosial wajib",
        "pendidikan", "aktivitas kesehatan manusia dan aktivitas sosial",
        "kesenian, hiburan dan rekreasi", "aktivitas jasa lainnya",
        "tentara nasional indonesia (tni) dan kepolisian negara republik indonesia (polri)",
        "perawat", "tenaga kesehatan (umum)", "dokter", // Tambahkan
        "pelayanan publik/pemerintahan", "keamanan/perlindungan", "personalia/hrd",
        "kecantikan", "olahraga"
    ]},
    { sektor: "Akomodasi & Transportasi", jabatan: [
        "pengangkutan dan pergudangan", "penyediaan akomodasi dan penyediaan makan minum",
        "logistik/gudang", "hotel/restoran", "transportasi", "pelaut/kelautan"
    ]}, // Tambahkan
    { sektor: "Utilitas & Lingkungan", jabatan: ["pengadaan listrik, gas, uap/air panas, dan udara dingin", "pengelolaan air, pengelolaan air limbah, pengelolaan dan daur ulang sampah, aktivitas remediasi", "lingkungan"] }, // Tambahkan
    { sektor: "Keuangan & Asuransi", jabatan: ["aktivitas keuangan dan asuransi", "keuangan/akuntansi/perbankan"] }, // Tambahkan sektor baru atau masukkan ke "Lainnya"
    { sektor: "Lainnya", jabatan: [
        "informasi dan komunikasi", "real estate", "aktivitas penyewaan dan sewa guna tanpa hak opsi, ketenagakerjaan, agen perjalanan, dan penunjang usaha lainnya",
        "aktivitas rumah tangga sebagai pemberi kerja", "aktivitas badan internasional dan badan ekstra internasional lainnya",
        "lain-lain", "bisnis/wirausaha", "kartap", "magang", "tenaga kerja migran"
    ]}
    ];

    export const sektorOptions = sektorJabatanMap.map(item => item.sektor);