import { Component, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NavPageComponent } from '../nav-page/nav-page.component';

@Component({
  selector: 'app-nav-root',
  templateUrl: './nav-root.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, CommonModule],
})
export class NavRootComponent {
  // Use constructor injection to prevent NG0203 errors
  constructor(private elementRef: ElementRef) {}

  pushPage() {
    const nav = this.elementRef.nativeElement.closest('ion-nav');
    if (nav) {
      nav.push(NavPageComponent, {
        message: 'Hello from NavRootComponent!'
      });
    }
  }
}