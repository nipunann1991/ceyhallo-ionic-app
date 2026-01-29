import { Component, ChangeDetectionStrategy, OnInit, signal, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-nav-page',
  templateUrl: './nav-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, CommonModule],
})
export class NavPageComponent implements OnInit {
  receivedMessage = signal('');

  // Use constructor injection with @Optional() to prevent NG0203 errors
  constructor(@Optional() private navParams: NavParams) {}

  ngOnInit() {
    if (this.navParams) {
      this.receivedMessage.set(this.navParams.get('message'));
    }
  }
}