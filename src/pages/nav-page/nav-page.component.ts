import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-nav-page',
  templateUrl: './nav-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, CommonModule],
})
export class NavPageComponent implements OnInit {
  // FIX: Explicitly type injected NavParams to resolve type inference issue.
  private navParams: NavParams = inject(NavParams);
  receivedMessage = signal('');

  ngOnInit() {
    this.receivedMessage.set(this.navParams.get('message'));
  }
}