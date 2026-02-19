
import { Component, ChangeDetectionStrategy, computed, signal, OnInit, Input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { handleImageError } from '../../utils/image.utils';
import { ActivatedRoute } from '@angular/router';
import { getRelativeTime } from '../../utils/date.utils';
import { Job } from '../../models/job.model';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class JobDetailComponent implements OnInit {
  @Input() jobId!: string;
  private readonly jobIdSignal = signal<string | undefined>(undefined);
  private isRouteDriven = false;
  
  job: Signal<Job | undefined>;
  formattedTime: Signal<string | null>;

  constructor(
    private modalCtrl: ModalController,
    private dataService: DataService,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {
    this.job = computed(() => {
        const id = this.jobIdSignal();
        if (id === undefined) return undefined;
        return this.dataService.getJobs()().find(j => j.id === id);
    });

    this.formattedTime = computed(() => {
        const j = this.job();
        return j ? getRelativeTime(j.postedDate) : null;
    });
  }

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
