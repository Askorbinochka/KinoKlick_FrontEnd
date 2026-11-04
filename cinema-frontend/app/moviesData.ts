export interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: number;
  sessions: string[];
  price: number;
  image: string;
  age: string;
  year: string;
  director: string;
  language: string;
  duration: string;
  country: string;
  description: string;
  subDescription: string;
}

export const movies: Movie[] = [
  { 
    id: 0,
    title: "Кузьма: Страшно веселий", 
    genre: "Біографічний, Документальний", 
    rating: 9.9, 
    sessions: ["14:30", "17:15", "20:00"], 
    price: 150,
    image: "/images/kuzma.webp",
    age: "12+",
    year: "2026",
    director: "Артем Григорян",
    language: "українська мова",
    duration: "2год 13хв",
    country: "Україна",
    description: "Біографічний документальний фільм «Кузьма: Страшно веселий» розповідає про Андрія Кузьменка, лідера гурту «Скрябін», і показує його життєвий шлях через архівні матеріали, особисті історії та відверті спогади.",
    subDescription: "Стрічка розкриває людину за яскравим сценічним образом — з її самоіронією, внутрішніми змінами та життям на повній швидкості, яке й досі надихає мільйони шанувальників."
  },
  { 
    id: 1,
    title: "Над безоднею 2", 
    genre: "Трилер", 
    rating: 7.8, 
    sessions: ["14:00", "17:30", "20:45"], 
    price: 150,
    image: "/images/fall2.webp",
    age: "16+",
    year: "2026",
    director: "Скотт Манн",
    language: "українська мова",
    duration: "1год 45хв",
    country: "США",
    description: "Продовження захопливого трилеру про виживання на екстремальній висоті, де героям знову доведеться зіткнутися зі страхом та боротися за власне життя.",
    subDescription: "На них чекають нові небезпечні випробування на висоті кількох тисяч метрів над землею."
  },
  { 
    id: 2,
    title: "Астрал: За межами Потойбіччя", 
    genre: "Жахи, Трилер", 
    rating: 8.7, 
    sessions: ["15:00", "18:15", "21:30"], 
    price: 170,
    image: "/images/astral.webp",
    age: "18+",
    year: "2026",
    director: "Патрік Вілсон",
    language: "українська мова",
    duration: "1год 50хв",
    country: "США",
    description: "Родина Ламбертів повертається до жахливого потойбіччя, щоб назавжди закрити двері для демонів із минулого.",
    subDescription: "Темні таємниці родини знову спливають на поверхню у найстрашніший момент."
  },
  { 
    id: 3,
    title: "Відважний Давид проти Велетня", 
    genre: "Мультфільм, Сімейний, Пригоди", 
    rating: 8.0, 
    sessions: ["16:30", "18:45", "22:15"], 
    price: 100,
    image: "/images/david.jpg",
    age: "0+",
    year: "2026",
    director: "Анімаційна студія",
    language: "українська мова",
    duration: "1год 30хв",
    country: "Україна / США",
    description: "Захоплива сімейна анімація про малого пастуха, який знайшов у собі сміливість кинути виклик грізному супротивнику.",
    subDescription: "Неймовірна пригода про дружбу, відвагу та віру у власні сили для всієї родини."
  },
];