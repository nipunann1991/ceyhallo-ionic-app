import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class LegalPageComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private navCtrl: NavController = inject(NavController);

  docId = signal<string>('');
  
  // Get all legal docs from data service
  allDocs = this.dataService.getLegalDocs();

  // Compute the current document based on the route ID
  document = computed(() => {
    const id = this.docId();
    if (!id) return null;
    return this.allDocs().find(doc => doc.id === id);
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.docId.set(id);
      }
    });
  }

  handleImgError = handleImageError;

  goBack() {
    this.navCtrl.back();
  }
}