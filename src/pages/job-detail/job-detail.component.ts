import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { Job } from '../../models/job.model';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class JobDetailComponent implements OnInit {
  private modalCtrl: ModalController = inject(ModalController);
  private dataService = inject(DataService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private navCtrl: NavController = inject(NavController);
  
  @Input() jobId!: string;
  private readonly jobIdSignal = signal<string | undefined>(undefined);
  private isRouteDriven = false;
  
  job = computed(() => {
    const id = this.jobIdSignal();
    if (id === undefined) return undefined;
    return this.dataService.getJobs()().find(j => j.id === id);
  });

  ngOnInit() {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
        this.isRouteDriven = true;
        this.jobIdSignal.set(routeId);
    } else {
        this.jobIdSignal.set(this.jobId);
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
}