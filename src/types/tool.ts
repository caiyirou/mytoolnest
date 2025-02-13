export interface Tool {
    _id: string;
    title: string;
    description: string;
    url: string;
    category: string | null;
    creator: string;
    favoritesCount: number;
    createdAt: string;
    updatedAt: string;
  }