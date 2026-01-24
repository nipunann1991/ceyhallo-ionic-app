import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Job } from '../../models/job.model';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class JobDetailComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private dataService = inject(DataService);
  
  public jobId!: string;
  private readonly jobIdSignal = signal<string | undefined>(undefined);
  
  job = computed(() => {
    const id = this.jobIdSignal();
    if (id === undefined) return undefined;
    return this.dataService.getJobs()().find(j => j.id === id);
  });

  ngOnInit() {
    this.jobIdSignal.set(this.jobId);
  }

  handleImgError = handleImageError;

  close() {
    this.modalCtrl.dismiss();
  }
}