import { Component, ChangeDetectionStrategy, inject, ElementRef } from '@angular/core';
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
  private elementRef = inject(ElementRef);

  pushPage() {
    // FIX: The NavController.push method is not available on the injected NavController in this context.
    // Instead, we get a reference to the parent ion-nav element and call its push method directly.
    const nav = this.elementRef.nativeElement.closest('ion-nav');
    if (nav) {
      nav.push(NavPageComponent, {
        message: 'Hello from NavRootComponent!'
      });
    }
  }
}