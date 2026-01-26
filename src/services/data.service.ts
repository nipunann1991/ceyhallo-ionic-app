import { Injectable, signal, inject } from '@angular/core';
import { NewsArticle } from '../models/news.model';
import { Banner } from '../models/banner.model';
import { Category } from '../models/category.model';
import { Country } from '../models/country.model';
import { Business } from '../models/business.model';
import { Event } from '../models/event.model';
import { Job } from '../models/job.model';
import { LegalDocument } from '../models/legal.model';
import { SupportInfo } from '../models/support.model';
import { Notification } from '../models/notification.model';
import { Timestamp } from 'firebase/firestore';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private firestoreService = inject(FirestoreService);

  private articles = signal<NewsArticle[]>([]);
  private banners = signal<Banner[]>([]);
  private categories = signal<Category[]>([]);
  private countries = signal<Country[]>([]);
  private businesses = signal<Business[]>([]);
  private restaurants = signal<Business[]>([]);
  private events = signal<Event[]>([]);
  private jobs = signal<Job[]>([]);
  private legalDocs = signal<LegalDocument[]>([]);
  private supportInfo = signal<SupportInfo | null>(null);
  private notifications = signal<Notification[]>([]);

  // Global State for Location Selection
  readonly selectedCountryId = signal<string>('AE');

  constructor() {
    this.listenToNews();
    this.listenToBanners();
    this.listenToCategories();
    this.listenToCountries();
    this.listenToBusinesses();
    this.listenToRestaurants();
    this.listenToEvents();
    this.listenToJobs();
    this.listenToLegal();
    this.listenToSupport();
    this.listenToNotifications();
  }

  getNews() { return this.articles.asReadonly(); }
  getBanners() { return this.banners.asReadonly(); }
  getCategories() { return this.categories.asReadonly(); }
  getCountries() { return this.countries.asReadonly(); }
  getBusinesses() { return this.businesses.asReadonly(); }
  getRestaurants() { return this.restaurants.asReadonly(); }
  getEvents() { return this.events.asReadonly(); }
  getJobs() { return this.jobs.asReadonly(); }
  getLegalDocs() { return this.legalDocs.asReadonly(); }
  getSupportInfo() { return this.supportInfo.asReadonly(); }
  getNotifications() { return this.notifications.asReadonly(); }

  setSelectedCountry(id: string) {
    this.selectedCountryId.set(id);
  }

  private listenToNews(): void {
    this.firestoreService.listenToCollectionMapped<any, NewsArticle>(
      'news',
      this.articles,
      // Mapper function
      (id, data) => {
        // Filter: Only allow published news.
        // We removed the isFeatured check to allow all published news to be displayed.
        if (data['isPublished'] !== true) {
          return null;
        }

        let date: Date | null = null;
        if (data['date'] instanceof Timestamp) { date = data['date'].toDate(); }
        else if (data['publishedDate'] && typeof data['publishedDate'] === 'string') { date = new Date(data['publishedDate']); }
        else if (data['date']) { date = data['date'].toDate ? data['date'].toDate() : new Date(data['date']); }

        if (!date || isNaN(date.getTime())) {
          console.warn(`Article with document ID "${id}" has an invalid date and will be excluded.`);
          return null;
        }

        return {
          id,
          title: data['title'],
          source: data['author'] || data['source'] || 'Unknown Source',
          date: date,
          imageUrl: data['imageUrl'] || '',
          description: data['excerpt'] || data['description'] || '',
          content: data['content'],
          category: data['category'] || 'General'
        };
      },
      // Processor function
      (articles) => articles.sort((a, b) => b.date.getTime() - a.date.getTime())
    );
  }

  private listenToBanners(): void {
    this.firestoreService.listenToCollectionMapped<any, Banner>(
      'banners',
      this.banners,
      (id, data) => ({
        id,
        category: data['category'] || 'General',
        title: data['title'] || '',
        description: data['description'] || '',
        image: data['image'] || data['imageUrl'] || '',
        active: data['active'] ?? true,
        targetId: data['targetId'],
        targetType: data['targetType'],
        navigationType: data['navigationType'] || (data['targetId'] ? 'internal' : 'none'),
        order: data['order'] || 999
      }),
      // Sort by order (ascending)
      (banners) => banners.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    );
  }

  private listenToCategories(): void {
    this.firestoreService.listenToCollectionMapped<any, Category>(
      'categories',
      this.categories,
      (id, data) => ({
        id: id,
        label: data['label'] || data['name'] || 'Category',
        icon: data['icon'] || '',
        hasNotification: data['hasNotification'] ?? data['hasUpdate'] ?? false,
        order: data['order'] || 99,
        path: data['tab'] ? `/${data['tab']}` : undefined
      }),
      // Sort by order
      (cats) => cats.sort((a, b) => a.order - b.order)
    );
  }

  private listenToCountries(): void {
    this.firestoreService.listenToCollectionMapped<any, Country>(
      'countries',
      this.countries,
      (id, data) => ({
        id: id,
        name: data['name'] || id,
        flagUrl: data['flagUrl'] || '',
        cities: data['cities'] || []
      }),
      // Sort alphabetically by name
      (countries) => countries.sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  private listenToBusinesses(): void {
    this.firestoreService.listenToCollectionMapped<any, Business>(
      'businesses',
      this.businesses,
      (id, data) => ({
        id: id,
        name: data['name'] || data['title'] || 'Business Name',
        category: data['category'] || 'General',
        location: data['location'] || 'Unknown Location',
        rating: data['rating'] || 0,
        reviewCount: data['reviewCount'] || data['reviews'] || 0,
        imageUrl: data['imageUrl'] || '',
        isPromoted: data['isPromoted'] ?? data['isVerified'] ?? false,
        // Map new detailed fields with defaults
        description: data['description'] || 'Providing excellent service to our valued customers. Contact us for more information about our products and services.',
        phone: data['phone'] || '+971 4 000 0000',
        email: data['email'] || 'info@example.com',
        website: data['website'] || 'https://example.com',
        openingHours: data['openingHours'] || [],
        gallery: data['gallery'] || [],
        menuUrl: data['menuUrl']
      })
    );
  }

  private listenToRestaurants(): void {
    this.firestoreService.listenToCollectionMapped<any, Business>(
      'restaurants',
      this.restaurants,
      (id, data) => ({
        id: id,
        name: data['title'] || 'Restaurant Name',
        category: data['cuisine'] || 'Restaurant',
        location: data['location'] || 'Dubai',
        rating: data['rating'] || 0,
        reviewCount: data['reviews'] || 0,
        imageUrl: data['imageUrl'] || '',
        isPromoted: data['isFeatured'] || data['isPremium'] || false,
        description: data['description'] || 'Authentic flavors and great ambiance.',
        phone: data['phone'] || '+971 4 111 2222',
        email: data['email'] || 'info@restaurant.com',
        website: data['website'] || 'https://restaurant.com',
        priceRange: data['priceRange'] || '$$$',
        openingHours: data['openingHours'] || [],
        gallery: data['gallery'] || [],
        menuUrl: data['menuUrl']
      })
    );
  }

  private listenToEvents(): void {
    this.firestoreService.listenToCollectionMapped<any, Event>(
      'events',
      this.events,
      // Mapper function
      (id, data) => {
        if (data['isPublished'] !== true) {
          return null;
        }

        let date: Date | null = null;
        
        // NEW: Prioritize `fullDate` and `startTime` from the new JSON structure
        if (data['fullDate'] && data['startTime']) {
          date = new Date(`${data['fullDate']} ${data['startTime']}`);
        } 
        // Fallbacks for old/other formats for backward compatibility
        else if (data['date'] instanceof Timestamp) { 
          date = data['date'].toDate(); 
        }
        else if (data['eventDate'] && typeof data['eventDate'] === 'string') { 
          date = new Date(data['eventDate']); 
        }
        else if (data['publishedDate'] && typeof data['publishedDate'] === 'string') {
          date = new Date(data['publishedDate']);
        }
        else if (data['date'] && data['date'].toDate) { 
            date = data['date'].toDate();
        }

        if (!date || isNaN(date.getTime())) {
          console.warn(`Event with document ID "${id}" has an invalid date and will be excluded.`);
          return null;
        }

        return {
          id,
          title: data['title'] || 'Untitled Event',
          description: data['description'] || '',
          content: data['content'] || `<p>${data['description'] || 'No details available.'}</p>`,
          imageUrl: data['imageUrl'] || '',
          date: date,
          location: data['location'] || 'TBA',
          category: data['category'] || 'General',
          organizer: data['organizer'] || 'Unknown Organizer',
          isFeatured: data['isFeatured'] ?? false
        };
      },
      // Processor function
      (events) => events.sort((a, b) => a.date.getTime() - b.date.getTime()) // Sort by upcoming
    );
  }

  private listenToJobs(): void {
    this.firestoreService.listenToCollectionMapped<any, Job>(
      'jobs',
      this.jobs,
      (id, data) => {
        let date: Date | null = null;
        if (data['postedDate'] && typeof data['postedDate'] === 'string') {
          date = new Date(data['postedDate']);
        } else if (data['postedDate'] && data['postedDate'].toDate) {
          date = data['postedDate'].toDate();
        }

        if (!date || isNaN(date.getTime())) {
          console.warn(`Job with document ID "${id}" has an invalid date and will be excluded.`);
          return null;
        }

        return {
          id,
          title: data['title'] || 'Untitled Job',
          company: data['company'] || 'Unknown Company',
          companyLogo: data['companyLogo'] || '',
          location: data['location'] || 'TBA',
          jobType: data['jobType'] || 'Full-time',
          salaryRange: data['salaryRange'],
          postedDate: date,
          isFeatured: data['isFeatured'] ?? false,
          description: data['description'] || '',
          responsibilities: data['responsibilities'] || [],
          qualifications: data['qualifications'] || [],
          skills: data['skills'] || [],
        };
      },
      // Sort by most recent
      (jobs) => jobs.sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime())
    );
  }

  private listenToLegal(): void {
    this.firestoreService.listenToCollectionMapped<any, LegalDocument>(
      'legal',
      this.legalDocs,
      (id, data) => {
        let date: Date = new Date();
        if (data['lastUpdated'] && typeof data['lastUpdated'] === 'string') {
            date = new Date(data['lastUpdated']);
        } else if (data['lastUpdated'] && data['lastUpdated'].toDate) {
            date = data['lastUpdated'].toDate();
        }

        return {
          id: id,
          title: data['title'] || 'Legal Document',
          content: data['content'] || '',
          lastUpdated: date
        };
      }
    );
  }

  private listenToSupport(): void {
    this.firestoreService.listenToPath<{ [key: string]: any }>('support', (data) => {
        const info = data['info'];
        if (info) {
            this.supportInfo.set({
                id: 'info',
                phone: info.phone || '',
                email: info.email || '',
                address: info.address || '',
                workingHours: info.workingHours || '',
                faqs: info.faqs || []
            });
        }
    });
  }

  private listenToNotifications(): void {
    this.firestoreService.listenToCollectionMapped<any, Notification>(
      'notifications',
      this.notifications,
      (id, data) => {
        let date: Date = new Date();
        if (data['date'] && typeof data['date'] === 'string') {
            date = new Date(data['date']);
        } else if (data['date'] && data['date'].toDate) {
            date = data['date'].toDate();
        }

        return {
            id,
            title: data['title'] || 'Notification',
            message: data['message'] || '',
            date: date,
            read: data['read'] ?? false,
            type: data['type'] || 'info',
            link: data['link']
        };
      },
      // Sort by newest first
      (list) => list.sort((a, b) => b.date.getTime() - a.date.getTime())
    );
  }
}