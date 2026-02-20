
import { Component, ChangeDetectionStrategy, signal, computed, viewChild, ElementRef, OnInit, Signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { PushNotificationService } from '../../services/push-notifications.service';
import { BannerComponent } from '../../components/banner/banner.component';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { BusinessDetailComponent } from '../business-detail/business-detail.component';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { JobDetailComponent } from '../job-detail/job-detail.component';
import { BusinessCardComponent } from '../../components/business-card/business-card.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { OfferCardComponent } from '../../components/offer-card/offer-card.component';
import { handleImageError } from '../../utils/image.utils';
import { Banner } from '../../models/banner.model';
import { NewsArticle } from '../../models/news.model';
import { Offer } from '../../models/offer.model';
import { LoginComponent } from '../login/login.component';
import { Country } from '../../models/country.model';
import { Category } from '../../models/category.model';
import { AppConfig, HomeSection } from '../../models/settings.model';
import { Business } from '../../models/business.model';
import { Grocery } from '../../models/grocery.model';

@Component({
  selector: 'app-home',
  template: `
<ion-content [fullscreen]="true" class="[--background:#F2F4F7]" [forceOverscroll]="false">
  
  <!-- Custom Header Section (Static) -->
  <div class="relative bg-[#083594] home-header pb-16 px-5 rounded-b-[2.5rem] shadow-sm z-0">
    <!-- User Info Row -->
    <div class="flex items-center justify-between mb-2">
      <div (click)="goToProfile()" class="flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity">
        <!-- Avatar with Online Dot -->
        <div class="relative">
          <div class="w-12 h-12 rounded-full border-2 border-white/20 bg-white/20 flex items-center justify-center text-white overflow-hidden">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M5 21C5.61754 18.2372 7.9899 16 10.8 16H13.2C16.0101 16 18.3825 18.2372 19 21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            <!-- <img [src]="user().avatar" [alt]="user().name" class="w-full h-full object-cover"> -->
          </div>
       
          <div class="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#4ADE80] border-[2px] border-[#083594] rounded-full z-10"></div>
        </div>
        
        <!-- Welcome Text -->
        <div class="text-white flex flex-col justify-center">
          <div class="flex items-center gap-2">
             <h2 class="text-[1.1rem] font-bold tracking-tight">Hello {{ user().name }}</h2>
             <span class="text-xl animate-wave">👋</span>
          </div>
          
          @if (user().isLoggedIn) {
             @if (user().isVerified) {
                <p class="text-[0.75rem] text-blue-100/90 font-medium leading-tight tracking-wide">Proud to be a CeyHallo member.</p>
             } @else {
                <!-- Warning Message (Yellow) -->
                <button (click)="resendVerification(); $event.stopPropagation()" class="flex items-center gap-1.5 opacity-100 group mt-1">
                   <ion-icon name="alert-circle" class="text-[#FCD34D] text-[1rem]"></ion-icon>
                   <p class="text-[0.75rem] text-[#FCD34D] leading-tight group-active:opacity-80">Email not verified. Resend link.</p>
                </button>
             }
          }
        </div>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-3">
         <!-- Country Flag Selector -->
         <button 
            (click)="openCountrySelector()"
            class="w-9 h-9 rounded-full overflow-hidden shadow-sm shrink-0 active:scale-90 transition-transform bg-white/10 backdrop-blur-md"
            style="border: 2px solid rgb(255 255 255 / 17%);">
            @if (currentCountry(); as country) {
              <img [src]="country.flagUrl || 'https://i.ibb.co/nNsGtRqn/placeholder-80x80.png'" (error)="handleImgError($event)" class="w-full h-full object-fill" [style.object-fit]="country.flagUrl ? 'fill' : 'none'" [class.bg-gray-200]="!country.flagUrl" [alt]="country.name">
            } @else {
              <!-- Skeleton loader for flag -->
              <div class="w-full h-full bg-white/20 animate-pulse"></div>
            }
         </button>
         
         <!-- Notification Bell -->
         <button routerLink="/notifications" class="relative w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white active:scale-90 transition-transform">
            <svg width="24" height="26" viewBox="0 0 29 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4513 24.6733C11.817 24.6733 11.3347 25.2646 11.6665 25.8051C12.2508 26.7571 13.3015 27.3921 14.5005 27.3921C15.6994 27.3921 16.75 26.7571 17.3345 25.8051C17.6663 25.2646 17.184 24.6733 16.5497 24.6733C16.146 24.6733 15.7993 24.9392 15.4958 25.2052C15.2301 25.4383 14.8817 25.5796 14.5005 25.5796C14.1191 25.5796 13.7709 25.4383 13.5051 25.2052C13.2016 24.9392 12.8549 24.6733 12.4513 24.6733Z" fill="white"/>
                <mask id="mask0_283_630" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="4" y="4" width="21" height="20">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M23.5628 15.1104C23.5628 11.4995 21.7705 8.12404 18.7792 6.10147L17.2076 5.03884C15.5721 3.93302 13.4285 3.93302 11.793 5.03884L10.2215 6.10146C7.23015 8.12404 5.43783 11.4995 5.43783 15.1104V17.423C4.69621 18.0868 4.22949 19.0514 4.22949 20.125C4.22949 22.1271 5.85247 23.75 7.85449 23.75H21.1462C23.1482 23.75 24.7712 22.1271 24.7712 20.125C24.7712 19.0514 24.3044 18.0868 23.5628 17.423V15.1104Z" fill="white"/>
                </mask>
                <g mask="url(#mask0_283_630)">
                <path d="M18.7792 6.10147L17.7639 7.60295L18.7792 6.10147ZM23.5628 15.1104H25.3753H23.5628ZM17.2076 5.03883L18.2228 3.53735L17.2076 5.03883ZM11.793 5.03883L10.7778 3.53735L11.793 5.03883ZM10.2215 6.10145L11.2367 7.60295L10.2215 6.10145ZM5.43783 15.1104H7.25033H5.43783ZM5.43783 17.423L6.64661 18.7736L7.25033 18.2332V17.423H5.43783ZM23.5628 17.423H21.7503V18.2332L22.354 18.7736L23.5628 17.423ZM17.7639 7.60295C20.2567 9.28842 21.7503 12.1013 21.7503 15.1104H25.3753C25.3753 10.8977 23.2843 6.95964 19.7944 4.59997L17.7639 7.60295ZM16.1924 6.54032L17.7639 7.60295L19.7944 4.59997L18.2228 3.53735L16.1924 6.54032ZM12.8083 6.54032C13.8304 5.84919 15.1702 5.84919 16.1924 6.54032L18.2228 3.53735C15.974 2.01685 13.0266 2.01685 10.7778 3.53735L12.8083 6.54032ZM11.2367 7.60295L12.8083 6.54032L10.7778 3.53735L9.20623 4.59997L11.2367 7.60295ZM7.25033 15.1104C7.25033 12.1013 8.74392 9.28842 11.2367 7.60295L9.20623 4.59997C5.71636 6.95964 3.62533 10.8977 3.62533 15.1104H7.25033ZM7.25033 17.423V15.1104H3.62533V17.423H7.25033ZM6.04199 20.125C6.04199 19.5884 6.2729 19.108 6.64661 18.7736L4.22904 16.0725C3.11952 17.0655 2.41699 18.5144 2.41699 20.125H6.04199ZM7.85449 21.9375C6.85347 21.9375 6.04199 21.126 6.04199 20.125H2.41699C2.41699 23.128 4.85145 25.5625 7.85449 25.5625V21.9375ZM21.1462 21.9375H7.85449V25.5625H21.1462V21.9375ZM22.9587 20.125C22.9587 21.126 22.1471 21.9375 21.1462 21.9375V25.5625C24.1492 25.5625 26.5837 23.128 26.5837 20.125H22.9587ZM22.354 18.7736C22.7277 19.108 22.9587 19.5884 22.9587 20.125H26.5837C26.5837 18.5144 25.8811 17.0655 24.7716 16.0725L22.354 18.7736ZM21.7503 15.1104V17.423H25.3753V15.1104H21.7503Z" fill="white"/>
                </g>
                <g filter="url(#filter0_d_283_630)">
                <circle cx="20.5" cy="6.5" r="4.5" fill="#FF5F57"/>
                </g>
                <defs>
                <filter id="filter0_d_283_630" x="12" y="2" width="17" height="17" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.984314 0 0 0 0 0.368627 0 0 0 0 0.337255 0 0 0 0.21 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_283_630"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_283_630" result="shape"/>
                </filter>
                </defs>
            </svg>
         </button>
      </div>
    </div>
  </div>

  <!-- Loading Skeleton -->
  @if (isLoading()) {
    <div class="px-5 -mt-12 relative z-10 space-y-6">
       <!-- Banner Skeleton -->
       <div class="w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl skeleton-shimmer shadow-sm"></div>
       
       <!-- Categories Skeleton -->
       <div class="grid grid-cols-4 gap-4">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
             <div class="flex flex-col items-center gap-2">
                <div class="w-16 h-16 rounded-2xl skeleton-shimmer"></div>
                <div class="w-12 h-3 rounded skeleton-shimmer"></div>
             </div>
          }
       </div>

       <!-- Section Skeleton -->
       <div class="space-y-4">
          <div class="flex justify-between items-center">
             <div class="w-32 h-5 rounded skeleton-shimmer"></div>
             <div class="w-12 h-4 rounded skeleton-shimmer"></div>
          </div>
          <div class="flex gap-4 overflow-hidden">
             <div class="w-64 h-40 rounded-2xl shrink-0 skeleton-shimmer"></div>
             <div class="w-64 h-40 rounded-2xl shrink-0 skeleton-shimmer"></div>
          </div>
       </div>
    </div>
  }

  <!-- Dynamic Sections -->
  @for (item of sectionsWithData(); track item.section.id; let i = $index; let isLast = $last) {
    @let section = item.section;
    @let data = item.data;

    @switch (section.template) {
      
      <!-- Banners Section -->
      @case ('banners') {
        <div class="relative z-10 px-5" [class.pb-4]="!isLast" [class.-mt-12]="i === 0" [class.mt-4]="i !== 0">
          <app-banner [banners]="data" (bannerClick)="handleBannerClick($event)"></app-banner>
        </div>
      }

      <!-- Categories Section -->
      @case ('categories') {
        <div class="relative z-10 px-5" [class.pb-4]="!isLast" [class.-mt-12]="i === 0" [class.mt-4]="i !== 0">
          @if (section.title) {
             <h2 class="text-[1.1rem] font-bold text-[#1A1C1E] tracking-tight mb-4 flex items-center" [class.text-white]="i === 0" [class.drop-shadow-md]="i === 0">
               {{ section.title }}
               @if (section.subTitle) {
                 <span class="text-[0.8rem] font-medium text-gray-500 ml-1.5" [class.text-blue-100]="i === 0">{{ section.subTitle }}</span>
               }
             </h2>
          }
          @if (data.length === 0) {
            <!-- Skeleton for Categories (if empty data but loaded) -->
            <div class="grid grid-cols-4 gap-x-3 gap-y-4 mb-3">
              @for (skel of [1,2,3,4,5,6,7,8]; track skel) {
                <div class="flex flex-col items-center gap-2">
                   <div class="w-full aspect-square rounded-[1.2rem] skeleton-shimmer"></div>
                   <div class="w-12 h-3 rounded skeleton-shimmer"></div>
                </div>
              }
            </div>
          } @else {
            <!-- Actual Grid -->
            <div class="grid grid-cols-4 gap-x-3 gap-y-4 mb-3">
               @for (category of data; track category.id) {
                  <button 
                    (click)="handleCategoryClick(category)"
                    [disabled]="category.isActive === false"
                    class="flex flex-col items-center gap-2 group focus:outline-none active:scale-95 transition-transform"
                    [class.grayscale]="category.isActive === false"
                    [class.opacity-50]="category.isActive === false">
                     <!-- Icon Box -->
                     <div class="relative w-[65px] h-[65px] bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-[#F1F3F6] flex items-center justify-center group-hover:shadow-md transition-shadow">
                        <!-- Category Icon Image -->
                        <img [src]="category.icon || 'https://i.ibb.co/nNsGtRqn/placeholder-80x80.png'" (error)="handleImgError($event)" [alt]="category.label" class="w-10 h-10 object-contain drop-shadow-sm" [style.object-fit]="category.icon ? 'contain' : 'none'" [class.bg-gray-50]="!category.icon">
                        
                        <!-- Notification Dot -->
                        @if (category.hasNotification) {
                           <div class="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white shadow-sm"></div>
                        }
                     </div>
                     
                     <!-- Label -->
                     <span class="text-[0.75rem] font-medium text-[#4B5563] text-center tracking-normal leading-none" [class.text-white/90]="i === 0 && !section.title">{{ category.label }}</span>
                  </button>
               }
            </div>
          }
        </div>
      }

      <!-- Latest Offers Section -->
      @case ('latest_offers') {
        @if (data.length > 0) {
          <div class="relative z-10 pl-5" [class.pb-4]="!isLast" [class.-mt-12]="i === 0" [class.mt-4]="i !== 0">
              <!-- Header -->
              <div class="flex items-center justify-between pr-5 mb-4">
                <a routerLink="/offers" [queryParams]="{category: section.filterValue === 'Food' ? 'food' : 'business', title: section.title, subtitle: section.subTitle}" class="text-[1.1rem] font-bold text-[#1A1C1E] tracking-tight hover:text-[#083594] transition-colors flex items-center" [class.text-white]="i === 0" [class.drop-shadow-md]="i === 0" [class.hover:text-blue-200]="i === 0">
                  {{ section.title }} 
                  @if (section.subTitle) {
                    <span class="text-[0.8rem] font-medium text-gray-500 ml-1.5" [class.text-blue-100]="i === 0">{{ section.subTitle }}</span>
                  }
                </a>
                <button routerLink="/offers" [queryParams]="{category: section.filterValue === 'Food' ? 'food' : 'business', title: section.title, subtitle: section.subTitle}" class="text-sm font-bold text-gray-400 hover:text-[#083594] transition-colors" [class.text-blue-200]="i === 0" [class.hover:text-white]="i === 0">See all</button>
              </div>

              <!-- Scroll Container -->
              <div 
                #offerContainer
                class="flex overflow-x-auto gap-3 pb-4 pr-5 scrollbar-hide snap-x cursor-grab active:cursor-grabbing select-none"
                (mousedown)="startOfferDrag($event)"
                (mouseleave)="endOfferDrag()"
                (mouseup)="endOfferDrag()"
                (mousemove)="doOfferDrag($event)">
                
                @for (offer of data; track offer.id) {
                    <app-offer-card 
                      [offer]="offer"
                      class="snap-center block min-w-[300px] w-[300px]"
                      (click)="handleOfferClick(offer)">
                    </app-offer-card>
                }
              </div>
          </div>
        }
      }

      <!-- Featured Businesses / Restaurants / Groceries Section -->
      @case ('featured_businesses') {
        @if (data.length > 0) {
          <div class="relative z-10 pl-5" [class.pb-4]="!isLast" [class.-mt-12]="i === 0" [class.mt-4]="i !== 0">
            <!-- Header -->
            <div class="flex items-center justify-between pr-5 mb-4">
              @let targetPath = section.dataSource === 'restaurants' ? '/restaurants' : (section.dataSource === 'groceries' ? '/groceries' : '/businesses');
              <a [routerLink]="targetPath" class="text-[1.1rem] font-bold text-[#1A1C1E] tracking-tight hover:text-[#083594] transition-colors flex items-center" [class.text-white]="i === 0" [class.drop-shadow-md]="i === 0" [class.hover:text-blue-200]="i === 0">
                {{ section.title }}
                @if (section.subTitle) {
                  <span class="text-[0.8rem] font-medium text-gray-500 ml-1.5" [class.text-blue-100]="i === 0">{{ section.subTitle }}</span>
                }
              </a>
              <button [routerLink]="targetPath" class="text-sm font-bold text-gray-400 hover:text-[#083594] transition-colors" [class.text-blue-200]="i === 0" [class.hover:text-white]="i === 0">See all</button>
            </div>

            @if (section.dataSource === 'restaurants') {
              <!-- Scroll Container for Restaurants -->
              <div 
                #restaurantContainer
                class="flex overflow-x-auto gap-3 pb-4 pr-5 scrollbar-hide snap-x cursor-grab active:cursor-grabbing select-none"
                (mousedown)="startRestaurantDrag($event)"
                (mouseleave)="endRestaurantDrag()"
                (mouseup)="endRestaurantDrag()"
                (mousemove)="doRestaurantDrag($event)">
                
                @for (biz of data; track biz.id) {
                    <app-business-card 
                      [business]="biz"
                      class="min-w-[230px] w-[230px] snap-center block"
                      (click)="handleBusinessClick(biz.id, 'restaurant')">
                    </app-business-card>
                }
              </div>
            } @else if (section.dataSource === 'groceries') {
              <!-- Scroll Container for Groceries -->
              <div 
                #groceryContainer
                class="flex overflow-x-auto gap-3 pb-4 pr-5 scrollbar-hide snap-x cursor-grab active:cursor-grabbing select-none"
                (mousedown)="startGroceryDrag($event)"
                (mouseleave)="endGroceryDrag()"
                (mouseup)="endGroceryDrag()"
                (mousemove)="doGroceryDrag($event)">
                
                @for (biz of data; track biz.id) {
                    <app-business-card 
                      [business]="biz"
                      class="min-w-[230px] w-[230px] snap-center block"
                      (click)="handleBusinessClick(biz.id, 'grocery')">
                    </app-business-card>
                }
              </div>
            } @else {
              <!-- Scroll Container for Businesses -->
              <div 
                #businessContainer
                class="flex overflow-x-auto gap-3 pb-4 pr-5 scrollbar-hide snap-x cursor-grab active:cursor-grabbing select-none"
                (mousedown)="startBusinessDrag($event)"
                (mouseleave)="endBusinessDrag()"
                (mouseup)="endBusinessDrag()"
                (mousemove)="doBusinessDrag($event)">
                
                @for (biz of data; track biz.id) {
                    <app-business-card 
                      [business]="biz"
                      class="min-w-[230px] w-[230px] snap-center block"
                      (click)="handleBusinessClick(biz.id, 'business')">
                    </app-business-card>
                }
              </div>
            }
          </div>
        }
      }

      <!-- News Feed Section -->
      @case ('news_feed') {
        <div class="relative z-10 pl-5" [class.pb-4]="!isLast" [class.-mt-12]="i === 0" [class.mt-4]="i !== 0">
          <!-- Header -->
          <div class="flex items-center justify-between pr-5 mb-4">
            <a routerLink="/news" class="text-[1.1rem] font-bold text-[#1A1C1E] tracking-tight hover:text-[#083594] transition-colors flex items-center" [class.text-white]="i === 0" [class.drop-shadow-md]="i === 0" [class.hover:text-blue-200]="i === 0">
              {{ section.title }}
              @if (section.subTitle) {
                <span class="text-[0.8rem] font-medium text-gray-500 ml-1.5" [class.text-blue-100]="i === 0">{{ section.subTitle }}</span>
              }
            </a>
            <button routerLink="/news" class="text-sm font-bold text-gray-400 hover:text-[#083594] transition-colors" [class.text-blue-200]="i === 0" [class.hover:text-white]="i === 0">See all</button>
          </div>

          <!-- Horizontal Scroll Container with Drag Logic -->
          <div 
            #newsContainer
            class="flex overflow-x-auto gap-4 pb-4 pr-5 scrollbar-hide snap-x cursor-grab active:cursor-grabbing select-none"
            (mousedown)="startDrag($event)"
            (mouseleave)="endDrag()"
            (mouseup)="endDrag()"
            (mousemove)="doDrag($event)">
            
            @if (data.length === 0) {
              <!-- Skeleton Cards -->
              @for (skel of [1,2,3]; track skel) {
                 <div class="min-w-[85%] md:min-w-[400px] bg-white p-3 rounded-[1.25rem] shadow-sm border border-gray-100 h-28 skeleton-shimmer"></div>
              }
            } @else {
              @for (item of data; track item.id) {
                <!-- Card Component -->
                <app-news-card 
                  [newsItem]="item"
                  (click)="handleNewsClick(item.id)"
                  class="min-w-[85%] md:min-w-[400px] snap-center block">
                </app-news-card>
              }
            }
          </div>
        </div>
      }

    }
  }
  
  <!-- Spacer to clear Tab Bar comfortably -->
  <div class="h-28 w-full"></div>

</ion-content>

<!-- Country Selection Modal (Bottom Sheet Style) -->
<ion-modal 
  [isOpen]="isCountryModalOpen()" 
  (didDismiss)="closeCountrySelector()" 
  [initialBreakpoint]="0.5" 
  [breakpoints]="[0, 0.5, 0.75]"
  class="--border-radius: 16px;">
  <ng-template>
    <ion-header class="ion-no-border">
      <ion-toolbar class="bg-white">
        <ion-title class="font-bold text-gray-900">Select Location</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeCountrySelector()" color="medium">
            <ion-icon slot="icon-only" name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="bg-white">
      <ion-list lines="none" class="p-2">
        @for (country of countries(); track country.id) {
          <ion-item 
            button 
            (click)="selectCountry(country)"
            class="rounded-xl mb-2"
            [class.bg-blue-50]="country.id === selectedCountryId()"
            detail="false">
            
            <div slot="start" class="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm mr-3">
               <img [src]="country.flagUrl || 'https://i.ibb.co/nNsGtRqn/placeholder-80x80.png'" (error)="handleImgError($event)" class="w-full h-full object-fill" [style.object-fit]="country.flagUrl ? 'fill' : 'none'" [class.bg-gray-200]="!country.flagUrl" [alt]="country.name">
            </div>
            
            <ion-label>
              <h3 class="font-bold text-gray-800">{{ country.name }}</h3>
              <p class="text-xs text-gray-500">{{ country.cities.length }} Cities Available</p>
            </ion-label>
            
            @if (country.id === selectedCountryId()) {
              <ion-icon slot="end" name="checkmark-circle" class="text-[#083594] text-xl"></ion-icon>
            }
          </ion-item>
        }
      </ion-list>
    </ion-content>
  </ng-template>
</ion-modal>
`,
  styles: [`
/* Waving Hand Animation */
@keyframes wave {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.animate-wave {
  display: inline-block;
  animation-name: wave;
  animation-duration: 2.5s;
  animation-iteration-count: infinite;
  transform-origin: 70% 70%;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

/* Hide main content scrollbar for a cleaner app-like feel */
ion-content::part(scroll)::-webkit-scrollbar {
  display: none;
}

ion-content::part(scroll) {
  -ms-overflow-style: none;
  scrollbar-width: none;
  padding-bottom: inherit;
}

/* Safe Area Handling */
.home-header {
  padding-top: calc(5.5rem + env(safe-area-inset-top));
}

/* Adjust safe-area-inset-top on Android */
:host-context(.plt-android) .home-header {
  padding-top: calc(2.5rem + env(safe-area-inset-top));
}

.inner-scroll {
  padding-bottom: inherit;
}

/* Skeleton Shimmer Animation */
.skeleton-shimmer {
  background: #E5E7EB;
  background: linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite ease-in-out;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
`],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, RouterLink, BannerComponent, BusinessCardComponent, NewsCardComponent, OfferCardComponent],
})
export class HomeComponent implements OnInit {
  settings: Signal<AppConfig | null>;
  banners: Signal<Banner[]>;
  categories: Signal<Category[]>;
  countries: Signal<Country[]>;
  news: Signal<NewsArticle[]>;
  offers: Signal<Offer[]>;
  
