
import { Injectable, signal, computed } from '@angular/core';
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
import { Offer } from '../models/offer.model';
import { AppConfig } from '../models/settings.model';
import { HubSection } from '../models/hub.model';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private articles = signal<NewsArticle[]>([]);
  private banners = signal<Banner[]>([]);
  private categories = signal<Category[]>([]);
  private countries = signal<Country[]>([]);
  private businesses = signal<Business[]>([]);
  private restaurants = signal<Business[]>([]);
  private organizations = signal<Business[]>([]);
  private events = signal<Event[]>([]);
  private jobs = signal<Job[]>([]);
  private legalDocs = signal<LegalDocument[]>([]);
  private supportInfo = signal<SupportInfo | null>(null);
  private notifications = signal<Notification[]>([]);
  private offers = signal<Offer[]>([]);
  private appSettings = signal<AppConfig | null>(null);
  
  // Hub Data
  private rawHubSections = signal<HubSection[]>([]);

  // Derived Hub State
  public hubSections = computed(() => {
    const sections = this.rawHubSections();
    return sections
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);
  });

  // Global State for Location Selection
  readonly selectedCountryId = signal<string>('AE');

  constructor(private firestoreService: FirestoreService) {
    this.listenToNews();
    this.listenToBanners();
    this.listenToCategories();
    this.listenToCountries();
    this.listenToBusinesses();
    this.listenToRestaurants();
    this.listenToOrganizations();
    this.listenToEvents();
    this.listenToJobs();
    this.listenToLegal();
    this.listenToSupport();
    this.listenToNotifications();
    this.listenToOffers();
    this.listenToSettings();
    
    // Hub Data Listener
    this.listenToHubSections();
  }

  getNews() { return this.articles.asReadonly(); }
  getBanners() { return this.banners.asReadonly(); }
  getCategories() { return this.categories.asReadonly(); }
  getCountries() { return this.countries.asReadonly(); }
  getBusinesses() { return this.businesses.asReadonly(); }
  getRestaurants() { return this.restaurants.asReadonly(); }
  getOrganizations() { return this.organizations.asReadonly(); }
  getEvents() { return this.events.asReadonly(); }
  getJobs() { return this.jobs.asReadonly(); }
  getLegalDocs() { return this.legalDocs.asReadonly(); }
  getSupportInfo() { return this.supportInfo.asReadonly(); }
  getNotifications() { return this.notifications.asReadonly(); }
  getOffers() { return this.offers.asReadonly(); }
  getAppSettings() { return this.appSettings.asReadonly(); }
  
  // Return the computed signal directly
  getHubSections() { return this.hubSections; }

  setSelectedCountry(id: string) {
    this.selectedCountryId.set(id);
  }

  async submitBusinessListing(data: any): Promise<string> {
    return this.firestoreService.addDocument('business_requests', {
        ...data,
        status: 'pending',
        isProcessed: false,
        submittedAt: new Date().toISOString()
    });
  }

  private listenToNews(): void {
    this.firestoreService.listenToCollectionMapped<any, NewsArticle>(
      'news',
      this.articles,
      // Mapper function
      (id, data) => {
        // Filter: Only allow published news.
        if (data['isPublished'] === false) {
          return null;
        }

        let date: Date | null = null;
        if (data['date'] && typeof data['date'].toDate === 'function') { date = data['date'].toDate(); }
        else if (data['publishedDate'] && typeof data['publishedDate'] === 'string') { date = new Date(data['publishedDate']); }
        else if (data['date']) { date = new Date(data['date']); }

        if (!date || isNaN(date.getTime())) {
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
          category: data['category'] || 'General',
          isFeatured: data['isFeatured'] ?? false
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
      (id, data) => {
        // Filter: Show only active banners (Check both 'active' and 'isActive' for robustness)
        const isActive = data['active'] === true || data['isActive'] === true;
        if (!isActive) {
          return null;
        }

        return {
          id,
          category: data['category'] || 'General',
          title: data['title'] || '',
          description: data['description'] || '',
          image: data['image'] || data['imageUrl'] || '',
          active: true,
          targetId: data['targetId'],
          targetType: data['targetType'],
          navigationType: data['navigationType'] || (data['targetId'] ? 'internal' : 'none'),
          order: data['order'] || 999
        };
      },
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
        path: data['tab'] ? `/${data['tab']}` : undefined,
        isActive: data['isActive'] ?? true // Default to true if not specified
      }),
      // Sort by order
      (cats) => cats.sort((a, b) => a.order - b.order)
    );
  }

  private listenToCountries(): void {
    this.firestoreService.listenToCollectionMapped<any, Country>(
      'countries',
      this.countries,
      (id, data) => {
        // Filter: Show only active countries. Default to true if property is missing.
        if (data['isActive'] === false) {
            return null;
        }

        return {
            id: id,
            name: data['name'] || id,
            flagUrl: data['flagUrl'] || '',
            cities: data['cities'] || [],
            isActive: data['isActive'] ?? true
        };
      },
      // Sort alphabetically by name
      (countries) => countries.sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  // Helper to extract contacts
  private extractContacts(data: any): { phones: string[], emails: string[] } {
    const contact = data['contact'] || {};
    
    let phones: string[] = [];
    if (Array.isArray(contact['phones'])) phones = contact['phones'];
    else if (contact['phone']) phones = [contact['phone']];
    else if (data['phone']) phones = [data['phone']];
    // Filter empty
    phones = phones.filter(p => !!p);

    let emails: string[] = [];
    if (Array.isArray(contact['emails'])) emails = contact['emails'];
    else if (contact['email']) emails = [contact['email']];
    else if (data['email']) emails = [data['email']];
    // Filter empty
    emails = emails.filter(e => !!e);

    return { phones, emails };
  }

  private listenToBusinesses(): void {
    this.firestoreService.listenToCollectionMapped<any, Business>(
      'businesses',
      this.businesses,
      (id, data) => {
        if (data['isPublished'] === false) {
          return null;
        }

        const { phones, emails } = this.extractContacts(data);
        const contact = data['contact'] || {};
        
        // Ensure isFeatured maps to isPromoted
        const isPromoted = data['isPromoted'] || data['isFeatured'] || false;

        return {
          id: id,
          name: data['name'] || data['title'] || 'Business Name',
          category: data['category'] || 'General',
          location: data['location'] || 'Unknown Location',
          rating: data['rating'] || 0,
          reviewCount: data['reviewCount'] || data['reviews'] || 0,
          imageUrl: data['imageUrl'] || '',
          logo: data['logo'] || data['logoUrl'],
          isPromoted: isPromoted,
          isVerified: data['isVerified'] ?? false,
          description: data['description'] || 'Providing excellent service to our valued customers. Contact us for more information about our products and services.',
          phone: phones.length > 0 ? phones[0] : '', // Backward compat
          phones: phones,
          email: emails.length > 0 ? emails[0] : '', // Backward compat
          emails: emails,
          website: data['website'] || contact['website'] || '',
          openingHours: data['openingHours'] || [],
          gallery: data['gallery'] || [],
          menuUrl: data['menuUrl'],
          actionType: data['actionType'],
          actionTarget: data['actionTarget'],
          actionLabel: data['actionLabel']
        };
      }
    );
  }

  private listenToRestaurants(): void {
    this.firestoreService.listenToCollectionMapped<any, Business>(
      'restaurants',
      this.restaurants,
      (id, data) => {
        if (data['isPublished'] === false) {
          return null;
        }

        const { phones, emails } = this.extractContacts(data);
        const contact = data['contact'] || {};
        
        const isPromoted = data['isFeatured'] || data['isPremium'] || data['isPromoted'] || false;

        return {
          id: id,
          name: data['title'] || 'Restaurant Name',
          category: data['cuisine'] || 'Restaurant',
          location: data['location'] || 'Dubai',
          rating: data['rating'] || 0,
          reviewCount: data['reviews'] || 0,
          imageUrl: data['imageUrl'] || '',
          logo: data['logo'] || data['logoUrl'],
          isPromoted: isPromoted,
          isVerified: data['isVerified'] ?? false,
          description: data['description'] || 'Authentic flavors and great ambiance.',
          phone: phones.length > 0 ? phones[0] : '', // Backward compat
          phones: phones,
          email: emails.length > 0 ? emails[0] : '', // Backward compat
          emails: emails,
          website: data['website'] || contact['website'] || '',
          priceRange: data['priceRange'] || '$$$',
          openingHours: data['openingHours'] || [],
          gallery: data['gallery'] || [],
          menuUrl: data['menuUrl'],
          actionType: data['actionType'],
          actionTarget: data['actionTarget'],
          actionLabel: data['actionLabel']
        };
      }
    );
  }

  private listenToOrganizations(): void {
    this.firestoreService.listenToCollectionMapped<any, Business>(
      'organizations',
      this.organizations,
      (id, data) => {
        if (data['isPublished'] === false) {
          return null;
        }

        const { phones, emails } = this.extractContacts(data);
        const contact = data['contact'] || {};

        return {
          id: id,
          name: data['name'] || data['title'] || 'Association Name',
          category: data['category'] || 'Association',
          location: data['location'] || 'Unknown Location',
          rating: data['rating'] || 0,
          reviewCount: data['reviewCount'] || data['reviews'] || 0,
          imageUrl: data['imageUrl'] || '',
          logo: data['logo'] || data['logoUrl'],
          isPromoted: data['isPromoted'] ?? false,
          isVerified: data['isVerified'] ?? false,
          description: data['description'] || 'Serving the community.',
          phone: phones.length > 0 ? phones[0] : '',
          phones: phones,
          email: emails.length > 0 ? emails[0] : '',
          emails: emails,
          website: data['website'] || contact['website'] || '',
          openingHours: data['openingHours'] || [],
          gallery: data['gallery'] || [],
          menuUrl: data['menuUrl'],
          actionType: data['actionType'],
          actionTarget: data['actionTarget'],
          actionLabel: data['actionLabel']
        };
      }
    );
  }

  private listenToEvents(): void {
    this.firestoreService.listenToCollectionMapped<any, Event>(
      'events',
      this.events,
      // Mapper function
      (id, data) => {
        // Debugging for Iftar Event issues
        if (data['title'] && (data['title'].includes('IFTAR') || data['title'].includes('Iftar'))) {
             console.log('Found Iftar Event in DB Stream:', id, data);
        }

        if (data['isPublished'] === false) {
          return null;
        }

        let date: Date | null = null;
        
        try {
            // 1. Try composite New JSON format
            if (data['fullDate']) {
              const timeStr = data['startTime'] || '00:00';
              date = new Date(`${data['fullDate']} ${timeStr}`);
            } 
            // 2. Try 'startDate' (Common alternative)
            else if (data['startDate']) {
                 if (typeof data['startDate'].toDate === 'function') date = data['startDate'].toDate();
                 else date = new Date(data['startDate']);
            }
            // 3. Try Firestore Timestamp 'date'
            else if (data['date'] && typeof data['date'].toDate === 'function') { 
              date = data['date'].toDate(); 
            }
            // 4. Try String 'eventDate'
            else if (data['eventDate']) { 
              date = new Date(data['eventDate']); 
            }
            // 5. Try String 'publishedDate'
            else if (data['publishedDate']) {
              date = new Date(data['publishedDate']);
            }
            // 6. Try String 'date'
            else if (data['date']) { 
                date = new Date(data['date']);
            }
        } catch (e) {
            // Ignore error
        }

        // Final Fallback: If date is still invalid, use current date to ensure it shows up
        if (!date || isNaN(date.getTime())) {
          date = new Date(); 
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
          organizerId: data['organizerId'],
          isFeatured: data['isFeatured'] ?? false,
          gallery: data['gallery'] || [],
          actionType: data['actionType'],
          actionTarget: data['actionTarget'],
          actionLabel: data['actionLabel'],
          countryCode: data['countryCode']
        };
      },
      // Processor function
      (events) => events.sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort by newest/future first (Descending)
    );
  }

  private listenToJobs(): void {
    this.firestoreService.listenToCollectionMapped<any, Job>(
      'jobs',
      this.jobs,
      (id, data) => {
        // Filter: Only allow published jobs.
        if (data['isPublished'] === false) {
          return null;
        }

        let date: Date | null = null;
        if (data['postedDate'] && typeof data['postedDate'] === 'string') {
          date = new Date(data['postedDate']);
        } else if (data['postedDate'] && typeof data['postedDate'].toDate === 'function') {
          date = data['postedDate'].toDate();
        }

        if (!date || isNaN(date.getTime())) {
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
        } else if (data['lastUpdated'] && typeof data['lastUpdated'].toDate === 'function') {
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
        } else if (data['date'] && typeof data['date'].toDate === 'function') {
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

  private listenToOffers(): void {
    this.firestoreService.listenToCollectionMapped<any, Offer>(
      'offers',
      this.offers,
      (id, data) => {
        // Filter: Show only active offers
        if (data['isActive'] !== true) {
          return null;
        }

        let date = new Date();
        if (data['expiryDate']) {
            if (typeof data['expiryDate'] === 'string') date = new Date(data['expiryDate']);
            else if (typeof data['expiryDate'].toDate === 'function') date = data['expiryDate'].toDate();
        }

        return {
            id: id,
            title: data['title'] || 'Special Offer',
            // Map either targetName or businessName for compatibility
            targetName: data['targetName'] || data['businessName'] || '',
            discount: data['discount'] || '',
            description: data['description'] || '',
            image: data['image'] || '',
            expiryDate: date,
            businessId: data['businessId'],
            targetId: data['targetId'],
            color: data['color'] || '#EFF6FF',
            order: data['order'],
            isSectionBanner: data['isSectionBanner'] ?? false,
            linkType: data['linkType'],
            isHomeBanner: data['isHomeBanner'] ?? false
        };
      },
      // Sort by order (ascending)
      (items) => items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    );
  }

  private listenToSettings(): void {
    this.firestoreService.listenToDocument<AppConfig>('settings', 'app_config', (data) => {
       if (data) {
         this.appSettings.set(data);
       }
    });
  }

  // --- Hub Logic (Document-Oriented: Nested Items) ---

  private listenToHubSections(): void {
    this.firestoreService.listenToCollectionMapped<any, HubSection>(
      'hub_sections',
      this.rawHubSections,
      (id, data) => {
        const title = data['title'] || '';
        
        // Auto-detect layout: If explicitly set, use it. 
        // If not, check if title contains 'Emergency' to default to 'row'.
        let layout: 'list' | 'grid' | 'row' = 'list';
        
        if (data['displayStyle'] === 'grid' || data['layout'] === 'grid') {
            layout = 'grid';
        } else if (data['displayStyle'] === 'row' || data['layout'] === 'row' || data['displayStyle'] === 'slide') {
            layout = 'row';
        } else if (title.toLowerCase().includes('emergency')) {
            // Auto-switch to row layout for Emergency numbers if not explicitly set to something else
            layout = 'row';
        }

        return {
          id,
          title: title,
          subTitle: data['subtitle'] || '',
          order: data['order'] || 99,
          layout: layout,
          // Map isVisible/enabled and isActive to enabled
          enabled: data['isActive'] ?? data['isVisible'] ?? data['enabled'] ?? true,
          // Map isTitleVisible
          isTitleVisible: data['isTitleVisible'] ?? true,
          items: (data['items'] || []).map((item: any) => ({
            id: item.id,
            label: item.title || '',
            subLabel: item.subtitle,
            // Map iconUrl to iconUrl, and fallback to icon string if present
            icon: item.icon || 'star',
            iconUrl: item.iconUrl,
            // Map 'link' to 'url', fallback to whatever is there
            actionType: item.actionType === 'link' ? 'url' : (item.actionType || 'route'),
            actionValue: item.actionValue || '',
            colorClass: item.colorClass,
            order: item.order || 99
          })).sort((a: any, b: any) => (a.order || 99) - (b.order || 99))
        };
      }
    );
  }
}
