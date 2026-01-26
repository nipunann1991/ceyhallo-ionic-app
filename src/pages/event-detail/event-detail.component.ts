import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { Event } from '../../models/event.model';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class EventDetailComponent implements OnInit {
  private modalCtrl: ModalController = inject(ModalController);
  private dataService = inject(DataService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private navCtrl: NavController = inject(NavController);
  
  @Input() eventId!: string;
  private readonly eventIdSignal = signal<string | undefined>(undefined);
  private isRouteDriven = false;
  
  event = computed(() => {
    const id = this.eventIdSignal();
    if (id === undefined) return undefined;
    return this.dataService.getEvents()().find(e => e.id === id);
  });

  mapSafeUrl = computed(() => {
    const evt = this.event();
    if (evt && evt.location) {
      const query = encodeURIComponent(evt.location);
      const url = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return null;
  });

  ngOnInit() {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
        this.isRouteDriven = true;
        this.eventIdSignal.set(routeId);
    } else {
        this.eventIdSignal.set(this.eventId);
    }
  }

  handleImgError = handleImageError;

  close() {
    if (this.isRouteDriven) {
        this.navCtrl.back();
    } else {
        this.modalCtrl.dismiss();
    }
  }

  openMap() {
    const evt = this.event();
    if (evt && evt.location) {
        const query = encodeURIComponent(evt.location);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_system');
    }
  }
}