  private allBusinesses: Signal<Business[]>;
  private allRestaurants: Signal<Business[]>;
  private allGroceries: Signal<Grocery[]>;

  sectionsWithData: Signal<{ section: HomeSection, data: any[] }[]>;
  user: Signal<any>;
  
  // Specific Offer Signals (preserved for reusing logic)
  foodOffers: Signal<Offer[]>;
  businessOffers: Signal<Offer[]>;
  
  featuredRestaurants: Signal<Business[]>;
  generalBusinesses: Signal<Business[]>;
  featuredGroceries: Signal<Grocery[]>;
  currentCountry: Signal<Country | null>;

  selectedCountryId: Signal<string>;
  isCountryModalOpen = signal(false);
  
  // Loading State
  isLoading = signal(true);

  newsContainer = viewChild<ElementRef>('newsContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  public isDragging = false;

  offerContainer = viewChild<ElementRef>('offerContainer');
  private isOfferDown = false;
  private startOfferX = 0;
  private scrollOfferLeft = 0;
  public isOfferDragging = false;

  businessOfferContainer = viewChild<ElementRef>('businessOfferContainer');
  private isBizOfferDown = false;
  private startBizOfferX = 0;
  private scrollBizOfferLeft = 0;
  public isBizOfferDragging = false;

  restaurantContainer = viewChild<ElementRef>('restaurantContainer');
  private isRestaurantDown = false;
  private startRestaurantX = 0;
  private scrollRestaurantLeft = 0;
  public isRestaurantDragging = false;

  businessContainer = viewChild<ElementRef>('businessContainer');
  private isBusinessDown = false;
  private startBusinessX = 0;
  private scrollBusinessLeft = 0;
  public isBusinessDragging = false;

  groceryContainer = viewChild<ElementRef>('groceryContainer');
  private isGroceryDown = false;
  private startGroceryX = 0;
  private scrollGroceryLeft = 0;
  public isGroceryDragging = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private pushService: PushNotificationService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.settings = this.dataService.getAppSettings();
    this.banners = this.dataService.getBanners();
    this.categories = this.dataService.getCategories();
    this.countries = this.dataService.getCountries();
    this.news = this.dataService.getNews();
    this.offers = this.dataService.getOffers();
    this.allBusinesses = this.dataService.getBusinesses();
    this.allRestaurants = this.dataService.getRestaurants();
    this.allGroceries = this.dataService.getGroceries();
    this.selectedCountryId = this.dataService.selectedCountryId;

    this.user = computed(() => {
        const profile = this.authService.userProfile();
        const currentUser = this.authService.currentUser();
        const fullName = profile?.name || currentUser?.displayName || 'Guest';
        
        const parts = fullName.trim().split(/\s+/);
        let displayName = parts[0];
        
        if (displayName.length < 3 && parts.length > 1) {
            displayName = parts[parts.length - 1];
        }

        return {
          name: displayName,
          greeting: 'Hello',
          subtitle: 'Proud to be a member of this CeyHallo.',
          avatar: profile?.photoURL || currentUser?.photoURL || `https://i.pravatar.cc/150?u=${profile?.email || 'guest'}`,
          isVerified: profile?.isVerified ?? currentUser?.emailVerified ?? false,
          isLoggedIn: !!currentUser
        };
    });

    // Helper to filter offers by city match
    const filterOffersByCity = (offer: Offer, type: 'food' | 'business') => {
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        
        // Relaxed constraint: If no country data, allow all matching types
        if (!country || !country.cities || country.cities.length === 0) {
             if (type === 'food') return offer.linkType === 'restaurants' || offer.linkType === 'restaurant';
             return offer.linkType === 'businesses' || offer.linkType === 'business';
        }

        // Check type first
        if (type === 'food') {
            if (offer.linkType !== 'restaurants' && offer.linkType !== 'restaurant') return false;
        } else {
            if (offer.linkType !== 'businesses' && offer.linkType !== 'business') return false;
        }

        const bizId = offer.businessId || offer.targetId;
        if (!bizId) return false; 

        // Find linked business entity
        const restaurants = this.allRestaurants();
        const businesses = this.allBusinesses();
        const relatedEntity = restaurants.find(r => r.id === bizId) || businesses.find(b => b.id === bizId);
        
        if (relatedEntity && relatedEntity.location) {
            const validCities = country.cities.map(c => c.name.toLowerCase());
            const loc = relatedEntity.location.toLowerCase();
            return validCities.some(city => loc.includes(city));
        }
        
        return false;
    };

    this.foodOffers = computed(() => {
        const rawOffers = this.offers().filter(o => o.isHomeBanner);
        return rawOffers.filter(offer => filterOffersByCity(offer, 'food'));
    });

    this.businessOffers = computed(() => {
        const rawOffers = this.offers().filter(o => o.isHomeBanner);
        return rawOffers.filter(offer => filterOffersByCity(offer, 'business'));
    });

    this.featuredRestaurants = computed(() => {
        const list = this.allRestaurants().filter(r => r.isPromoted);
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        
        // Relaxed constraint: If no country/cities found, return all promoted (Fallback)
        if (!country || !country.cities || country.cities.length === 0) return list;

        const validCities = country.cities.map(c => c.name.toLowerCase());
        
        return list.filter(r => {
            const loc = (r.location || '').toLowerCase();
            return validCities.some(city => loc.includes(city));
        });
    });

    this.generalBusinesses = computed(() => {
        const list = this.allBusinesses().filter(b => b.isPromoted);
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        
        // Relaxed constraint: If no country/cities found, return all promoted (Fallback)
        if (!country || !country.cities || country.cities.length === 0) return list;

        const validCities = country.cities.map(c => c.name.toLowerCase());
        
        return list.filter(b => {
            const loc = (b.location || '').toLowerCase();
            return validCities.some(city => loc.includes(city));
        });
    });

    this.featuredGroceries = computed(() => {
        const list = this.allGroceries().filter(g => g.isPromoted);
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        
        if (!country || !country.cities || country.cities.length === 0) return list;

        const validCities = country.cities.map(c => c.name.toLowerCase());
        
        return list.filter(g => {
            const loc = (g.location || '').toLowerCase();
            return validCities.some(city => loc.includes(city));
        });
    });

    this.currentCountry = computed(() => {
        const list = this.countries();
        const selected = list.find(c => c.id === this.selectedCountryId());
        if (selected) return selected;
        return list.length > 0 ? list[0] : null; 
    });

    // Compute sections with data for dynamic rendering
    this.sectionsWithData = computed(() => {
        const settings = this.settings();
        const sections = settings?.homeSections || [];
        
        const enabled = sections.filter(s => s.enabled).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

        return enabled.map(section => {
            let data: any[] = [];
            switch(section.dataSource) {
                case 'banners': 
                    data = this.banners(); 
                    break;
                case 'categories': 
                    data = this.categories(); 
                    break;
                case 'news': 
                    data = this.news();
                    break;
                case 'offers':
                    // Reuse existing logic for food vs business offers
                    if (section.filterValue === 'Food') {
                        data = this.foodOffers();
                    } else {
                        data = this.businessOffers();
                    }
                    break;
                case 'restaurants': 
                    data = this.featuredRestaurants(); 
                    break;
                case 'groceries':
                    data = this.featuredGroceries();
                    break;
                case 'businesses': 
                    data = this.generalBusinesses(); 
                    break;
            }

            // Apply limit from settings if specified
            const limit = Number(section.limit);
            if (!isNaN(limit) && limit > 0) {
                data = data.slice(0, limit);
            }

            return { section, data };
        });
    });

    // Effect to handle loading state change based on data availability
    effect(() => {
        // As soon as settings are loaded (indicating core data fetch initiated/completed), 
        // we can reveal the UI. Inner components have their own empty states/skeletons if needed.
        if (this.settings()) {
            this.isLoading.set(false);
        }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.pushService.initPush();
  }

  handleImgError = handleImageError;

  async goToProfile() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/tabs/profile']);
    } else {
      const modal = await this.modalCtrl.create({
        component: LoginComponent,
        componentProps: {
          isModal: true,
          message: 'Please log in to view your profile.'
        }
      });
      await modal.present();
    }
  }

