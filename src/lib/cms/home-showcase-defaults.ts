export type DefaultFishShowcaseItem = {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
};

export type DefaultVideoShowcaseItem = {
  id: string;
  src: string;
  poster: string;
  title: string;
  description: string;
  orientation: 'portrait' | 'landscape';
};

export const defaultFishShowcaseItems: DefaultFishShowcaseItem[] = [
  {
    id: 'fish-default-1',
    src: '/images/fish/Fish9.webp',
    alt: 'Gourmet Praesentation',
    title: 'Genussmomente',
    description: 'Ein Fest fuer die Sinne',
  },
  {
    id: 'fish-default-2',
    src: '/images/fish/Fish4.webp',
    alt: 'Frische Zubereitung',
    title: 'Handwerk & Praezision',
    description: 'Meisterhafte Verarbeitung',
  },
  {
    id: 'fish-default-3',
    src: '/images/fish/Fish5.webp',
    alt: 'Meeresfruechte Vielfalt',
    title: 'Vielfalt des Meeres',
    description: 'Fuer jeden Geschmack das Richtige',
  },
  {
    id: 'fish-default-4',
    src: '/images/fish/fish7.webp',
    alt: 'Perfekte Lagerung',
    title: 'Frische-Garantie',
    description: 'Optimale Temperaturen',
  },
  {
    id: 'fish-default-5',
    src: '/images/fish/Fish6.webp',
    alt: 'Saisonale Spezialitaeten',
    title: 'Saisonale Highlights',
    description: 'Das Beste der Jahreszeit',
  },
  {
    id: 'fish-default-6',
    src: '/images/fish/Fish8.webp',
    alt: 'Kulinarische Kunst',
    title: 'Haute Cuisine',
    description: 'Leidenschaft auf dem Teller',
  },
  {
    id: 'fish-default-7',
    src: '/images/fish/Fish3.webp',
    alt: 'Premium Fisch Auswahl',
    title: 'Exzellente Qualitaet',
    description: 'Frisch gefangen und perfekt gekuehlt',
  },
  {
    id: 'fish-default-8',
    src: '/images/fish/fish11.webp',
    alt: 'Premium Meereskueche',
    title: 'Signature Selection',
    description: 'Neue Genussmomente aus unserer Fischtheke',
  },
];

export const defaultVideoShowcaseItems: DefaultVideoShowcaseItem[] = [
  {
    id: 'video-default-1',
    src: '/images/videos/1.mp4',
    poster: '/images/videos/1-poster.webp',
    title: 'Live Atmosphaere',
    description: 'Echte Stimmung aus unseren Abenden',
    orientation: 'portrait',
  },
  {
    id: 'video-default-2',
    src: '/images/videos/2.mp4',
    poster: '/images/videos/2-poster.webp',
    title: 'Buehnenmomente',
    description: 'Musik, die den Raum fuellt',
    orientation: 'portrait',
  },
  {
    id: 'video-default-3',
    src: '/images/videos/3.mp4',
    poster: '/images/videos/3-poster.webp',
    title: 'Premium Nights',
    description: 'Highlights im Carpe Diem',
    orientation: 'portrait',
  },
  {
    id: 'video-default-4',
    src: '/images/videos/4.mp4',
    poster: '/images/videos/4-poster.webp',
    title: 'Crowd Energy',
    description: 'Publikum und Performance in Sync',
    orientation: 'portrait',
  },
  {
    id: 'video-default-5',
    src: '/images/videos/5.mp4',
    poster: '/images/videos/5-poster.webp',
    title: 'After Dark',
    description: 'Unvergessliche Momente bei Nacht',
    orientation: 'landscape',
  },
  {
    id: 'video-default-6',
    src: '/images/videos/6.mp4',
    poster: '/images/videos/6-poster.webp',
    title: 'Vibe Sessions',
    description: 'Rhythmus, Genuss und Emotion',
    orientation: 'landscape',
  },
  {
    id: 'video-default-7',
    src: '/images/videos/7.mp4',
    poster: '/images/videos/7-poster.webp',
    title: 'Finale Impression',
    description: 'Der perfekte Abschluss des Abends',
    orientation: 'landscape',
  },
];
