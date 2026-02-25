export type MenuRowStyle = 'default' | 'addon' | 'bullet';

export type MenuRow = {
  name: string;
  price: string;
  details?: string[];
  style?: MenuRowStyle;
};

export const aegeisCuisineItems: MenuRow[] = [
  {
    name: 'Tagessuppe',
    price: '7,- €',
    details: ['(bitte bei der Bedienung erfragen...)'],
  },
  { name: 'Bunter Salatteller mit Baguette', price: '10,50 €' },
  { name: '+ Halloumi', price: '13,50 €', style: 'addon' },
  { name: '+ Ziegenkäse und Oliven', price: '13,50 €', style: 'addon' },
  { name: '+ Garnelen', price: '18,50 €', style: 'addon' },
  {
    name: '+ Meeresfrüchte',
    price: '18,50 €',
    style: 'addon',
    details: ['(Calamari, Oktopus, Jakobsmuscheln)', 'je nach Verfügbarkeit'],
  },
  { name: '+ Hähnchen', price: '16,50 €', style: 'addon' },
  { name: 'Gemüseteller vom Grill', price: '16,50 €' },
  {
    name: 'Zucchini Bouletten',
    price: '15,50 €',
    details: ['mit Salat und Cacik'],
  },
];

export const grillItems: MenuRow[] = [
  { name: 'Rinderbouletten, 3 Stück, ca. 290g', price: '18,50 €' },
  { name: 'Lammfilet, ca. 250g', price: '26,00 €' },
  {
    name: 'Bifteki gefüllt mit Käse, Tomate und Metaxa-Sauce',
    price: '26,00 €',
  },
  { name: 'Hähnchenbrust, ca. 250g', price: '22,00 €' },
  { name: 'Fleischteller mit drei Fleischsorten', price: '26,50 €' },
  { name: 'Zanderfilet', price: '19,50 €' },
  { name: 'Wolfsbarschfilet', price: '19,50 €' },
  { name: 'Lachsfilet', price: '19,50 €' },
  { name: 'Welsfilet', price: '18,50 €' },
  { name: 'Fischteller mit drei Fischsorten', price: '26,50 €' },
  { name: 'Meeresfrüchteplatte mit Salat und Salicorne', price: '26,50 €' },
];

export const burgerColumns: MenuRow[][] = [
  [
    { name: 'Hamburger, ca. 200 g aus 100% Rind', price: '13,50 €' },
    { name: 'Cheeseburger, ca. 200 g', price: '15,50 €' },
    { name: 'Fischburger', price: '12,50 €' },
  ],
  [
    { name: 'Crispy Chicken Burger, ca. 135 g', price: '12,- €' },
    {
      name: 'Wagyu-Burger, ca. 200g',
      price: '20,- €',
      details: ['(japanisches Rindergehacktes)', 'je nach Verfügbarkeit'],
    },
    { name: 'Veggie-Burger mit Halloumi', price: '12,50 €' },
  ],
];

export const sideDishColumns: MenuRow[][] = [
  [
    {
      name: 'Kartoffelecken mit Knoblauchjoghurt',
      price: '7,- €',
      style: 'bullet',
    },
    {
      name: 'Rosmarinkartoffeln mit Knoblauchjoghurt',
      price: '7,- €',
      style: 'bullet',
    },
    {
      name: 'Tagesbeilage',
      price: '8,- €',
      style: 'bullet',
      details: ['(bitte bei der Bedienung erfragen)'],
    },
    {
      name: 'Salicorne (Meeresspargel) Salat,',
      price: '9,- €',
      style: 'bullet',
      details: ['mit Tomaten, Zwiebeln und Brot'],
    },
  ],
  [
    { name: 'Käse und Oliven', price: '12,50 €', style: 'bullet' },
    {
      name: 'Cacik mit Baguette',
      price: '7,50 €',
      style: 'bullet',
      details: ['(Knoblauchjoghurt mit Gurke und Olivenöl)'],
    },
  ],
];

export const menuServiceNote = 'Alle Gerichte werden mit Salat und Beilage serviert.';

export const fishDisplayHeadline = 'Wechselnde Fischangebote aus der Vitrine';

export const saladNote =
  'Für unsere Salate verwenden wir ausschließlich Olivenöl, Zitrone und Granatapfelnektar.';
