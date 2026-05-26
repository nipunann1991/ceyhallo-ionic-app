
import { Injectable, computed } from '@angular/core';
import * as appState from '../state/data.state';
import { NewsArticle } from '../models/news.model';
import { Banner } from '../models/banner.model';
import { Category } from '../models/category.model';
import { Country } from '../models/country.model';
import { Business, BusinessLocation, BusinessOpeningHour } from '../models/business.model';
import { Event } from '../models/event.model';
import { Job } from '../models/job.model';
import { LegalDocument } from '../models/legal.model';
import { SupportInfo } from '../models/support.model';
import { Notification } from '../models/notification.model';
import { Offer } from '../models/offer.model';
import { AppConfig, NewsCategoriesConfig, NewsCategoryItem } from '../models/settings.model';
import { HubSection } from '../models/hub.model';
import { FirestoreService } from './firestore.service';
import { AuthService } from './auth.service';
import { mapNotificationDocument } from '../utils/notification.utils';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private notificationFeedItems: Notification[] = [];
  private pushQueueItems: Notification[] = [];
  private notificationsUnsubscribe: (() => void) | null = null;
  private pushQueueUnsubscribe: (() => void) | null = null;


  // Derived Hub State
  public hubSections = computed(() => {
    const sections = appState.rawHubSections();
    return sections
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);
  });

  readonly selectedCountryId = appState.selectedCountryId;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {
    this.listenToNews();
    this.listenToBanners();
    this.listenToCategories();
    this.listenToCountries();
    this.listenToBusinesses();
    this.listenToEvents();
    this.listenToJobs();
    this.listenToLegal();
    this.listenToSupport();
    this.listenToOffers();
    this.listenToSettings();
    
    // Hub Data Listener
    this.listenToHubSections();

    this.authService.authState$.subscribe((user) => {
      if (user === undefined) {
        return;
      }

      this.restartNotificationListeners(!!user);
    });
  }

  getNews() { return appState.articles.asReadonly(); }
  getBanners() { return appState.banners.asReadonly(); }
  getCategories() { return appState.categories.asReadonly(); }
  getCountries() { return appState.countries.asReadonly(); }
  getBusinesses() { return appState.businesses.asReadonly(); }
  
  getEvents() { return appState.events.asReadonly(); }
  getJobs() { return appState.jobs.asReadonly(); }
  getLegalDocs() { return appState.legalDocs.asReadonly(); }
  getSupportInfo() { return appState.supportInfo.asReadonly(); }
  getNotifications() { return appState.notifications.asReadonly(); }
  getOffers() { return appState.offers.asReadonly(); }
  getAppSettings() { return appState.appSettings.asReadonly(); }
  getNewsCategories() { return appState.newsCategories.asReadonly(); }
  
  // Return the computed signal directly
  getHubSections() { return this.hubSections; }

  setSelectedCountry(id: string) {
    this.selectedCountryId.set(id);
  }

  refreshAllData() {
    // In a real-time app, data is pushed automatically.
    // We could force a re-fetch here if we were using one-time gets.
    // For now, this is a placeholder to satisfy the UI refresh action.
    console.log('Refreshing data...');

    if (this.authService.currentUser()) {
      this.restartNotificationListeners(true);
    }
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
      appState.articles,
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
      appState.banners,
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
      appState.categories,
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
      appState.countries,
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

  private extractContactsFromRecord(record: any): { phones: string[]; emails: string[] } {
    if (!record || typeof record !== 'object') {
      return { phones: [], emails: [] };
    }

    const contact = record['contact'] || record['contacts'] || {};

    let phones: string[] = [];
    if (Array.isArray(record['phones'])) phones = record['phones'];
    else if (Array.isArray(contact['phones'])) phones = contact['phones'];
    else if (record['phone']) phones = [record['phone']];
    else if (contact['phone']) phones = [contact['phone']];
    phones = phones.filter((p) => typeof p === 'string' && p.trim().length > 0).map((p) => p.trim());

    let emails: string[] = [];
    if (Array.isArray(record['emails'])) emails = record['emails'];
    else if (Array.isArray(contact['emails'])) emails = contact['emails'];
    else if (record['email']) emails = [record['email']];
    else if (contact['email']) emails = [contact['email']];
    emails = emails.filter((e) => typeof e === 'string' && e.trim().length > 0).map((e) => e.trim());

    return { phones, emails };
  }

  private normalizeOpeningHours(raw: any): BusinessOpeningHour[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((row) => {
        if (!row || typeof row !== 'object') {
          return null;
        }

        const days = typeof row['days'] === 'string' ? row['days'] : undefined;
        const time = typeof row['time'] === 'string' ? row['time'] : undefined;
        const day = typeof row['day'] === 'string' ? row['day'] : undefined;
        const hours = typeof row['hours'] === 'string' ? row['hours'] : undefined;

        const normalized: BusinessOpeningHour = {
          ...(days ? { days } : {}),
          ...(time ? { time } : {}),
          ...(day ? { day } : {}),
          ...(hours ? { hours } : {}),
        };

        if (Object.keys(normalized).length === 0) {
          return null;
        }

        return normalized;
      })
      .filter((row): row is BusinessOpeningHour => row !== null);
  }

  private extractBusinessLocations(data: any): BusinessLocation[] {
    const rawLocations = data?.['locations'] ?? data?.['branches'] ?? data?.['outlets'];
    if (!Array.isArray(rawLocations)) {
      return [];
    }

    return rawLocations
      .map((row, index) => {
        if (!row || typeof row !== 'object') {
          return null;
        }

        const isPrimary = row['isPrimary'] === true || row['primary'] === true;

        const label =
          (typeof row['label'] === 'string' && row['label'].trim()) ||
          (typeof row['name'] === 'string' && row['name'].trim()) ||
          (typeof row['title'] === 'string' && row['title'].trim()) ||
          (rawLocations.length > 1 ? `Branch ${index + 1}` : undefined);

        const address =
          (typeof row['address'] === 'string' && row['address'].trim()) ||
          (typeof row['location'] === 'string' && row['location'].trim()) ||
          (typeof row['fullAddress'] === 'string' && row['fullAddress'].trim()) ||
          undefined;

        const city = typeof row['city'] === 'string' ? row['city'].trim() : undefined;
        const country =
          typeof row['country'] === 'string'
            ? row['country'].trim()
            : typeof row['region'] === 'string'
              ? row['region'].trim()
              : undefined;

        const cityCode = typeof row['cityCode'] === 'string' ? row['cityCode'].trim() : undefined;
        const countryCode = typeof row['countryCode'] === 'string' ? row['countryCode'].trim() : undefined;
        const googlePlaceId =
          typeof row['googlePlaceId'] === 'string'
            ? row['googlePlaceId'].trim()
            : typeof row['google_place_id'] === 'string'
              ? row['google_place_id'].trim()
              : undefined;
        const rating = typeof row['rating'] === 'number' ? row['rating'] : undefined;
        const reviews = typeof row['reviews'] === 'number' ? row['reviews'] : undefined;

        const lat =
          typeof row['lat'] === 'number'
            ? row['lat']
            : typeof row['latitude'] === 'number'
              ? row['latitude']
              : undefined;
        const lng =
          typeof row['lng'] === 'number'
            ? row['lng']
            : typeof row['longitude'] === 'number'
              ? row['longitude']
              : undefined;

        const mapIframe =
          (typeof row['mapIframe'] === 'string' && row['mapIframe'].trim()) ||
          (typeof row['map_iframe'] === 'string' && row['map_iframe'].trim()) ||
          (typeof row['mapEmbed'] === 'string' && row['mapEmbed'].trim()) ||
          (typeof row['map_embed'] === 'string' && row['map_embed'].trim()) ||
          undefined;
        const mapQuery =
          (typeof row['mapQuery'] === 'string' && row['mapQuery'].trim()) ||
          (typeof row['map_query'] === 'string' && row['map_query'].trim()) ||
          undefined;

        const { phones, emails } = this.extractContactsFromRecord(row);
        const website =
          (typeof row['website'] === 'string' && row['website'].trim()) ||
          (typeof row?.['contact']?.['website'] === 'string' && row['contact']['website'].trim()) ||
          undefined;

        const openingHours = this.normalizeOpeningHours(
          row['openingHours'] ?? row['opening_hours'] ?? row['hours'] ?? row['workingHours']
        );

        const normalized: BusinessLocation = {
          ...(isPrimary ? { isPrimary: true } : {}),
          ...(label ? { label } : {}),
          ...(address ? { address } : {}),
          ...(city ? { city } : {}),
          ...(country ? { country } : {}),
          ...(cityCode ? { cityCode } : {}),
          ...(countryCode ? { countryCode } : {}),
          ...(googlePlaceId ? { googlePlaceId } : {}),
          ...(typeof rating === 'number' ? { rating } : {}),
          ...(typeof reviews === 'number' ? { reviews } : {}),
          ...(typeof lat === 'number' ? { latitude: lat } : {}),
          ...(typeof lng === 'number' ? { longitude: lng } : {}),
          ...(mapIframe ? { mapIframe } : {}),
          ...(mapQuery ? { mapQuery } : {}),
          ...(phones.length > 0 ? { phones } : {}),
          ...(emails.length > 0 ? { emails } : {}),
          ...(website ? { website } : {}),
          ...(openingHours.length > 0 ? { openingHours } : {}),
        };

        if (Object.keys(normalized).length === 0) {
          return null;
        }

        return normalized;
      })
      .filter((row): row is BusinessLocation => row !== null);
  }

  private listenToBusinesses(): void {
    this.firestoreService.listenToCollectionMapped<any, Business>(
      'businesses',
      appState.businesses,
      (id, data) => {
        if (data['isPublished'] === false) {
          return null;
        }

        const locations = this.extractBusinessLocations(data);
        const { phones: legacyPhones, emails: legacyEmails } = this.extractContacts(data);
        const contact = data['contact'] || {};
        
        // Ensure isFeatured maps to isPromoted
        const isPromoted = data['isPromoted'] || data['isFeatured'] || false;

        const primaryLocation = locations.find((loc) => loc.isPrimary) ?? (locations.length > 0 ? locations[0] : undefined);
        const locationLabel =
          primaryLocation?.address ||
          primaryLocation?.city ||
          (typeof data['location'] === 'string' && data['location'].trim()) ||
          'Unknown Location';

        const primaryPhones = (primaryLocation?.phones ?? []).filter(Boolean);
        const phones = (primaryPhones.length > 0 ? primaryPhones : legacyPhones)
          .filter((p, idx, arr) => arr.indexOf(p) === idx);

        const primaryEmails = (primaryLocation?.emails ?? []).filter(Boolean);
        const emails = (primaryEmails.length > 0 ? primaryEmails : legacyEmails)
          .filter((e, idx, arr) => arr.indexOf(e) === idx);

        const openingHours =
          (primaryLocation?.openingHours && primaryLocation.openingHours.length > 0)
            ? primaryLocation.openingHours
            : this.normalizeOpeningHours(data['openingHours']);

        const rating =
          typeof primaryLocation?.rating === 'number'
            ? primaryLocation.rating
            : (typeof data['rating'] === 'number' ? data['rating'] : 0);
        const reviewCount =
          typeof primaryLocation?.reviews === 'number'
            ? primaryLocation.reviews
            : (data['reviewCount'] || data['reviews'] || 0);

        return {
          id: id,
          name: data['name'] || data['title'] || 'Business Name',
          category: data['category'] || 'General',
          location: locationLabel,
          rating,
          reviewCount,
          imageUrl: data['imageUrl'] || '',
          logo: data['logo'] || data['logoUrl'],
          isPromoted: isPromoted,
          isVerified: data['isVerified'] ?? false,
          cityCode: primaryLocation?.cityCode || data['cityCode'],
          countryCode: primaryLocation?.countryCode || data['countryCode'],
          description: data['description'] || 'Providing excellent service to our valued customers. Contact us for more information about our products and services.',
          phone: phones.length > 0 ? phones[0] : '', // Backward compat
          phones: phones,
          email: emails.length > 0 ? emails[0] : '', // Backward compat
          emails: emails,
          website: data['website'] || contact['website'] || '',
          openingHours,
          locations: locations.length > 0 ? locations : undefined,
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
      appState.events,
      // Mapper function
      (id, data) => {
        // Debugging for Iftar Event issues
        if (data['title'] && (data['title'].includes('IFTAR') || data['title'].includes('Iftar'))) {

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
          countryCode: data['countryCode'],
          cityCode: data['cityCode'],
          isExpired: data['isExpired'],
          isArchived: data['isArchived']
        };
      },
      // Processor function
      (events) => {
        const now = new Date();
        const upcoming = events.filter(e => e.date >= now);
        const past = events.filter(e => e.date < now);

        upcoming.sort((a, b) => a.date.getTime() - b.date.getTime()); // Ascending for upcoming
        past.sort((a, b) => b.date.getTime() - a.date.getTime()); // Descending for past

        return [...upcoming, ...past];
      }
    );
  }

  private listenToJobs(): void {
    this.firestoreService.listenToCollectionMapped<any, Job>(
      'jobs',
      appState.jobs,
      (id, data) => {
        // Filter: Only allow published jobs.
        if (data['isPublished'] === false) {
          return null;
        }

        let date: Date = new Date(); // Default to current date
        try {
            if (data['postedDate']) {
                if (typeof data['postedDate'].toDate === 'function') date = data['postedDate'].toDate();
                else if (typeof data['postedDate'] === 'string') date = new Date(data['postedDate']);
                else if (data['postedDate'] instanceof Date) date = data['postedDate'];
            }
        } catch (e) {
            // Fallback to default date if parsing fails
        }

        if (isNaN(date.getTime())) {
          return null; // If still invalid, filter out
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
    const defaultLegalDocs: LegalDocument[] = [
        { 
            id: 'privacy', 
            title: 'Privacy Policy', 
            content: '<h2>Privacy Policy</h2><p>This is a placeholder for the privacy policy. Please update the content in the backend.</p>', 
            lastUpdated: new Date() 
        },
        { 
            id: 'terms', 
            title: 'Terms & Conditions', 
            content: '<h2>Terms & Conditions</h2><p>This is a placeholder for the terms and conditions. Please update the content in the backend.</p>', 
            lastUpdated: new Date() 
        },
        { 
            id: 'help', 
            title: 'Help & Support', 
            content: '<h2>Help & Support</h2><p>This is a placeholder for help and support. Please update the content in the backend.</p>', 
            lastUpdated: new Date() 
        }
    ];

    this.firestoreService.listenToPath<{ [key: string]: any }>('legal', (dataObject) => {
        const docs = Object.keys(dataObject).map(id => {
            const data = dataObject[id];
            let date: Date = new Date();
            
            // Check for updatedAt (from user JSON) or lastUpdated
            const dateField = data['updatedAt'] || data['lastUpdated'];
            
            if (dateField && typeof dateField === 'string') {
                date = new Date(dateField);
            } else if (dateField && typeof dateField.toDate === 'function') {
                date = dateField.toDate();
            }

            // Map ID to friendly title if not provided
            let title = data['title'];
            if (!title) {
                if (id === 'help') title = 'Help & Support';
                else if (id === 'privacy') title = 'Privacy Policy';
                else if (id === 'terms') title = 'Terms & Conditions';
                else title = 'Legal Document';
            }

            return {
              id: id,
              title: title,
              content: data['content'] || '',
              lastUpdated: date
            };
        });

        if (docs.length === 0) {
             console.warn('No legal docs found. Using defaults.');
             appState.legalDocs.set(defaultLegalDocs);
        } else {
             appState.legalDocs.set(docs);
        }
    }, (error) => {
        console.warn('Error fetching legal docs. Using defaults.', error);
        appState.legalDocs.set(defaultLegalDocs);
    });
  }

  private listenToSupport(): void {
    const defaultSupport = {
        id: 'info',
        phone: '+971 50 123 4567',
        email: 'support@ceyhallo.com',
        address: 'Dubai, UAE',
        workingHours: 'Mon - Fri, 9am - 6pm',
        faqs: [
            { id: '1', question: 'How do I reset my password?', answer: 'Go to Profile > Change Password to update your credentials.' },
            { id: '2', question: 'How can I verify my account?', answer: 'Request a verification code from your profile and enter the code sent to your email.' },
            { id: '3', question: 'Is the app free?', answer: 'Yes, CeyHallo is completely free to download and use.' }
        ]
    };

    this.firestoreService.listenToPath<{ [key: string]: any }>(
        'support', 
        (data) => {
            const info = data['info'];
            if (info) {
                appState.supportInfo.set({
                    id: 'info',
                    phone: info.phone || '',
                    email: info.email || '',
                    address: info.address || '',
                    workingHours: info.workingHours || '',
                    faqs: info.faqs || []
                });
            } else {
                console.warn('Support document not found. Using default configuration.');
                appState.supportInfo.set(defaultSupport);
            }
        },
        (error) => {
            console.warn('Error fetching support info. Using default configuration.', error);
            appState.supportInfo.set(defaultSupport);
        }
    );
  }

  private listenToNotifications(): void {
    this.notificationsUnsubscribe = this.firestoreService.listenToPath<{ [key: string]: any }>('notifications', (dataObject) => {
      this.notificationFeedItems = Object.keys(dataObject)
        .map((id) => mapNotificationDocument(id, dataObject[id], 'feed'))
        .filter((item): item is Notification => item !== null)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      this.syncNotifications();
    }, () => {
      this.notificationFeedItems = [];
      this.syncNotifications();
    });
  }

  private listenToPushQueue(): void {
    this.pushQueueUnsubscribe = this.firestoreService.listenToPath<{ [key: string]: any }>('push_queue', (dataObject) => {
      this.pushQueueItems = Object.keys(dataObject)
        .map((id) => mapNotificationDocument(id, dataObject[id], 'queue'))
        .filter((item): item is Notification => item !== null)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      this.syncNotifications();
    }, () => {
      this.pushQueueItems = [];
      this.syncNotifications();
    });
  }

  private syncNotifications(): void {
    appState.notifications.set(
      [...this.notificationFeedItems, ...this.pushQueueItems]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
    );
  }

  private restartNotificationListeners(isLoggedIn: boolean): void {
    if (this.notificationsUnsubscribe) {
      this.notificationsUnsubscribe();
      this.notificationsUnsubscribe = null;
    }

    if (this.pushQueueUnsubscribe) {
      this.pushQueueUnsubscribe();
      this.pushQueueUnsubscribe = null;
    }

    this.notificationFeedItems = [];
    this.pushQueueItems = [];
    this.syncNotifications();

    if (!isLoggedIn) {
      return;
    }

    this.listenToNotifications();
    this.listenToPushQueue();
  }

  private listenToOffers(): void {
    this.firestoreService.listenToCollectionMapped<any, Offer>(
      'offers',
      appState.offers,
      (id, data) => {
        // Filter: Show only active offers (support both isActive and isPublished)
        if (data['isActive'] === false || data['isPublished'] === false) {
          return null;
        }

        let date: Date = new Date(); // Default to current date
        try {
            const rawEndDate = data['endDate'] || data['expiryDate'];
            if (rawEndDate) {
                if (typeof rawEndDate.toDate === 'function') date = rawEndDate.toDate();
                else if (typeof rawEndDate === 'string') date = new Date(rawEndDate);
                else if (rawEndDate instanceof Date) date = rawEndDate;
            }
        } catch (e) {
            // Fallback to default date if parsing fails
        }

        return {
            id: id,
            title: data['title'] || 'Special Offer',
            // Map either targetName or businessName for compatibility
            targetName: data['targetName'] || data['businessName'] || '',
            offerBy: data['offerBy'] || data['offer_by'] || '',
            discount: data['discount'] || '',
            description: data['description'] || '',
            content: data['content'] || data['details'] || '',
            image: data['image'] || '',
            expiryDate: date,
            endDate: data['endDate'] ? date : undefined,
            businessId: data['businessId'],
            targetId: data['targetId'],
            color: data['color'] || '#EFF6FF',
            order: data['order'],
            isSectionBanner: data['isSectionBanner'] ?? false,
            linkType: data['linkType'],
            isHomeBanner: data['isHomeBanner'] ?? false,
            cityCode: data['cityCode'],
            countryCode: data['countryCode'],
            generalCategory: data['generalCategory'] || data['category'] || '',
            categories: data['categories'] || []
        };
      },
      // Sort by order (ascending)
      (items) => items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    );
  }

  private listenToSettings(): void {
    this.firestoreService.listenToDocument<AppConfig>('settings', 'app_config', (data) => {
       if (data) {
         appState.appSettings.set(data);
       } else {
         // Fallback default configuration if settings document is missing
         console.warn('Settings document not found. Using default configuration.');
         appState.appSettings.set({
            showSocialLogin: true,
            maintenanceMode: false,
            showAiBot: true,
            homeSections: [
                {
                    id: 'banners',
                    template: 'banners',
                    dataSource: 'banners',
                    title: '',
                    enabled: true,
                    order: 0
                },
                {
                    id: 'categories',
                    template: 'categories',
                    dataSource: 'categories',
                    title: 'Categories',
                    enabled: true,
                    order: 1
                },
                {
                    id: 'featured_businesses',
                    template: 'featured_businesses',
                    dataSource: 'businesses',
                    title: 'Featured Businesses',
                    enabled: true,
                    order: 2,
                    filterData: [{ filterType: 'isFeatured', filterValue: true }]
                },
                {
                    id: 'latest_news',
                    template: 'news_feed',
                    dataSource: 'news',
                    title: 'Latest News',
                    enabled: true,
                    order: 3
                }
            ]
         });
       }
    });

    this.firestoreService.listenToDocument<NewsCategoriesConfig>('settings', 'news_categories', (data) => {
      if (data?.categories && Array.isArray(data.categories)) {
        const categories = data.categories
          .filter((item): item is NewsCategoryItem => !!item && typeof item.name === 'string')
          .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
        appState.newsCategories.set(categories);
      } else {
        appState.newsCategories.set([]);
      }
    });
  }

  // --- Hub Logic (Document-Oriented: Nested Items) ---

  private listenToHubSections(): void {
    this.firestoreService.listenToCollectionMapped<any, HubSection>(
      'hub_sections',
      appState.rawHubSections,
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
