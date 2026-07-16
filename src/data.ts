import { Hammer, Tractor, Coffee, Target, Bird, Home, Tent, TreePine, Droplets } from 'lucide-react';
import { POI } from './types';

export const poiData: POI[] = [
  // ==========================================
  // KATEGORI: WISATA (type: 'wisata')
  // ==========================================
  {
    id: 'kantor-desa',
    type: 'wisata',
    title: 'Kantor Desa Sugihmukti',
    category: 'Pusat Pemerintahan',
    icon: Home,
    x: 50,
    y: 50,
    latitude: -7.120371,
    longitude: 107.441707,
    contact: '62895320695308',
    distance: '0 km',
    time: '0 min',
    description: 'Pusat informasi dan layanan administrasi Desa Wisata Sugihmukti. Titik awal yang sangat tepat untuk memulai penjelajahan Anda.',
    price: 'Gratis',
    hours: '08:00 - 15:00 WIB',
    image: 'https://res.cloudinary.com/dkckkpear/image/upload/v1784168283/images_dp07mp.jpg',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY'
  },
  {
    id: 'pyconon',
    type: 'wisata',
    title: 'Pyconon Camp (Bird Watching)',
    category: 'Camping Ground',
    icon: Tent,
    x: 40,
    y: 60,
    latitude: -7.148240401763075,
    longitude: 107.434844722827,
    contact: '62895320695308',
    distance: '3.5 km',
    time: '15 min',
    description: 'Rasakan pengalaman berkemah di alam terbuka dengan fasilitas lengkap dan pemandangan hutan pinus asri. Tersedia juga aktivitas Bird Watching.',
    price: 'Rp 150.000 / tenda',
    hours: '24 Jam',
    image: 'https://res.cloudinary.com/dkckkpear/image/upload/v1784164442/IMG_20260707_083450_jjgafw.jpg',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY',
    images: [
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164442/IMG_20260707_083450_jjgafw.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164446/IMG_20260707_083531_hgod3i.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164451/IMG_20260707_083423_mqeuko.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164454/IMG_20260707_094432_qnxp3d.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164461/IMG_20260707_083643_zsfzud.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164462/IMG_20260707_083632_r3ld4x.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164465/IMG_20260707_083505_vo8klk.jpg'
    ],
    packages: [
      {
        name: 'Paket Camping Mandiri',
        price: 'Rp 150.000 / malam',
        features: ['Sewa Lahan Camp', 'Akses Listrik & Toilet', 'Free Kayu Bakar']
      },
      {
        name: 'Paket Camp & Bird Watching',
        price: 'Rp 250.000 / malam',
        features: ['Tenda Dome Lengkap', 'Matras & Sleeping Bag', 'Pemandu Bird Watching', 'Kopi Lokal Sugihmukti']
      }
    ]
  },
  {
    id: 'curug_leumah',
    type: 'wisata',
    title: 'Curug Leumah Neundeut',
    category: 'Air Terjun',
    icon: Droplets,
    x: 25,
    y: 80,
    latitude: -7.147172100423585,
    longitude: 107.4322118037018,
    contact: '62895320695308',
    distance: '2.0 km',
    time: '40 min',
    description: 'Wisata air terjun alami tersembunyi yang menyuguhkan kesegaran air pegunungan dan panorama asri khas Pasirjambu.',
    price: 'Rp 10.000',
    hours: '07:00 - 16:00 WIB',
    image: 'https://res.cloudinary.com/dkckkpear/image/upload/v1784164186/IMG_4282_outy8t.jpg',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY',
    images: [
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164186/IMG_4282_outy8t.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164178/IMG_4371_q8ona7.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164178/IMG_20260707_074751_fdp0va.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164178/IMG_4298_mwqn0i.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164273/IMG_4374_uz2zwv.jpg'
    ]
  },
  {
    id: 'sunan-ibu',
    type: 'wisata',
    title: 'Sunan Ibu & Kawah Putih',
    category: 'Alam',
    icon: TreePine,
    x: 20,
    y: 80,
    latitude: -7.167804,
    longitude: 107.400605,
    contact: '62895320695308',
    distance: '7.0 km',
    time: '30 min',
    description: 'Kawasan danau kawah vulkanik Kawah Putih eksotis dan puncak Sunan Ibu, lokasi terbaik untuk melihat matahari terbit (Sunrise) dengan lautan awan yang memukau.',
    price: 'Rp 28.000',
    hours: '04:00 - 17:00 WIB',
    image: 'https://res.cloudinary.com/dkckkpear/image/upload/v1784137197/download_15_qelmii.jpg',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY',
    images: [
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784137197/download_15_qelmii.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784137197/download_14_bpcw9z.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784137197/download_16_josxfd.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784137197/kawah_Ijen_oicreo.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784156979/Kawah_putih_tzl6go.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784156981/download_17_vyqawb.jpg'
    ]
  },
  {
    id: 'patuha',
    type: 'wisata',
    title: 'Gunung Patuha',
    category: 'Pegunungan',
    icon: Target,
    x: 25,
    y: 75,
    latitude: -7.160807,
    longitude: 107.399667,
    contact: '62895320695308',
    distance: '6.8 km',
    time: '28 min',
    description: 'Gunung eksotis dengan vegetasi khas dataran tinggi. Merupakan lokasi dari Kawah Putih yang sangat legendaris.',
    price: 'Rp 28.000',
    hours: '07:00 - 17:00 WIB',
    image: 'https://res.cloudinary.com/dkckkpear/image/upload/v1784161361/Trip_Gunung_Patuha_Jabar_Kawah_Putih_psz2hd.jpg',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY',
    images: [
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784161361/Trip_Gunung_Patuha_Jabar_Kawah_Putih_psz2hd.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784161361/download_18_egpdzo.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784161438/puncak_patuha_uudndr.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784161361/with_love_from_the_tropics_r75nso.jpg'
    ]
  },
  {
    id: 'sunan-rama',
    type: 'wisata',
    title: 'Sunan Rama',
    category: 'Alam & Sejarah',
    icon: TreePine,
    x: 22,
    y: 72,
    latitude: -7.159610,
    longitude: 107.398961,
    contact: '62895320695308',
    distance: '6.7 km',
    time: '27 min',
    description: 'Kawasan penyangga konservasi dengan udara yang sangat segar. Terdapat situs sejarah petilasan di sekitar areanya.',
    price: 'Rp 15.000',
    hours: '08:00 - 16:00 WIB',
    image: 'https://res.cloudinary.com/dkckkpear/image/upload/v1784163814/sunan_rama_wmlqy9.jpg',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY'
  },
  {
    id: 'pandai-besi',
    type: 'wisata',
    title: 'Pandai Besi',
    category: 'Budaya',
    icon: Hammer,
    x: 55,
    y: 45,
    latitude: -7.120186,
    longitude: 107.444161,
    contact: '62895320695308',
    distance: '500 m',
    time: '5 min',
    description: 'Pusat kerajinan pandai besi tradisional. Melihat langsung keahlian warga dalam membuat alat-alat pertanian secara turun-temurun.',
    price: 'Gratis',
    hours: '08:00 - 16:00 WIB',
    image: 'https://res.cloudinary.com/dkckkpear/image/upload/v1784164744/IMG_20260713_082333_tmza9j.jpg',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY',
    images: [
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164744/IMG_20260713_082333_tmza9j.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164747/IMG_20260713_075952_fbzoj4.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164822/IMG_5116_ao6r7e.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784164889/IMG_5106_1_fwbecy.jpg'
    ]
  },
  {
    id: 'kambing-etawa',
    type: 'wisata',
    title: 'Peternakan Kambing Etawa',
    category: 'Edukasi',
    icon: Tractor,
    x: 60,
    y: 40,
    latitude: -7.125180,
    longitude: 107.448378,
    contact: '62895320695308',
    distance: '1.2 km',
    time: '10 min',
    description: 'Wisata edukasi peternakan kambing etawa pilihan. Pengunjung bisa ikut memberi makan dan memerah susu kambing segar.',
    price: 'Rp 10.000',
    hours: '07:00 - 15:00 WIB',
    image: 'https://res.cloudinary.com/dkckkpear/image/upload/v1784165198/IMG_20260713_093025_rro2ot.jpg',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY',
    images: [
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784165198/IMG_20260713_093025_rro2ot.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784165198/IMG_5142_noh7qp.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784165198/IMG_20260713_090252_hqruu3.jpg'
    ]
  },
  {
    id: 'bukit-jamur',
    type: 'wisata',
    title: 'Bukit Jamur Rancabolang',
    category: 'Alam',
    icon: TreePine,
    x: 20,
    y: 20,
    latitude: -7.164532,
    longitude: 107.428815,
    contact: '6281234567891',
    distance: '3.5 km',
    time: '20 min',
    description: 'Ikon wisata pohon cemara unik berbentuk jamur raksasa di tengah hamparan perkebunan teh yang estetik.',
    price: 'Rp 15.000',
    hours: '08:00 - 17:00 WIB',
    image: 'https://res.cloudinary.com/dkckkpear/image/upload/v1784162575/Pohon_Berbentuk_Jamur_Payung_di_Bukit_Jamur_Rancabolang_Ciwidey_Bandung_Image_From_why_ajie____datwh5.jpg',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY',
    images: [
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784162575/Pohon_Berbentuk_Jamur_Payung_di_Bukit_Jamur_Rancabolang_Ciwidey_Bandung_Image_From_why_ajie____datwh5.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784162575/Berfoto_di_Bukit_Jamur_Rancabolang_Ciwidey_Image_From_fadhafiyyan_kf5ba8.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784162575/Pemandangan_Bukit_Jamur_Rancabolang_Ciwidey_Bandung_dari_Atas_Image_From_marztravel_vsbw9u.jpg',
      'https://res.cloudinary.com/dkckkpear/image/upload/v1784162582/Bandung-Bukit-Jamur-Ciwidey1_anz6aq.png'
    ]
  },

  // ==========================================
  // KATEGORI: VILA (type: 'vila')
  // ==========================================
  {
    id: 'villa-lembah-kopi',
    type: 'vila',
    title: 'Villa Lembah Kopi Sugihmukti',
    category: 'Vila',
    icon: Home,
    x: 50,
    y: 50,
    latitude: -7.130000,
    longitude: 107.445000,
    contact: '6281234567811',
    distance: '1.2 km',
    time: '5 min',
    description: 'Penginapan eksklusif dengan pemandangan langsung ke perkebunan kopi asri dan fasilitas sarapan lokal.',
    price: 'Mulai dari Rp 500.000',
    hours: 'Check-in 14:00 WIB',
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=800',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY',
    packages: [
      {
        name: 'Paket Akhir Pekan (Weekend)',
        price: 'Rp 750.000 / malam',
        features: ['Kamar Superior dengan View', 'Sarapan untuk 2 Orang', 'Tur Kebun Kopi & Roasting Class']
      },
      {
        name: 'Paket Honeymoon Romantis',
        price: 'Rp 1.200.000 / malam',
        features: ['Kamar Suite Mewah', 'Dekorasi Kamar Bunga', 'Makan Malam Romantis', 'Private Coffee Brewing Session']
      }
    ]
  },
  {
    id: 'glamping-legok-kondang',
    type: 'vila',
    title: 'Glamping Legok Kondang Lodge',
    category: 'Vila',
    icon: Tent,
    x: 50,
    y: 50,
    latitude: -7.136215,
    longitude: 107.414820,
    contact: '6281234567822',
    distance: '3.5 km',
    time: '15 min',
    description: 'Resort ikonik dengan konsep Glamorous Camping (Glamping) mewah di tengah sejuknya alam pegunungan.',
    price: 'Mulai dari Rp 1.200.000',
    hours: 'Check-in 14:00 WIB',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY'
  },
  {
    id: 'bubu-jungle-resort',
    type: 'vila',
    title: 'Bubu Jungle Resort',
    category: 'Vila',
    icon: Home,
    x: 50,
    y: 50,
    latitude: -7.143550,
    longitude: 107.412010,
    contact: '6281234567833',
    distance: '4.5 km',
    time: '20 min',
    description: 'Vila unik berarsitektur menyerupai perangkap ikan tradisional (bubu) dengan private pool air hangat.',
    price: 'Mulai dari Rp 2.500.000',
    hours: 'Check-in 14:00 WIB',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY'
  },
  {
    id: 'argapuri-resort',
    type: 'vila',
    title: 'Argapuri Resort di Jungle',
    category: 'Vila',
    icon: Home,
    x: 50,
    y: 50,
    latitude: -7.135000,
    longitude: 107.462500,
    contact: '6281234567844',
    distance: '2.5 km',
    time: '12 min',
    description: 'Resort tenang yang berbatasan langsung dengan hamparan perkebunan teh Gambung, cocok untuk healing keluarga.',
    price: 'Mulai dari Rp 800.000',
    hours: 'Check-in 14:00 WIB',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800',
    video: 'https://www.youtube.com/embed/QuUpPZ0w_eY'
  }
];

export function getIconForCategory(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes('pusat pemerintahan') || cat.includes('vila') || cat.includes('homestay')) return Home;
  if (cat.includes('camping') || cat.includes('camp')) return Tent;
  if (cat.includes('air terjun') || cat.includes('pemandian')) return Droplets;
  if (cat.includes('alam') || cat.includes('pegunungan')) return TreePine;
  if (cat.includes('budaya') || cat.includes('pandai besi')) return Hammer;
  if (cat.includes('edukasi') || cat.includes('tani') || cat.includes('kebun') || cat.includes('peternakan')) return Tractor;
  if (cat.includes('kopi') || cat.includes('kuliner')) return Coffee;
  return Target; // default fallback
}