export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  jobType: string;
  salaryRange?: string;
  postedDate: Date;
  isFeatured: boolean;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
}
