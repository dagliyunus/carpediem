import { MenuItem, MenuCategory } from '@/types';

export const menuCategories: MenuCategory[] = [
  { id: 'starters', name: 'Vorspeisen', slug: 'vorspeisen', description: 'Leichte mediterrane Köstlichkeiten für den perfekten Start.' },
  { id: 'main', name: 'Hauptspeisen', slug: 'hauptspeisen', description: 'Frischer Fisch, zartes Fleisch und vegetarische Kreationen.' },
  { id: 'desserts', name: 'Desserts', slug: 'desserts', description: 'Hausgemachte Süßspeisen für den krönenden Abschluss.' },
];

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Griechischer Bauernsalat',
    description: 'Mit original Feta, Oliven, Paprika, Gurken und extra nativem Olivenöl.',
    price: 14.50,
    allergens: ['G'],
    isVegetarian: true,
    category: 'starters',
  },
  {
    id: '2',
    name: 'Gegrillter Oktopus',
    description: 'Auf Fava-Püree mit karamellisierten Zwiebeln und Kapernäpfeln.',
    price: 24.50,
    allergens: ['R', 'N'],
    isPopular: true,
    category: 'starters',
  },
  {
    id: '3',
    name: 'Lammkarree in Kräuterkruste',
    description: 'Mit Ratatouille-Gemüse und Rosmarinkartoffeln.',
    price: 32.00,
    allergens: ['A', 'C', 'G'],
    isPopular: true,
    category: 'main',
  },
  {
    id: '4',
    name: 'Dorade Royal im Ganzen',
    description: 'Vom Grill mit mediterranem Gemüse und Zitronen-Öl-Dressing.',
    price: 28.50,
    allergens: ['D'],
    category: 'main',
  },
  {
    id: '5',
    name: 'Moussaka Tradizionale',
    description: 'Auberginenauflauf mit Hackfleisch und Béchamelsauce.',
    price: 18.50,
    allergens: ['A', 'G'],
    category: 'main',
  },
  {
    id: '6',
    name: 'Hausgemachtes Baklava',
    description: 'Mit Pistazien und einer Kugel Vanilleeis.',
    price: 9.50,
    allergens: ['A', 'H', 'G'],
    category: 'desserts',
  },
];
