
import { Component, ChangeDetectionStrategy, OnInit, signal, computed, viewChild, ElementRef, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Grocery } from '../../models/grocery.model';
import { Offer } from '../../models/offer.model';
import { BusinessDetailComponent } from '../business-detail/business-detail.component';
import { BusinessCardComponent } from '../../components/business-card/business-card.component';
import { OfferCardComponent } from '../../components/offer-card/offer-card.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { handleImageError } from '../../utils/image.utils';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';
import { Country } from '../../models/country.model';

@Component({
  selector: 'app-groceries',
  templateUrl: './groceries.component.html',
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, BusinessCardComponent, OfferCardComponent, PageHeaderComponent],
})
export class GroceriesComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);

  public isModal = false;
  readonly isModalSignal = signal(false);

  allGroceries: Signal<Grocery[]>;
  offers: Signal<Offer[]>;
  countries: Signal<Country[]>;
  selectedCountryId: Signal<string>;

  selectedCategory = signal('All');
  searchTerm = signal('');
  limit = signal(10);

  categories: Signal<string[]>;
  countryGroceries: Signal<Grocery[]>;
  sectionOffers: Signal<Offer[]>;
  filteredGroceries: Signal<Grocery[]>;
  displayedGroceries: Signal<Grocery[]>;

  categoryContainer = viewChild<ElementRef>('categoryContainer');
  sectionOfferContainer = viewChild<ElementRef>('sectionOfferContainer');
  
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  private isSectionDown = false;
  private startSectionX = 0;
  private scrollSectionLeft = 0;
  public isSectionDragging = false;

  constructor() {
    this.allGroceries = this.dataService.getGroceries();
    this.offers = this.dataService.getOffers();
    this.countries = this.dataService.getCountries();
    this.selectedCountryId = this.dataService.selectedCountryId;

    this.categories = computed(() => {
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        const cities = country ? country.cities.map(c => c.name) : [];
        return ['All', ...cities];
    });

    this.countryGroceries = computed(() => {
        const list = this.allGroceries();
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        
        if (!country) return [];
    
        const cityNames = country.cities.map(c => (c.name || '').toLowerCase());
        
        return list.filter(g => {
           const loc = (g.location || '').toLowerCase();
           return cityNames.some(city => loc.includes(city));
        });
    });

    this.sectionOffers = computed(() => {
        return this.offers().filter(o => o.isSectionBanner && (o.linkType === 'groceries' || o.linkType === 'grocery'));
    });

    this.filteredGroceries = computed(() => {
        let list = [...this.countryGroceries()];
        const cat = this.selectedCategory();
        const term = (this.searchTerm() || '').toLowerCase();
        
        if (cat !== 'All') {
          list = list.filter(g => (g.location || '').toLowerCase().includes(cat.toLowerCase()));
        }
    
        if (term) {
          list = list.filter(g => (g.name || '').toLowerCase().includes(term) || (g.category || '').toLowerCase().includes(term));
        }
    
        list.sort((a, b) => {
            if (a.isPromoted && !b.isPromoted) return -1;
            if (!a.isPromoted && b.isPromoted) return 1;
            return b.rating - a.rating;
        });
    
        return list;
    });

    this.displayedGroceries = computed(() => {
        return this.filteredGroceries().slice(0, this.limit());
    });
  }

  ngOnInit() {
    this.isModalSignal.set(this.isModal);
  }

  setCategory(cat: string) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    this.selectedCategory.set(cat);
    this.limit.set(10);
  }

  handleSearch(value: string) {
    this.searchTerm.set(value);
    this.limit.set(10);
  }

  handleImgError = handleImageError;

  goBack() {
    if (this.isModalSignal()) {
      this.modalCtrl.dismiss();
    } else {
      this.navCtrl.back();
    }
  }

  async openGrocery(grocery: Grocery) {
    if (!this.authService.isLoggedIn()) {
      const modal = await this.modalCtrl.create({
        component: LoginComponent,
        componentProps: { isModal: true }
      });
      await modal.present();
      return;
    }

    const modal = await this.modalCtrl.create({
      component: BusinessDetailComponent,
      componentProps: {
        businessId: grocery.id,
      },
    });
    await modal.present();
  }

  async handleOfferClick(offer: Offer, isSection: boolean = false) {
    const isDragging = isSection ? this.isSectionDragging : false;
    
    if (isDragging) {
        if (isSection) this.isSectionDragging = false;
        return;
    }
    
    if (!this.authService.isLoggedIn()) {
        const modal = await this.modalCtrl.create({
          component: LoginComponent,
          componentProps: { isModal: true }
        });
        await modal.present();
        return;
    }

    // Reuse NewsDetailComponent for offer details
    const modal = await this.modalCtrl.create({
      component: BusinessDetailComponent,
      componentProps: {
        businessId: offer.businessId || offer.targetId,
      }
    });
    await modal.present();
  }

  onIonInfinite(ev: any) {
    const infiniteScroll = ev as InfiniteScrollCustomEvent;
    setTimeout(() => {
      this.limit.update(currentLimit => currentLimit + 10);
      infiniteScroll.target.complete();
    }, 500);
  }

  startDrag(e: MouseEvent) {
    this.isDown = true;
    this.isDragging = false;
    const slider = this.categoryContainer()?.nativeElement;
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
    const slider = this.categoryContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }
  doDrag(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const slider = this.categoryContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startX) * 2;
      slider.scrollLeft = this.scrollLeft - walk;
      if (Math.abs(walk) > 5) this.isDragging = true;
    }
  }

  startSectionDrag(e: MouseEvent) {
    if (this.sectionOffers().length <= 1) return;
    this.isSectionDown = true;
    this.isSectionDragging = false;
    const slider = this.sectionOfferContainer()?.nativeElement;
    if (slider) {
      this.startSectionX = e.pageX - slider.offsetLeft;
      this.scrollSectionLeft = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }
  endSectionDrag() { 
    if (!this.isSectionDown) return;
    this.isSectionDown = false;
    const slider = this.sectionOfferContainer()?.nativeElement;
    if (slider) {
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
    }
  }
  doSectionDrag(e: MouseEvent) {
    if (!this.isSectionDown) return;
    e.preventDefault();
    const slider = this.sectionOfferContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startSectionX) * 2;
      slider.scrollLeft = this.scrollSectionLeft - walk;
      if (Math.abs(walk) > 5) this.isSectionDragging = true;
    }
  }
}
