// Oman Governorates and Wilayats with stable IDs
export const OMAN_GOVERNORATES = [
  {
    id: 1,
    name: 'Muscat',
    wilayats: [
      { id: 101, name: 'Muscat' },
      { id: 102, name: 'Mutrah' },
      { id: 103, name: 'Al Amarat' },
      { id: 104, name: 'Bawshar' },
      { id: 105, name: 'Seeb' },
      { id: 106, name: 'Qurayyat' }
    ]
  },
  {
    id: 2,
    name: 'Ad Dakhiliyah',
    wilayats: [
      { id: 201, name: 'Nizwa' },
      { id: 202, name: 'Bahla' },
      { id: 203, name: 'Manah' },
      { id: 204, name: 'Al Hamra' },
      { id: 205, name: 'Adam' },
      { id: 206, name: 'Izki' },
      { id: 207, name: 'Samail' },
      { id: 208, name: 'Bidbid' },
      { id: 209, name: 'Al Jabal Al Akhdar' }
    ]
  },
  {
    id: 3,
    name: 'North Al Batinah',
    wilayats: [
      { id: 301, name: 'Sohar' },
      { id: 302, name: 'Shinas' },
      { id: 303, name: 'Liwa' },
      { id: 304, name: 'Saham' },
      { id: 305, name: 'Al Khaburah' },
      { id: 306, name: 'Al Suwaiq' }
    ]
  },
  {
    id: 4,
    name: 'South Al Batinah',
    wilayats: [
      { id: 401, name: 'Rustaq' },
      { id: 402, name: 'Al Awabi' },
      { id: 403, name: 'Nakhal' },
      { id: 404, name: 'Wadi Al Ma\'awil' },
      { id: 405, name: 'Barka' },
      { id: 406, name: 'Al Musannah' }
    ]
  },
  {
    id: 5,
    name: 'Al Wusta',
    wilayats: [
      { id: 501, name: 'Haima' },
      { id: 502, name: 'Mahout' },
      { id: 503, name: 'Duqm' },
      { id: 504, name: 'Al Jazer' }
    ]
  },
  {
    id: 6,
    name: 'North Ash Sharqiyah',
    wilayats: [
      { id: 601, name: 'Ibra' },
      { id: 602, name: 'Mudhaibi' },
      { id: 603, name: 'Bidiya' },
      { id: 604, name: 'Al Qabil' },
      { id: 605, name: 'Wadi Bani Khalid' },
      { id: 606, name: 'Dema Wa Tayeen' },
      { id: 607, name: 'Sinaw' }
    ]
  },
  {
    id: 7,
    name: 'South Ash Sharqiyah',
    wilayats: [
      { id: 701, name: 'Sur' },
      { id: 702, name: 'Al Kamil Wal Wafi' },
      { id: 703, name: 'Jaalan Bani Bu Hassan' },
      { id: 704, name: 'Jaalan Bani Bu Ali' },
      { id: 705, name: 'Masirah' }
    ]
  },
  {
    id: 8,
    name: 'Ad Dhahirah',
    wilayats: [
      { id: 801, name: 'Ibri' },
      { id: 802, name: 'Yanqul' },
      { id: 803, name: 'Dhank' }
    ]
  },
  {
    id: 9,
    name: 'Musandam',
    wilayats: [
      { id: 901, name: 'Khasab' },
      { id: 902, name: 'Diba' },
      { id: 903, name: 'Bukha' },
      { id: 904, name: 'Madha' }
    ]
  },
  {
    id: 10,
    name: 'Dhofar',
    wilayats: [
      { id: 1001, name: 'Salalah' },
      { id: 1002, name: 'Taqah' },
      { id: 1003, name: 'Mirbat' },
      { id: 1004, name: 'Rakhyut' },
      { id: 1005, name: 'Thumrait' },
      { id: 1006, name: 'Dhalkut' },
      { id: 1007, name: 'Al Mazyona' },
      { id: 1008, name: 'Muqshin' },
      { id: 1009, name: 'Shaleem and Al Halaniyat Islands' },
      { id: 1010, name: 'Sadah' }
    ]
  },
  {
    id: 11,
    name: 'Al Buraimi',
    wilayats: [
      { id: 1101, name: 'Al Buraimi' },
      { id: 1102, name: 'Mahdah' },
      { id: 1103, name: 'As Sunainah' }
    ]
  }
]

// Helper functions
export function getGovernorateById(id) {
  return OMAN_GOVERNORATES.find(gov => gov.id === id)
}

export function getWilayatById(governorateId, wilayatId) {
  const governorate = getGovernorateById(governorateId)
  if (!governorate) return null
  return governorate.wilayats.find(w => w.id === wilayatId)
}

export function getWilayatsByGovernorate(governorateId) {
  const governorate = getGovernorateById(governorateId)
  return governorate ? governorate.wilayats : []
}

export function validateAddress(address) {
  const errors = {}
  
  if (!address.fullName || address.fullName.trim().length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters)'
  }
  
  if (!address.phone || !/^(7|9)\d{7}$/.test(address.phone.replace(/\s/g, ''))) {
    errors.phone = 'Phone must be a valid Oman number (8 digits starting with 7 or 9)'
  }
  
  if (!address.governorateId) {
    errors.governorateId = 'Governorate is required'
  } else if (!getGovernorateById(address.governorateId)) {
    errors.governorateId = 'Invalid governorate'
  }
  
  if (!address.wilayatId) {
    errors.wilayatId = 'Wilayat is required'
  } else if (address.governorateId && !getWilayatById(address.governorateId, address.wilayatId)) {
    errors.wilayatId = 'Invalid wilayat for selected governorate'
  }
  
  if (!address.houseNumber || address.houseNumber.trim().length < 1) {
    errors.houseNumber = 'House number is required'
  }
  
  return Object.keys(errors).length === 0 ? null : errors
}
