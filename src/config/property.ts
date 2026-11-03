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
  { src: "sala.webp", alt: "Sala del departamento Homun", label: "Sala" },
  { src: "cocina.webp", alt: "Cocina equipada del departamento", label: "Cocina" },
  { src: "recamara-principal.webp", alt: "Recámara principal con cama King", label: "Recámara principal" },
  { src: "recamara-secundaria-1.webp", alt: "Recámara con cama matrimonial", label: "Recámara" },
  { src: "balcon.webp", alt: "Balcón del departamento", label: "Balcón" },
];
