import { signal } from '@angular/core';
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
import { Grocery } from '../models/grocery.model';

// This file centralizes the application's reactive state using signals.
// Each signal represents a slice of the application's data.

export const articles = signal<NewsArticle[]>([]);
export const banners = signal<Banner[]>([]);
export const categories = signal<Category[]>([]);
export const countries = signal<Country[]>([]);
export const businesses = signal<Business[]>([]);
export const restaurants = signal<Business[]>([]);
export const organizations = signal<Business[]>([]);
export const events = signal<Event[]>([]);
export const jobs = signal<Job[]>([]);
export const legalDocs = signal<LegalDocument[]>([]);
export const supportInfo = signal<SupportInfo | null>(null);
export const notifications = signal<Notification[]>([]);
export const offers = signal<Offer[]>([]);
export const appSettings = signal<AppConfig | null>(null);
export const rawHubSections = signal<HubSection[]>([]);
export const groceries = signal<Grocery[]>([]);

// Global State for Location Selection
export const selectedCountryId = signal<string>('AE');
