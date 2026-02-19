
export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  date: Date;
  imageUrl: string;
  description: string;
  content: string;
  category?: string;
  isFeatured?: boolean;
}
