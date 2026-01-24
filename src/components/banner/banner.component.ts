import { Component, ChangeDetectionStrategy, input, signal, effect, output, viewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Banner } from '../../models/banner.model';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class BannerComponent implements OnDestroy {
  banners = input.required<Banner[]>();
  bannerClick = output<Banner>();
  
  scrollContainer = viewChild<ElementRef>('scrollContainer');
  
  activeBannerIndex = signal(0);
  private autoSlideInterval: any;
  private isInteracting = false;

  // Drag State
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;

  constructor() {
    effect(() => {
       // Restart auto-slide when banners change
       const _ = this.banners();
       this.startAutoSlide();
    });
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.stopAutoSlide();
    
    // Only auto-slide if multiple banners exist
    if (this.banners().length <= 1) return;

    this.autoSlideInterval = setInterval(() => {
      // Don't auto-slide if user is interacting (touch or mouse drag)
      if (!this.isInteracting && !this.isDown) {
        this.nextBanner();
      }
    }, 5000);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  onScroll() {
    // If dragging, we might not want to update index intensely, but it's fine.
    const container = this.scrollContainer()?.nativeElement;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    // Calculate index based on scroll position (width is 100%)
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      
      if (index !== this.activeBannerIndex() && index >= 0 && index < this.banners().length) {
        this.activeBannerIndex.set(index);
      }
    }
  }

  scrollToBanner(index: number) {
    const container = this.scrollContainer()?.nativeElement;
    if (!container) return;
    
    const width = container.clientWidth;
    container.scrollTo({
      left: width * index,
      behavior: 'smooth'
    });
  }

  nextBanner() {
    const len = this.banners().length;
    if (len === 0) return;
    const nextIndex = (this.activeBannerIndex() + 1) % len;
    this.scrollToBanner(nextIndex);
  }

  onBannerClick(banner: Banner) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    this.bannerClick.emit(banner);
  }
  
  // Touch Interaction
  onInteractionStart() {
    this.isInteracting = true;
  }
  
  onInteractionEnd() {
    this.isInteracting = false;
  }

  // Mouse Drag Logic
  startDrag(e: MouseEvent) {
    this.isDown = true;
    this.isDragging = false;
    this.isInteracting = true;
    
    const slider = this.scrollContainer()?.nativeElement;
    if (slider) {
      this.startX = e.pageX - slider.offsetLeft;
      this.scrollLeft = slider.scrollLeft;
      
      // Improve drag experience by disabling snap and smooth scroll temporarily
      slider.style.scrollBehavior = 'auto';
      slider.style.scrollSnapType = 'none';
    }
  }

  endDrag() {
    if (!this.isDown) return;
    this.isDown = false;
    this.isInteracting = false;

    const slider = this.scrollContainer()?.nativeElement;
    if (slider) {
      // Restore snap and smooth scroll
      slider.style.scrollBehavior = 'smooth';
      slider.style.scrollSnapType = 'x mandatory';
      
      // Optional: Snap to nearest manually if needed, 
      // but usually restoring scrollSnapType triggers a snap.
    }
  }

  doDrag(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const slider = this.scrollContainer()?.nativeElement;
    if (slider) {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startX); // 1:1 movement
      slider.scrollLeft = this.scrollLeft - walk;
      
      if (Math.abs(walk) > 5) {
        this.isDragging = true;
      }
    }
  }
}