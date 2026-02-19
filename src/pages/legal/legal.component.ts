
import { Component, ChangeDetectionStrategy, signal, OnInit, computed, Signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';
import { LegalDocument } from '../../models/legal.model';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class LegalPageComponent implements OnInit {
  @Input() docIdInput?: string;
  @Input() isModal: boolean = false;

  docId = signal<string>('');
  allDocs: Signal<LegalDocument[]>;
  document: Signal<(LegalDocument & { title: string }) | null>;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {
    this.allDocs = this.dataService.getLegalDocs();
    
    this.document = computed(() => {
        const id = this.docId();
        if (!id) return null;
        const doc = this.allDocs().find(doc => doc.id === id);
        
        if (!doc) return null;
    
        // Strict title mapping as requested
        let title = doc.title;
        if (id === 'privacy') title = 'Privacy Policy';
        if (id === 'terms') title = 'Terms & Conditions';
    
        return { ...doc, title };
    });
  }

  ngOnInit() {
    if (this.docIdInput) {
      this.docId.set(this.docIdInput);
    } else {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.docId.set(id);
        }
      });
    }
  }

  handleImgError = handleImageError;

  goBack() {
    if (this.isModal) {
      this.modalCtrl.dismiss();
    } else {
      this.navCtrl.navigateBack('/tabs/profile');
    }
  }
}
