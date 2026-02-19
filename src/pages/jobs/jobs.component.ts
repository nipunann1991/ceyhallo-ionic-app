
import { Component, ChangeDetectionStrategy, OnInit, signal, computed, viewChild, ElementRef, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Job } from '../../models/job.model';
import { JobDetailComponent } from '../job-detail/job-detail.component';
import { JobCardComponent } from '../../components/job-card/job-card.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { Banner } from '../../models/banner.model';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { handleImageError } from '../../utils/image.utils';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';
import { Country } from '../../models/country.model';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, JobCardComponent, BannerComponent, PageHeaderComponent],
})
export class JobsComponent implements OnInit {
  public isModal = false;
  readonly isModalSignal = signal(false);

  allJobs: Signal<Job[]>;
  countries: Signal<Country[]>;
  selectedCountryId: Signal<string>;

  selectedCategory = signal('All');
  searchTerm = signal('');
  limit = signal(10);

  // Generic Office Images for Banners since Jobs lack large hero images
  private readonly OFFICE_IMAGES = [
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000',
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2000',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000'
  ];

  categories: Signal<string[]>;
  countryJobs: Signal<Job[]>;
  featuredBanners: Signal<Banner[]>;
  filteredJobs: Signal<Job[]>;
  displayedJobs: Signal<Job[]>;

  categoryContainer = viewChild<ElementRef>('categoryContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {
    this.allJobs = this.dataService.getJobs();
    this.countries = this.dataService.getCountries();
    this.selectedCountryId = this.dataService.selectedCountryId;

    this.categories = computed(() => {
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        const cities = country ? country.cities.map(c => c.name) : [];
        return ['All', ...cities];
    });

    this.countryJobs = computed(() => {
        const list = this.allJobs();
        const cid = this.selectedCountryId();
        const country = this.countries().find(c => c.id === cid);
        if (!country) return [];
        const cityNames = country.cities.map(c => c.name.toLowerCase());
        return list.filter(e => {
           const loc = (e.location || '').toLowerCase();
           return cityNames.some(city => loc.includes(city));
        });
    });

    this.featuredBanners = computed(() => {
        const list = this.countryJobs();
        // Filter for featured jobs, fallback to top 3 recent if none
        let featured = list.filter(j => j.isFeatured);
        
        if (featured.length === 0 && list.length > 0) {
          featured = list.slice(0, 3);
        }
    
        return featured.map((job, index) => ({
          id: job.id,
          category: job.company || 'Featured Job',
          title: job.title,
          description: job.location,
          // Assign a random high-quality office image based on index to be deterministic
          image: this.OFFICE_IMAGES[index % this.OFFICE_IMAGES.length],
          targetId: job.id,
          targetType: 'job',
          navigationType: 'internal'
        }));
    });

    this.filteredJobs = computed(() => {
        let list = [...this.countryJobs()];
        const cat = this.selectedCategory();
        const term = this.searchTerm().toLowerCase();
    
        if (cat !== 'All') {
          list = list.filter(j => (j.location || '').toLowerCase().includes(cat.toLowerCase()));
        }
    
        if (term) {
          list = list.filter(j => 
            j.title.toLowerCase().includes(term) || 
            j.company.toLowerCase().includes(term) || 
            j.skills.some(s => s.toLowerCase().includes(term))
          );
        }
    
        list.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return b.postedDate.getTime() - a.postedDate.getTime();
        });
    
        return list;
    });

    this.displayedJobs = computed(() => {
        return this.filteredJobs().slice(0, this.limit());
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

  async openJob(job: Job) {
    await this.openJobDetail(job.id);
  }

  // Handle click from Banner Component
  async handleBannerClick(banner: Banner) {
    if (banner.targetId) {
       await this.openJobDetail(banner.targetId);
    }
  }

  async openJobDetail(id: string) {
    if (!this.authService.isLoggedIn()) {
      const modal = await this.modalCtrl.create({
        component: LoginComponent,
        componentProps: { isModal: true }
      });
      await modal.present();
      return;
    }

    const modal = await this.modalCtrl.create({
      component: JobDetailComponent,
      componentProps: {
        jobId: id,
      },
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
    }
  }

  endDrag() {
    this.isDown = false;
  }

  doDrag(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const slider = this.categoryContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startX) * 2;
      slider.scrollLeft = this.scrollLeft - walk;
      
      if (Math.abs(walk) > 5) {
        this.isDragging = true;
      }
    }
  }
}
