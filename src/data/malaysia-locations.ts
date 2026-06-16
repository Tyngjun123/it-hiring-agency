export const MALAYSIA_LOCATIONS = [
  // Federal territories
  "Kuala Lumpur",
  "Putrajaya",
  "Labuan",
  // Selangor
  "Petaling Jaya",
  "Shah Alam",
  "Subang Jaya",
  "Klang",
  "Ampang",
  "Cheras",
  "Cyberjaya",
  "Puchong",
  "Sepang",
  "Rawang",
  "Kajang",
  "Bangi",
  "Semenyih",
  // Johor
  "Johor Bahru",
  "Iskandar Puteri",
  "Batu Pahat",
  "Muar",
  "Kluang",
  "Segamat",
  // Penang
  "George Town",
  "Bukit Mertajam",
  "Bayan Lepas",
  "Seberang Perai",
  // Perak
  "Ipoh",
  "Taiping",
  "Teluk Intan",
  "Sitiawan",
  // Sabah
  "Kota Kinabalu",
  "Sandakan",
  "Tawau",
  "Lahad Datu",
  // Sarawak
  "Kuching",
  "Miri",
  "Sibu",
  "Bintulu",
  // Negeri Sembilan
  "Seremban",
  "Port Dickson",
  "Nilai",
  // Melaka
  "Melaka City",
  "Alor Gajah",
  "Jasin",
  // Pahang
  "Kuantan",
  "Temerloh",
  "Bentong",
  // Kedah
  "Alor Setar",
  "Sungai Petani",
  "Kulim",
  "Langkawi",
  // Kelantan
  "Kota Bharu",
  // Terengganu
  "Kuala Terengganu",
  "Kemaman",
  // Perlis
  "Kangar",
  // Remote
  "Remote",
  "Hybrid",
] as const

export type MalaysiaLocation = typeof MALAYSIA_LOCATIONS[number]
