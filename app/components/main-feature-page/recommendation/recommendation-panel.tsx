/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Bot } from 'lucide-react';

// Definitions (Anda mungkin perlu memindahkan ini ke file types.ts jika banyak digunakan di berbagai komponen)
interface SektorJabatanMapItem {
    sektor: string;
    jabatan: string[];
}

type DataItem = {
    original_index: string;
    TGL_LAHIR: string;
    JENIS_KELAMIN: string;
    TANGGAL_DAFTAR: string;
    KECAMATAN: string;
    PENDIDIKAN: string;
    JURUSAN: string;
    TAHUN_LULUS: string;
    Keterampilan: string;
    UPAH_DIINGINKAN: string;
    JABATAN_DIINGINKAN: string;
    WILAYAH_DIINGINKAN: string;
    WILAYAH_DIINGINKAN_DETAIL: string;
    UMUR_SAAT_DAFTAR: string;
    JABATAN_DIINGINKAN_Normalized: string;
    wilayah_diinginkan_detail_normalized: string;
    keterampilan_cleaned: string;
};

type ProcessedJobData = {
    jabatan: string;
    peminat: number;
};

interface InsightResult {
    highestDemandJob: ProcessedJobData;
    lowestDemandJob: ProcessedJobData;
    lowDemandHighWageJob: {
        jabatan: string;
        peminat: number;
        wageCategories: string;
    } | null;
    highWageJobTrend: string | null;
}

