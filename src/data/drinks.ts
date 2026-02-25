export type DrinkVariant = {
  size: string;
  price: string;
};

export type DrinkRow =
  | {
      type: 'item';
      name: string;
      price?: string;
      variants?: DrinkVariant[];
      details?: string[];
      style?: 'default' | 'emphasis';
    }
  | {
      type: 'subheading';
      text: string;
    };

export type DrinkSection = {
  title: string;
  rows: DrinkRow[];
};

export const leftDrinkSections: DrinkSection[] = [
  {
    title: 'Aperitivo, mit je 4cl',
    rows: [
      { type: 'item', name: 'Aperol Spritz¹,⁹', price: '9,- €' },
      { type: 'item', name: 'Gin Tonic', price: '9,- €' },
      { type: 'item', name: 'Hugo⁹', price: '9,- €' },
      { type: 'item', name: 'Campari Orange¹', price: '9,- €' },
    ],
  },
  {
    title: 'Alkoholfreie Getränke',
    rows: [
      { type: 'subheading', text: 'Gerolsteiner' },
      {
        type: 'item',
        name: 'Mineralwasser Naturell oder Medium',
        style: 'emphasis',
      },
      {
        type: 'item',
        name: '0,25l Flasche',
        price: '2,50 €',
      },
      {
        type: 'item',
        name: '0,5l Flasche',
        price: '5,- €',
      },
      {
        type: 'item',
        name: 'Orangenlimonade',
        variants: [{ size: '0,33l Flasche', price: '3,50 €' }],
      },
      {
        type: 'item',
        name: 'Rhabarberschorle',
        variants: [{ size: '0,33l Flasche', price: '3,50 €' }],
      },
      {
        type: 'item',
        name: 'Citrus und Minze',
        variants: [{ size: '0,33l Flasche', price: '3,50 €' }],
      },
      {
        type: 'item',
        name: 'Apfelschorle',
        variants: [
          { size: '0,2l', price: '3,- €' },
          { size: '0,4l', price: '4,- €' },
        ],
      },
      { type: 'item', name: 'Cola¹,²' },
      {
        type: 'item',
        name: 'Sprite⁶, Fanta¹,⁶',
        variants: [
          { size: '0,2l', price: '3,- €' },
          { size: '0,4l', price: '4,- €' },
        ],
      },
      { type: 'subheading', text: 'Säfte von Bauer' },
      {
        type: 'item',
        name: 'Apfelsaft',
        variants: [
          { size: '0,2l', price: '3,- €' },
          { size: '0,4l', price: '5,- €' },
        ],
      },
      {
        type: 'item',
        name: 'Orangensaft',
        variants: [
          { size: '0,2l', price: '3,- €' },
          { size: '0,4l', price: '5,- €' },
        ],
      },
      {
        type: 'item',
        name: 'Sauerkirschnektar',
        variants: [
          { size: '0,2l', price: '3,- €' },
          { size: '0,4l', price: '5,- €' },
        ],
      },
    ],
  },
  {
    title: 'Warme Getränke',
    rows: [
      { type: 'item', name: 'Tasse Kaffee²', price: '3,- €' },
      { type: 'item', name: 'Tasse Kaffee, groß²', price: '4,50 €' },
      { type: 'item', name: 'Espresso²', price: '2,50 €' },
      { type: 'item', name: 'Espresso Macchiato², D', price: '3,- €' },
      { type: 'item', name: 'Cappuccino², D', price: '4,- €' },
      { type: 'item', name: 'Latte Macchiato², D', price: '5,- €' },
      { type: 'item', name: 'Milchkaffee², D', price: '5,- €' },
      {
        type: 'item',
        name: 'Bens frischer Tee, mit Ingwer, Minze, Zitrone und Honig',
        price: '5,- €',
      },
      { type: 'item', name: 'Schwarzer Tee', price: '3,50 €' },
    ],
  },
];

export const rightDrinkSections: DrinkSection[] = [
  {
    title: 'Biereᴬ',
    rows: [
      {
        type: 'item',
        name: 'Heineken vom Fass',
        variants: [
          { size: '0,33l', price: '3,50 €' },
          { size: '0,5l', price: '5,- €' },
        ],
      },
      {
        type: 'item',
        name: 'Gösser Radler, Flasche',
        variants: [
          { size: '0,33l', price: '3,50 €' },
          { size: '0,5l', price: '5,- €' },
        ],
      },
      {
        type: 'item',
        name: 'Heineken alkoholfrei, Flasche',
        variants: [{ size: '0,33l', price: '3,50 €' }],
      },
      {
        type: 'item',
        name: 'Köstritzer Schwarzbier, Flasche',
        variants: [{ size: '0,33l', price: '3,50 €' }],
      },
      {
        type: 'item',
        name: 'Berliner Weisse, rot oder grün',
        variants: [{ size: '0,33l', price: '3,50 €' }],
      },
      {
        type: 'item',
        name: 'Schneider Weisse, Hefe, Kristall, Helles oder Alkoholfrei',
        variants: [{ size: '0,5l', price: '5,- €' }],
      },
    ],
  },
  {
    title: 'Weine',
    rows: [
      { type: 'subheading', text: 'Weissweine aus Rheinhessen un Baden' },
      {
        type: 'item',
        name: 'Riesling',
        variants: [{ size: '0,25l', price: '8,- €' }],
      },
      {
        type: 'item',
        name: 'Weißburgunder',
        variants: [{ size: '0,25l', price: '9,- €' }],
      },
      {
        type: 'item',
        name: 'Grauburgunder',
        variants: [{ size: '0,25l', price: '9,50 €' }],
      },
      {
        type: 'item',
        name: 'Weinschorle',
        variants: [{ size: '0,25l', price: '8,- €' }],
      },
      { type: 'subheading', text: 'Rotweine, Roséwein' },
      {
        type: 'item',
        name: 'Primitivo',
        variants: [{ size: '0,25l', price: '9,- €' }],
      },
      {
        type: 'item',
        name: 'Merlot',
        variants: [{ size: '0,25l', price: '9,50 €' }],
      },
      {
        type: 'item',
        name: 'Rosato',
        variants: [{ size: '0,25l', price: '8,- €' }],
      },
    ],
  },
  {
    title: 'Sekt & Prosecco',
    rows: [
      {
        type: 'item',
        name: 'Piccolo',
        variants: [{ size: '0,2l', price: '8,50 €' }],
      },
    ],
  },
  {
    title: 'Spirituosen, je 4cl',
    rows: [
      { type: 'item', name: 'Tullamore Dew Whiskey', price: '9,- €' },
      { type: 'item', name: 'Absolut Vodka', price: '7,- €' },
      { type: 'item', name: 'Übersee Rum', price: '9,- €' },
      { type: 'item', name: 'Ramazotti', price: '7,- €' },
      { type: 'item', name: 'Ouzo', price: '5,- €' },
      { type: 'item', name: 'Raki', price: '5,- €' },
      { type: 'item', name: 'Jägermeister', price: '7,- €' },
    ],
  },
];

export const drinkAllergenInfo: string[] = [
  'A - mit glutenhaltigem Getreide (Weizen)',
  'D - Milch oder Milchprodukte, Laktose',
];

export const drinkAdditiveInfo: string[] = [
  '1 - mit Farbstoff',
  '2 - koffeinhaltig',
  '3 - chininhaltig',
  '4 - mit Süßungsmitteln',
  '5 - mit Konservierungsstoff',
  '6 - mit Antioxidationsmittel',
  '7 - mit Geschmacksverstärker',
];