  async resendVerification() {
    const result = await this.authService.resendVerificationEmail();
    let toastMessage = 'Verification email sent. Please check your inbox.';
    let toastColor: 'success' | 'danger' = 'success';
    
    if (!result.success) {
      toastMessage = result.error || 'Failed to send verification email.';
      toastColor = 'danger';
    }
    
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 3000,
      color: toastColor,
      position: 'top',
      icon: toastColor === 'success' ? 'checkmark-circle' : 'alert-circle',
      cssClass: 'toast-custom-text'
    });
    await toast.present();
  }

  private async requireLogin(): Promise<boolean> {
    if (this.authService.isLoggedIn()) return true;

    const modal = await this.modalCtrl.create({
      component: LoginComponent,
      componentProps: { 
        isModal: true
      }
    });
    await modal.present();
    return false;
  }

  openCountrySelector() {
    this.isCountryModalOpen.set(true);
  }

  closeCountrySelector() {
    this.isCountryModalOpen.set(false);
  }

  selectCountry(country: Country) {
    this.dataService.setSelectedCountry(country.id);
    this.closeCountrySelector();
  }

  async handleCategoryClick(category: Category) {
    let path = category.path;

    // Fallback: Map known labels to paths if path is missing or invalid in DB
    if (!path) {
        const label = (category.label || '').toLowerCase();
        if (label.includes('organization') || label.includes('association')) path = '/organizations';
        else if (label.includes('business')) path = '/businesses';
        else if (label.includes('restaurant')) path = '/restaurants';
        else if (label.includes('grocery') || label.includes('supermarket')) path = '/groceries';
        else if (label.includes('news')) path = '/news';
        else if (label.includes('job')) path = '/jobs';
        else if (label.includes('event')) path = '/events';
        else if (label.includes('offer')) path = '/offers';
        else if (label.includes('support')) path = '/support';
    }

    // Known valid paths
    const validPaths = [
        '/news', '/restaurants', '/groceries', '/businesses', '/organizations', '/organization', 
        '/events', '/jobs', '/offers', '/support', '/navigate'
    ];
    
    // Check if resolved path is valid
    const isValidPath = path && validPaths.some(p => path!.toLowerCase().startsWith(p));

    if (isValidPath) {
      this.router.navigateByUrl(path!);
    } else {
      const toast = await this.toastCtrl.create({
        message: `${category.label} will be available soon.`,
        duration: 2500,
        color: 'dark',
        position: 'middle', // Middle ensures visibility
        icon: 'information-circle',
        cssClass: 'toast-custom-text'
      });
      await toast.present();
    }
  }

  startDrag(e: MouseEvent) {
    this.isDown = true;
    this.isDragging = false;
    const slider = this.newsContainer()?.nativeElement;
    if (slider) {
      this.startX = e.pageX - slider.offsetLeft;
      this.scrollLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endDrag() {
    if (!this.isDown) return;
    this.isDown = false;
    const slider = this.newsContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doDrag(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const slider = this.newsContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startX) * 2;
      slider.scrollLeft = this.scrollLeft - walk;
      
      if (Math.abs(walk) > 5) {
        this.isDragging = true;
      }
    }
  }

  startOfferDrag(e: MouseEvent) {
    this.isOfferDown = true;
    this.isOfferDragging = false;
    const slider = this.offerContainer()?.nativeElement;
    if (slider) {
      this.startOfferX = e.pageX - slider.offsetLeft;
      this.scrollOfferLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endOfferDrag() {
    if (!this.isOfferDown) return;
    this.isOfferDown = false;
    const slider = this.offerContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doOfferDrag(e: MouseEvent) {
    if (!this.isOfferDown) return;
    e.preventDefault();
    const slider = this.offerContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startOfferX) * 2;
      slider.scrollLeft = this.scrollOfferLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isOfferDragging = true;
      }
    }
  }

  startBizOfferDrag(e: MouseEvent) {
    this.isBizOfferDown = true;
    this.isBizOfferDragging = false;
    const slider = this.businessOfferContainer()?.nativeElement;
    if (slider) {
      this.startBizOfferX = e.pageX - slider.offsetLeft;
      this.scrollBizOfferLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endBizOfferDrag() {
    if (!this.isBizOfferDown) return;
    this.isBizOfferDown = false;
    const slider = this.businessOfferContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doBizOfferDrag(e: MouseEvent) {
    if (!this.isBizOfferDown) return;
    e.preventDefault();
    const slider = this.businessOfferContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startBizOfferX) * 2;
      slider.scrollLeft = this.scrollBizOfferLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isBizOfferDragging = true;
      }
    }
  }

  startRestaurantDrag(e: MouseEvent) {
    this.isRestaurantDown = true;
    this.isRestaurantDragging = false;
    const slider = this.restaurantContainer()?.nativeElement;
    if (slider) {
      this.startRestaurantX = e.pageX - slider.offsetLeft;
      this.scrollRestaurantLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endRestaurantDrag() {
    if (!this.isRestaurantDown) return;
    this.isRestaurantDown = false;
    const slider = this.restaurantContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doRestaurantDrag(e: MouseEvent) {
    if (!this.isRestaurantDown) return;
    e.preventDefault();
    const slider = this.restaurantContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startRestaurantX) * 2;
      slider.scrollLeft = this.scrollRestaurantLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isRestaurantDragging = true;
      }
    }
  }

  startBusinessDrag(e: MouseEvent) {
    this.isBusinessDown = true;
    this.isBusinessDragging = false;
    const slider = this.businessContainer()?.nativeElement;
    if (slider) {
      this.startBusinessX = e.pageX - slider.offsetLeft;
      this.scrollBusinessLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endBusinessDrag() {
    if (!this.isBusinessDown) return;
    this.isBusinessDown = false;
    const slider = this.businessContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doBusinessDrag(e: MouseEvent) {
    if (!this.isBusinessDown) return;
    e.preventDefault();
    const slider = this.businessContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startBusinessX) * 2;
      slider.scrollLeft = this.scrollBusinessLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isBusinessDragging = true;
      }
    }
  }

  startGroceryDrag(e: MouseEvent) {
    this.isGroceryDown = true;
    this.isGroceryDragging = false;
    const slider = this.groceryContainer()?.nativeElement;
    if (slider) {
      this.startGroceryX = e.pageX - slider.offsetLeft;
      this.scrollGroceryLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endGroceryDrag() {
    if (!this.isGroceryDown) return;
    this.isGroceryDown = false;
    const slider = this.groceryContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }

  doGroceryDrag(e: MouseEvent) {
    if (!this.isGroceryDown) return;
    e.preventDefault();
    const slider = this.groceryContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startGroceryX) * 2;
      slider.scrollLeft = this.scrollGroceryLeft - walk;
      if (Math.abs(walk) > 5) {
        this.isGroceryDragging = true;
      }
    }
  }

  async handleNewsClick(articleId: string) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    
    if (!(await this.requireLogin())) return;

    await this.openNewsArticle(articleId);
  }

  async openNewsArticle(articleId: string) {
    const modal = await this.modalCtrl.create({
      component: NewsDetailComponent,
      componentProps: {
        articleId: articleId,
      },
    });
    await modal.present();
  }

  async handleBannerClick(banner: Banner) {
    if (!(await this.requireLogin())) return;

    const navType = banner.navigationType || 'none';
    
    const bannerArticle: NewsArticle = {
      id: banner.id,
      title: banner.title,
      source: 'Featured',
      date: new Date(),
      imageUrl: banner.image,
      description: banner.description || '',
      content: `<p class="text-lg font-medium">${banner.description || ''}</p>`,
      category: banner.category
    };

    let actionType: 'share' | 'external' | 'internal' | 'close' = 'close';
    let actionLabel = 'Back to Home';
    let actionIcon = 'arrow-back';
    let targetUrl = '';
    let targetType = banner.targetType;

    switch (navType) {
        case 'external':
            if (banner.targetId) {
                actionType = 'external';
                actionLabel = 'Visit Website';
                actionIcon = 'globe-outline';
                targetUrl = banner.targetId;
            }
            break;
        case 'internal':
            if (banner.targetId) {
                actionType = 'internal';
                actionLabel = 'View in Page';
                actionIcon = 'open-outline';
                targetUrl = banner.targetId;
            }
            break;
        case 'share':
            actionType = 'share';
            actionLabel = 'Share Article';
            actionIcon = 'share-social';
            break;
    }

    const modal = await this.modalCtrl.create({
      component: NewsDetailComponent,
      componentProps: {
        articleData: bannerArticle,
        actionType: actionType,
        actionLabel: actionLabel,
        actionIcon: actionIcon,
        targetUrl: targetUrl,
        targetType: targetType
      }
    });
    await modal.present();
  }
  
  async handleBusinessClick(businessId: string, context: 'restaurant' | 'business' | 'grocery' = 'business') {
    let dragging = false;
    if (context === 'restaurant') dragging = this.isRestaurantDragging;
    else if (context === 'grocery') dragging = this.isGroceryDragging;
    else dragging = this.isBusinessDragging;
    
    if (dragging) {
      if (context === 'restaurant') this.isRestaurantDragging = false;
      else if (context === 'grocery') this.isGroceryDragging = false;
      else this.isBusinessDragging = false;
      return;
    }
    
    if (!(await this.requireLogin())) return;

    await this.openBusinessDetail(businessId);
  }

  async handleOfferClick(offer: Offer, isBusinessSection = false) {
    const isDragging = isBusinessSection ? this.isBizOfferDragging : this.isOfferDragging;

    if (isDragging) {
        if (isBusinessSection) this.isBizOfferDragging = false;
        else this.isOfferDragging = false;
        return;
    }
    
    if (!(await this.requireLogin())) return;

    const offerArticle: NewsArticle = {
      id: offer.id,
      title: offer.title,
      source: offer.targetName,
      date: offer.expiryDate,
      imageUrl: offer.image,
      description: offer.discount,
      content: `
        <div class="space-y-4">
           <p class="text-base text-gray-600 leading-relaxed">${offer.description || 'No additional details available.'}</p>
           
           <div class="flex items-center gap-2 mt-4 text-sm font-medium text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Expires: ${offer.expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
           </div>
        </div>
      `,
      category: 'Special Offer'
    };

    let actionType: 'share' | 'external' | 'internal' | 'close' = 'close';
    let actionLabel = 'Back to Home';
    let actionIcon = 'arrow-back';
    let targetUrl = '';
    let targetType: 'news' | 'business' | 'restaurant' | 'event' | 'job' | undefined = undefined;

    const targetId = offer.targetId || offer.businessId;
    if (targetId) {
        actionType = 'internal';
        actionLabel = 'View in Page';
        actionIcon = 'open-outline';
        
        let type = (offer.linkType || 'business').toLowerCase();
        if (type === 'restaurants') type = 'restaurant';
        if (type === 'businesses') type = 'business';

        switch (type) {
            case 'event':
                targetType = 'event';
                targetUrl = `/event/${targetId}`;
                break;
            case 'job':
                targetType = 'job';
                targetUrl = `/job/${targetId}`;
                break;
            case 'news':
                targetType = 'news';
                targetUrl = `/news/${targetId}`;
                break;
            case 'restaurant':
            case 'business':
            default:
                targetType = 'business';
                targetUrl = `/business/${targetId}`;
                break;
        }
    }

    const modal = await this.modalCtrl.create({
      component: NewsDetailComponent,
      componentProps: {
        articleData: offerArticle,
        actionType: actionType,
        actionLabel: actionLabel,
        actionIcon: actionIcon,
        targetUrl: targetUrl,
        targetType: targetType
      }
    });
    await modal.present();
  }

  async openBusinessDetail(businessId: string) {
    const modal = await this.modalCtrl.create({
      component: BusinessDetailComponent,
      componentProps: {
        businessId: businessId,
      },
    });
    await modal.present();
  }

  async openEventDetail(eventId: string) {
    const modal = await this.modalCtrl.create({
      component: EventDetailComponent,
      componentProps: { eventId }
    });
    await modal.present();
  }

  async openJobDetail(jobId: string) {
    const modal = await this.modalCtrl.create({
      component: JobDetailComponent,
      componentProps: { jobId }
    });
    await modal.present();
  }
}