// Helper functions (Anda mungkin perlu memindahkan ini ke file terpisah dan diimpor)
const cleanData = (value: any): string => {
    if (typeof value !== 'string') return '';
    return value.replace(/\[\'|\'\]/g, '').trim();
};

const capitalizeWords = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

const parseSalary = (gaji: string): number => {
    if (!gaji || typeof gaji !== 'string') return 0;
    const cleaned = gaji.replace(/rp|\.| /gi, '').split('-')[0];
    return parseInt(cleaned, 10) || 0;
};

// Interface untuk props RecommendationPanel (diambil dari MainFeature)
interface RecommendationPanelProps {
    insight: InsightResult | null;
    selectedSector: string;
    selectedPendidikan: string;
    selectedGaji: string;
    jobDemandData: ProcessedJobData[];
    jobWageDemandData: { name: string; [key: string]: string | number }[];
    historicalChartData: any[]; // Data tren historis
    selectedJabatanForTrend: string[];
    selectedJabatanAI: string;
    onSelectJabatanAI: (jabatan: string) => void;
    availableJabatanForAI: string[];
}

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
    insight,
    selectedSector,
    selectedPendidikan,
    selectedGaji,
    jobDemandData,
    jobWageDemandData,
    historicalChartData,
    selectedJabatanForTrend,
    selectedJabatanAI,
    onSelectJabatanAI,
    availableJabatanForAI
}) => {

    // --- Definisi Variasi Kalimat ---
    const greetingPhrases = [
        "Halo! Saya adalah AI Asisten Anda. Berdasarkan data profil dan filter yang Anda pilih",
        "Selamat datang! Sebagai AI Asisten Anda, saya telah menganalisis data berdasarkan preferensi Anda",
        "Hai! Dengan informasi yang Anda berikan (filter dan profil Anda), saya, AI Asisten Anda, telah melakukan analisis",
        "Salam! Berbekal filter dan data profil Anda, saya sebagai AI Asisten, siap memberikan insight",
        "Halo! Saya, AI Asisten Anda, telah merangkum informasi penting berdasarkan pilihan filter Anda"
    ];

    const specificJobPhrases = [
        (gajiText: string, peminatText: string, persainganText: string) => `Ini adalah posisi dengan ${gajiText} (${peminatText}) namun dengan ${peminatText} di sektor ini, menunjukkan ${persainganText}.`,
        (gajiText: string, peminatText: string, persainganText: string) => `Untuk posisi ini, kami melihat ${gajiText} didukung oleh ${peminatText} di sektor terkait. Ini mengindikasikan ${persainganText}.`,
        (gajiText: string, peminatText: string, persainganText: string) => `Jabatan ini menawarkan ${gajiText} ${peminatText} di sektor ini, yang berpotensi memberikan ${persainganText}.`,
        (gajiText: string, peminatText: string, persainganText: string) => `Dengan ${gajiText} dan ${peminatText} di sektor ini, posisi ini memiliki ${persainganText}.`,
        (gajiText: string, peminatText: string, persainganText: string) => `Analisis menunjukkan bahwa posisi ini memiliki ${gajiText} dan ${peminatText} di sektor yang Anda pilih, sehingga ${persainganText}.`
    ];

    const highWageOpportunityPhrases = [
        (wageCats: string) => `Ini adalah posisi dengan potensi <span class="font-bold text-green-700">gaji tinggi (${wageCats})</span> namun dengan jumlah peminat yang relatif <span class="font-bold text-green-700">rendah</span> di sektor ini, menunjukkan peluang persaingan yang lebih baik.`,
        (wageCats: string) => `Posisi ini menarik karena menawarkan rentang gaji yang <span class="font-bold text-green-700">menguntungkan (${wageCats})</span>, dan yang terpenting, peminatnya masih <span class="font-bold text-green-700">tidak terlalu banyak</span>, sehingga membuka celah persaingan yang menjanjikan.`,
        (wageCats: string) => `Jika Anda mencari peluang dengan imbalan finansial <span class="font-bold text-green-700">tinggi (${wageCats})</span> dan ingin menghindari keramaian, jabatan ini adalah pilihan tepat karena peminatnya masih <span class="font-bold text-green-700">relatif sedikit</span>.`,
        (wageCats: string) => `Ditemukan bahwa posisi ini memiliki potensi <span class="font-bold text-green-700">gaji yang besar (${wageCats})</span> dan kabar baiknya, jumlah pelamarnya <span class="font-bold text-green-700">tidak sebanyak</span> posisi populer lain, meningkatkan prospek Anda.`
    ];

    const hiddenGemPhrases = [
        `Sebagai posisi dengan jumlah peminat paling <span class="font-bold text-yellow-700">rendah</span> di sektor ini, ini bisa menjadi 'permata tersembunyi' dengan potensi persaingan yang lebih sedikit.`,
        `Ini adalah 'permata tersembunyi' di sektor ini! Dengan peminat yang <span class="font-bold text-yellow-700">sangat rendah</span>, Anda memiliki kesempatan besar untuk menonjol.`,
        `Cari tahu lebih banyak tentang posisi ini! Jumlah peminatnya <span class="font-bold text-yellow-700">terendah</span> di sektor yang Anda pilih, artinya kompetisi tidak seberapa.`,
        `Peluang besar menanti! Posisi ini mencatat peminat <span class="font-bold text-yellow-700">paling sedikit</span>, menjadikannya arena persaingan yang lebih santai.`
    ];

    const highDemandPhrases = [
        `Sebagai posisi yang paling <span class="font-bold text-blue-700">diminati</span> di sektor ini. Perhatikan bahwa persaingan untuk posisi ini mungkin sangat tinggi.`,
        `Ini adalah jabatan yang <span class="font-bold text-blue-700">sangat populer</span> di sektor Anda. Bersiaplah untuk persaingan ketat!`,
        `Daftar posisi ini sedang <span class="font-bold text-blue-700">ramai peminat</span>. Artinya, banyak yang mengincar posisi serupa di sektor ini.`,
        `Jabatan ini menunjukkan tingkat <span class="font-bold text-blue-700">peminat tertinggi</span> di antara pilihan Anda. Persaingan ketat adalah hal yang lumrah.`
    ];

    const neutralRecommendationPhrase = "Data tidak cukup untuk rekomendasi spesifik, atau tidak ada pola yang menonjol. Kami akan terus memantau dan memberikan insight terbaik.";

    // --- Frasa Saran Tambahan yang Bervariasi ---
    const actionableAdvicePhrases = {
        highPotential: [ // Untuk gaji tinggi / persaingan rendah
            `Jika jabatan ini selaras dengan hasrat dan keahlian Anda, ini adalah momen emas untuk fokus mengembangkan portofolio dan jaringan. Persiapkan diri Anda sebaik mungkin!`,
            `Mengingat potensi dan tingkat persaingan yang menguntungkan, segera ambil langkah proaktif. Asah terus keterampilan Anda dan eksplorasi perusahaan-perusahaan yang relevan.`,
            `Ini bisa menjadi jalur karier yang sangat menjanjikan. Manfaatkan peluang ini dengan memperdalam pengetahuan, mencari mentor, dan membuat profil Anda semakin menonjol.`,
            `Jangan lewatkan kesempatan ini jika sesuai dengan minat Anda! Perkuat CV/resume dan coba jalin koneksi dengan profesional di bidang ini.`
        ],
        competitive: [ // Untuk persaingan tinggi
            `Mengingat tingkat persaingan yang ada, fokuslah pada diferensiasi. Apa yang membuat Anda unik? Tonjolkan keunggulan spesifik dan pengalaman relevan Anda.`,
            `Untuk bersaing di posisi ini, strategi adalah kunci. Pertimbangkan untuk mendapatkan sertifikasi tambahan atau pengalaman magang yang akan membuat Anda selangkah di depan.`,
            `Dalam medan persaingan ketat ini, personalisasi aplikasi Anda sangat penting. Tunjukkan antusiasme dan bagaimana keahlian Anda benar-benar cocok dengan kebutuhan perusahaan.`,
            `Jangan menyerah! Meski kompetitif, dengan persiapan matang, seperti menguasai wawancara dan membangun portofolio kuat, Anda tetap punya peluang.`
        ],
        lowDemand: [ // Untuk peminat rendah
            `Posisi dengan peminat rendah seringkali terlewatkan. Jika Anda tertarik, lakukan riset mendalam. Mungkin ada niche atau keuntungan tersembunyi yang bisa Anda manfaatkan.`,
            `Ini bisa menjadi jalan pintas menuju karier jika Anda pionir. Pelajari mengapa peminatnya sedikit dan apakah itu sesuai dengan toleransi risiko dan tujuan Anda.`,
            `Jangan ragu menjelajahi area ini! Kadang, peluang terbaik ada di tempat yang kurang populer. Temukan nilai unik yang bisa Anda tawarkan pada jabatan ini.`
        ],
        general: [ // Saran umum jika tidak ada kondisi khusus yang menonjol
            `Pastikan profil Anda selalu terbaru dan mencerminkan keterampilan yang relevan.`,
            `Jelajahi berbagai sumber lowongan untuk menemukan posisi yang paling sesuai.`,
            `Manfaatkan setiap kesempatan untuk terus belajar dan beradaptasi dengan tren pasar.`,
            `Berinteraksi dengan profesional di industri ini dapat membuka pintu peluang baru.`
        ]
    };

    const getRandomPhrase = (phrases: string[] | ((...args: any[]) => string)[]) => {
        return phrases[Math.floor(Math.random() * phrases.length)];
    };


    const generateStrongestRecommendation = useMemo(() => {
        let recommendedJob = {
            name: 'Tidak Ditemukan',
            reason: neutralRecommendationPhrase,
            type: 'neutral',
            peminat: 0,
            wageCategories: '',
            adviceText: '' // Properti baru untuk saran tambahan
        };

        const currentSectorFormatted = selectedSector || 'Tidak Ditentukan';
        const currentPendidikanFormatted = selectedPendidikan === 'all' ? 'Semua Tingkat' : selectedPendidikan || 'Tidak Ditentukan';
        const currentGajiFormatted = selectedGaji === 'all' ? 'Semua Rentang' : selectedGaji || 'Tidak Ditentukan';

        const targetJobData = selectedJabatanAI === 'all'
            ? null
            : jobDemandData.find(job => job.jabatan.toLowerCase() === capitalizeWords(selectedJabatanAI).toLowerCase());

        const targetJobWageData = selectedJabatanAI === 'all'
            ? null
            : jobWageDemandData.find(job => job.name.toLowerCase() === capitalizeWords(selectedJabatanAI).toLowerCase());
        
        // Dapatkan semua rentang gaji yang mungkin untuk mendapatkan range min/max
        const allWageOptions = jobWageDemandData.flatMap(job => 
            Object.keys(job).filter(key => key !== 'name' && typeof job[key] === 'number')
        );
        const uniqueAllWageRanges = [...new Set(allWageOptions)].sort((a, b) => parseSalary(a) - parseSalary(b));
        
        let minOverallSalary = 0;
        let maxOverallSalary = 0;

        if (uniqueAllWageRanges.length > 0) {
            minOverallSalary = parseSalary(uniqueAllWageRanges[0]);
            maxOverallSalary = parseSalary(uniqueAllWageRanges[uniqueAllWageRanges.length - 1].split('-')[1]);
        }

        let currentGajiPotensiText = 'potensi gaji normal';
        let currentPeminatStatusText = 'jumlah peminat yang relatif <span class="font-bold text-gray-700">normal</span>';
        let currentPeluangPersainganText = 'peluang persaingan yang normal';
        let currentCompetitionLevel = 0; // Untuk menentukan jenis saran


        // Logic for specific job selection
        if (selectedJabatanAI && selectedJabatanAI !== 'all' && targetJobData) {
            const currentPeminat = targetJobData.peminat;
            const currentJobName = targetJobData.jabatan;

            let gajiCategoriesDisplay = 'Tidak ada data gaji';

            if (targetJobWageData) {
                const wagesForThisJob = Object.keys(targetJobWageData)
                    .filter(key => key !== 'name' && (targetJobWageData[key] as number) > 0)
                    .map(key => ({
                        range: key,
                        count: targetJobWageData[key] as number,
                        minVal: parseSalary(key)
                    }))
                    .sort((a, b) => a.minVal - b.minVal); // Urutkan dari gaji terendah ke tertinggi

                if (wagesForThisJob.length > 0) {
                    gajiCategoriesDisplay = wagesForThisJob.map(w => w.range).join(', ');

                    const topWageThreshold = maxOverallSalary * 0.7; // Misalnya, di atas 70% dari gaji tertinggi keseluruhan
                    const bottomWageThreshold = minOverallSalary * 1.3; // Misalnya, di bawah 130% dari gaji terendah keseluruhan

                    let hasHighWage = false;
                    let hasLowWage = false;

                    wagesForThisJob.forEach(w => {
                        const wageMin = parseSalary(w.range);
                        const wageMax = parseSalary(w.range.split('-')[1]); // Ambil nilai max dari range
                        if (wageMax && wageMax >= topWageThreshold) { // Pastikan wageMax ada
                            hasHighWage = true;
                        }
                        if (wageMin && wageMin <= bottomWageThreshold) { // Pastikan wageMin ada
                            hasLowWage = true;
                        }
                    });

                    if (hasHighWage && !hasLowWage) {
                        currentGajiPotensiText = 'potensi <span class="font-bold text-green-700">gaji tinggi</span>';
                    } else if (hasLowWage && !hasHighWage) {
                        currentGajiPotensiText = 'potensi <span class="font-bold text-red-700">gaji rendah</span>';
                    } else if (hasHighWage && hasLowWage) {
                        currentGajiPotensiText = 'potensi <span class="font-bold text-orange-700">gaji bervariasi</span>';
                    }
                }
            }
            
            // Analisis tingkat peminat dan persaingan
            const maxPeminatInFilteredSet = jobDemandData.reduce((max, job) => Math.max(max, job.peminat), 1);
            currentCompetitionLevel = currentPeminat / maxPeminatInFilteredSet; // Simpan nilai ini
            
            if (jobDemandData.length > 1) { // Hanya analisis persaingan jika ada lebih dari 1 jabatan
                if (currentCompetitionLevel > 0.75) {
                    currentPeminatStatusText = 'jumlah peminat yang relatif <span class="font-bold text-red-700">tinggi</span>';
                    currentPeluangPersainganText = 'persaingan yang <span class="font-bold text-red-700">sangat ketat</span>';
                } else if (currentCompetitionLevel > 0.4) {
                    currentPeminatStatusText = 'jumlah peminat yang relatif <span class="font-bold text-orange-700">sedang</span>';
                    currentPeluangPersainganText = 'persaingan yang <span class="font-bold text-orange-700">sedang</span>';
                } else {
                    currentPeminatStatusText = 'jumlah peminat yang relatif <span class="font-bold text-green-700">rendah</span>';
                    currentPeluangPersainganText = 'peluang persaingan yang lebih <span class="font-bold text-green-700">baik</span>';
                }
            }
            
            // Pilih frasa secara acak
            const selectedPhraseGenerator = getRandomPhrase(specificJobPhrases) as (g: string, p: string, ps: string) => string;
            
            recommendedJob = {
                name: currentJobName,
                reason: selectedPhraseGenerator(currentGajiPotensiText, currentPeminatStatusText, currentPeluangPersainganText),
                type: 'specific-job',
                peminat: currentPeminat,
                wageCategories: gajiCategoriesDisplay,
                adviceText: '' // Akan diisi di bawah
            };

        } else if (!selectedJabatanAI || selectedJabatanAI === 'all') {
            // Original logic for overall recommendation when no specific job is selected
            if (insight?.lowDemandHighWageJob && insight.lowDemandHighWageJob.peminat > 0) {
                recommendedJob = {
                    name: insight.lowDemandHighWageJob.jabatan,
                    reason: (getRandomPhrase(highWageOpportunityPhrases) as (w: string) => string)(insight.lowDemandHighWageJob.wageCategories),
                    type: 'high-wage-opportunity',
                    peminat: insight.lowDemandHighWageJob.peminat,
                    wageCategories: insight.lowDemandHighWageJob.wageCategories,
                    adviceText: ''
                };
            }
            else if (insight?.lowestDemandJob && insight.lowestDemandJob.peminat > 0 && insight.lowestDemandJob.jabatan !== 'Lain-lain') {
                recommendedJob = {
                    name: insight.lowestDemandJob.jabatan,
                    reason: getRandomPhrase(hiddenGemPhrases) as string,
                    type: 'hidden-gem',
                    peminat: insight.lowestDemandJob.peminat,
                    wageCategories: '',
                    adviceText: ''
                };
            }
            else if (insight?.highestDemandJob && insight.highestDemandJob.peminat > 0 && insight.highestDemandJob.jabatan !== 'Lain-lain') {
                recommendedJob = {
                    name: insight.highestDemandJob.jabatan,
                    reason: getRandomPhrase(highDemandPhrases) as string,
                    type: 'high-demand',
                    peminat: insight.highestDemandJob.peminat,
                    wageCategories: '',
                    adviceText: ''
                };
            }
        }

        // --- Analisis Tren (opsional, jika jabatan yang direkomendasikan ada di data tren) ---
        // Ini akan berlaku untuk rekomendasi umum dan jabatan yang dipilih spesifik
        if (((selectedJabatanAI !== 'all' && targetJobData) || (selectedJabatanAI === 'all' && recommendedJob.name !== 'Tidak Ditemukan')) && historicalChartData.length > 0) {
            const jobNameToAnalyzeTrend = (selectedJabatanAI !== 'all' ? selectedJabatanAI : recommendedJob.name).toLowerCase();
            
            const jobSeriesRaw = historicalChartData.map(d => ({
                value: d[jobNameToAnalyzeTrend.replace(/\s/g, '_')], // Keys in historicalChartData might be snake_case
                name: d.name // 'MMM YY'
            })).filter(d => typeof d.value === 'number' && d.value !== null && d.value !== undefined);

            if (jobSeriesRaw.length >= 2) {
                const actualHistoricalDataPoints = jobSeriesRaw.filter(d => {
                    const [monthStr, yearStr] = d.name.split(' ');
                    const year = parseInt(`20${yearStr}`, 10);
                    const monthIndex = new Date(Date.parse(monthStr + " 1, 2000")).getMonth(); // Get 0-indexed month
                    
                    const currentYear = new Date().getFullYear();
                    const currentMonth = new Date().getMonth(); // 0-indexed

                    // Consider data up to the current month/year for historical trend
                    return year < currentYear || (year === currentYear && monthIndex <= currentMonth);
                });

                let trendDescription = '';
                if (actualHistoricalDataPoints.length >= 2) {
                    const firstVal = actualHistoricalDataPoints[0].value;
                    const lastVal = actualHistoricalDataPoints[actualHistoricalDataPoints.length - 1].value;
                    const percentageChange = firstVal === 0 ? (lastVal > 0 ? 100 : 0) : ((lastVal - firstVal) / firstVal) * 100;

                    if (percentageChange > 15) { // Significant increase
                        trendDescription = 'Peminat posisi ini menunjukkan tren peningkatan yang <span class="font-bold text-emerald-600">kuat</span> dari waktu ke waktu.';
                    } else if (percentageChange > 0) { // Slight increase
                        trendDescription = 'Peminat posisi ini menunjukkan tren <span class="font-bold text-emerald-600">positif</span>.';
                    } else if (percentageChange < -15) { // Significant decrease
                        trendDescription = 'Peminat posisi ini menunjukkan tren <span class="font-bold text-rose-600">penurunan signifikan</span>. Mungkin perlu strategi yang berbeda.';
                    } else if (percentageChange < 0) { // Slight decrease
                        trendDescription = 'Peminat posisi ini menunjukkan tren <span class="font-bold text-rose-600">penurunan</span>.';
                    } else {
                        trendDescription = 'Peminat posisi ini cenderung <span class="font-bold text-gray-600">stabil</span>.';
                    }
                }

                if (trendDescription) {
                    recommendedJob.reason += `<br/><br/>**Tren Peminat:** ${trendDescription}`;
                }

                // Add forecast if available
                const lastForecastPoint = historicalChartData[historicalChartData.length - 1];
                const cleanJobNameForForecast = jobNameToAnalyzeTrend.replace(/\s/g, '_');
                if (lastForecastPoint && typeof lastForecastPoint[cleanJobNameForForecast] === 'number') {
                    const forecastValue = lastForecastPoint[cleanJobNameForForecast];
                    recommendedJob.reason += `<br/>Proyeksi menunjukkan sekitar <span class="font-bold">${forecastValue.toLocaleString('id-ID')}</span> peminat pada <span class="font-bold">${lastForecastPoint.name}</span>.`;
                }
            }
        }

        // --- Logika Penentuan Saran Tambahan ---
        let selectedAdvice = '';
        if (selectedJabatanAI && selectedJabatanAI !== 'all' && targetJobData) {
            // Saran untuk jabatan spesifik
            if (currentGajiPotensiText.includes('gaji tinggi') && currentCompetitionLevel <= 0.4) { // Gaji tinggi & persaingan rendah/sedang
                selectedAdvice = getRandomPhrase(actionableAdvicePhrases.highPotential) as string;
            } else if (currentCompetitionLevel > 0.4) { // Persaingan tinggi
                selectedAdvice = getRandomPhrase(actionableAdvicePhrases.competitive) as string;
            } else if (currentPeminatStatusText.includes('rendah')) { // Peminat rendah
                selectedAdvice = getRandomPhrase(actionableAdvicePhrases.lowDemand) as string;
            } else { // Default/general
                selectedAdvice = getRandomPhrase(actionableAdvicePhrases.general) as string;
            }
        } else {
            // Saran untuk rekomendasi umum
            if (recommendedJob.type === 'high-wage-opportunity') {
                selectedAdvice = getRandomPhrase(actionableAdvicePhrases.highPotential) as string;
            } else if (recommendedJob.type === 'hidden-gem') {
                selectedAdvice = getRandomPhrase(actionableAdvicePhrases.lowDemand) as string;
            } else if (recommendedJob.type === 'high-demand') {
                selectedAdvice = getRandomPhrase(actionableAdvicePhrases.competitive) as string;
            } else {
                selectedAdvice = getRandomPhrase(actionableAdvicePhrases.general) as string;
            }
        }

        recommendedJob.adviceText = selectedAdvice;


        const narasiHTML = `
            <p class="mb-4 text-gray-700">${(getRandomPhrase(greetingPhrases) as string)} (Sektor: <span class="font-bold text-blue-700">${currentSectorFormatted}</span>, Lulusan: <span class="font-bold text-blue-700">${currentPendidikanFormatted}</span>, Gaji: <span class="font-bold text-blue-700">${currentGajiFormatted}</span>), saya telah menganalisis data untuk menemukan **rekomendasi jabatan terbaik** untuk Anda.</p>
            <div class="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl shadow-lg border border-indigo-300 mb-6 flex flex-col items-center text-center">
                <p class="text-indigo-900 text-sm font-semibold mb-2">${selectedJabatanAI === 'all' ? 'Pilihan Terbaik Saya Untuk Anda:' : 'Jabatan yang Anda pilih:'}</p>
                <p class="text-indigo-900 text-3xl md:text-4xl font-extrabold leading-tight">"${recommendedJob.name}"</p>
                <p class="text-md md:text-lg text-indigo-800 mt-2">${recommendedJob.reason}</p>
            </div>
            <p class="mt-4 text-gray-800 font-semibold">Saran Tambahan dari AI:</p>
            <p class="text-gray-600 text-sm mb-4">${recommendedJob.adviceText}</p>
            <ul class="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li><span class="font-semibold">Kembangkan Keterampilan:</span> Fokus pada keterampilan yang paling dicari untuk jabatan ini.</li>
                <li><span class="font-semibold">Jelajahi Peluang:</span> Cari tahu lebih banyak tentang perusahaan yang sering merekrut posisi ini.</li>
                <li><span class="font-semibold">Perluas Jaringan:</span> Berinteraksi dengan profesional di bidang ini untuk insight lebih lanjut.</li>
                <li><span class="font-semibold">Tinjau Profil Anda:</span> Pastikan profil Anda menyoroti pengalaman dan kualifikasi yang relevan.</li>
            </ul>
        `;

        return narasiHTML;
    }, [
        insight, selectedSector, selectedPendidikan, selectedGaji,
        jobDemandData, jobWageDemandData,
        historicalChartData, selectedJabatanForTrend, selectedJabatanAI, availableJabatanForAI
    ]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Bot className="mr-2 h-6 w-6 text-indigo-500" />
                Narasi & Rekomendasi AI
            </h3>
            <div className="mb-4">
                <Label htmlFor="jabatan-ai-filter" className="font-semibold mb-1 text-gray-700 text-sm">Pilih Jabatan untuk Detail AI</Label>
                <Select
                    onValueChange={onSelectJabatanAI}
                    value={selectedJabatanAI}
                    disabled={availableJabatanForAI.length === 0}
                >
                    <SelectTrigger id="jabatan-ai-filter" className="w-full text-left">
                        <SelectValue placeholder="Pilih jabatan..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className={selectedJabatanAI === 'all' ? 'font-bold' : ''}>
                            Tampilkan Rekomendasi Umum
                        </SelectItem>
                        {availableJabatanForAI.length > 0 ? (
                            availableJabatanForAI.map(opt => (
                                <SelectItem key={opt} value={opt}>
                                    {capitalizeWords(opt)}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="" disabled>Tidak ada jabatan tersedia untuk filter ini</SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 text-justify text-sm leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: generateStrongestRecommendation }} />
            </div>
        </div>
    );
};

export default RecommendationPanel;