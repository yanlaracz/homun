export const propertyConfig = {
  brand: {
    name: "Homun",
    fullName: "Homun en Residencial Izamal",
    tagline: "Tu hogar para disfrutar Cancún.",
    defaultLanguage: "es",
    supportedLanguages: ["es", "en"],
  },
  location: { city: "Cancún", state: "Quintana Roo", country: "México", area: "Zona Sur", exactAddress: null },
  property: {
    type: "Departamento vacacional",
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    beds: [{ type: "King", quantity: 1 }, { type: "Matrimonial", quantity: 2 }],
    balcony: true,
    sharedPool: true,
    parkingSpaces: 1,
    parkingIncluded: true,
    listingUrl: "https://www.airbnb.mx/rooms/998798841090839556",
    features: ["Aire acondicionado en las tres habitaciones", "Wi-Fi", "Smart TV", "Cocina equipada", "Balcón"],
    community: ["Alberca compartida", "Áreas verdes", "Juegos infantiles", "Cancha de básquetbol", "Estacionamiento incluido"],
  },
  booking: {
    method: "whatsapp",
    whatsappNumber: "529984861331",
    whatsappDisplayNumber: "+52 998 486 1331",
    manualConfirmation: true,
    onlinePaymentsEnabled: false,
    liveAvailabilityEnabled: false,
  },
  media: { directory: "/images/property/", useOriginalPropertyPhotos: true, generatedPropertyPhotosAllowed: false },
  seo: {
    title: "Homun en Residencial Izamal | Departamento vacacional en Cancún",
    description: "Disfruta Cancún en un departamento de 3 habitaciones para hasta 6 huéspedes, con cocina equipada, balcón, alberca compartida y estacionamiento.",
  },
} as const;

export const galleryItems = [
  { src: "sala-retocada.png", alt: "Sala del departamento con sofá, sillas y mesa de madera; foto con retoque digital", label: "Sala" },
  { src: "recamara-retocada.png", alt: "Recámara con cama y aire acondicionado; foto con retoque digital", label: "Recámara" },
  { src: "jardin-retocado.png", alt: "Jardines y áreas verdes del residencial; foto con retoque digital", label: "Áreas verdes" },
  { src: "alberca-retocada.png", alt: "Alberca compartida del residencial; foto con retoque digital", label: "Alberca" },
  { src: "camastros-retocados.png", alt: "Camastros junto a la alberca compartida; foto con retoque digital", label: "Camastros" },
];
