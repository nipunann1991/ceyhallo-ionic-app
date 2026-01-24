import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, RouterOutlet]
})
export class AppComponent {
  constructor() {
    // Detect if the device is an iPhone and apply a specific class to the html element
    // This allows us to apply targeted styles for better readability and usability on iPhones.
    const isIphone = /iPhone/i.test(navigator.userAgent);
    if (isIphone) {
      document.documentElement.classList.add('is-iphone');
    }
  }
}