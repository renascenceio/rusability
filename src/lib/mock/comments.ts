import type { Comment } from "@/lib/types";

export const COMMENTS: Comment[] = [
  {
    id: "c-1",
    authorName: "Игорь Соколов",
    authorAvatar: "/images/avatars/a-4.png",
    text: "Отличный разбор. Особенно согласен про метрики — слишком часто команды измеряют то, что удобно, а не то, что важно.",
    timeLabel: "3 часа назад",
    likes: 24,
    replies: [
      {
        id: "c-1-1",
        authorName: "Елена Маршева",
        authorAvatar: "/images/avatars/a-1.png",
        text: "Спасибо! Это правда болезненная тема почти в каждом проекте.",
        timeLabel: "2 часа назад",
        likes: 11,
      },
    ],
  },
  {
    id: "c-2",
    authorName: "Ольга Литвинова",
    authorAvatar: "/images/avatars/a-5.png",
    text: "Забрала пару идей в работу. Про гипотезу до инструмента — прямо в точку, у нас наоборот вечно.",
    timeLabel: "5 часов назад",
    likes: 17,
  },
  {
    id: "c-3",
    authorName: "Павел Дроздов",
    authorAvatar: "/images/avatars/a-2.png",
    text: "А есть шаблоны, о которых вы говорите в конце? Было бы полезно увидеть на практике.",
    timeLabel: "вчера",
    likes: 9,
  },
];
