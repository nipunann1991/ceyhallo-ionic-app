export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface SupportInfo {
  id: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  faqs: FAQ[];
}