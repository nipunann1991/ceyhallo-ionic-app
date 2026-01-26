import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Job } from '../../models/job.model';
import { JobDetailComponent } from '../job-detail/job-detail.component';
import { JobCardComponent } from '../../components/job-card/job-card.component';
import { FeaturedBannerComponent } from '../../components/featured-banner/featured-banner.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { handleImageError } from '../../utils/image.utils';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, JobCardComponent, FeaturedBannerComponent, PageHeaderComponent],
})
export class JobsComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private modalCtrl: ModalController = inject(ModalController);
  private navCtrl: NavController = inject(NavController);

  public isModal = false;
  readonly isModalSignal = signal(false);

  allJobs = this.dataService.getJobs();
  countries = this.dataService.getCountries();
  selectedCountryId = this.dataService.selectedCountryId;

  selectedCategory = signal('All');
  searchTerm = signal('');
  limit = signal(10);

  categories = computed(() => {
    const cid = this.selectedCountryId();
    const country = this.countries().find(c => c.id === cid);
    const cities = country ? country.cities.map(c => c.name) : [];
    return ['All', ...cities];
  });

  categoryContainer = viewChild<ElementRef>('categoryContainer');
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  countryJobs = computed(() => {
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

  featuredJob = computed<Job | null>(() => {
    const list = this.countryJobs();
    if (list.length === 0) return null;
    const featured = list.find(e => e.isFeatured);
    if (featured) return featured;
    return list[0]; // Fallback to most recent
  });

  filteredJobs = computed(() => {
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

  displayedJobs = computed(() => {
    return this.filteredJobs().slice(0, this.limit());
  });

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
        jobId: job.id,
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