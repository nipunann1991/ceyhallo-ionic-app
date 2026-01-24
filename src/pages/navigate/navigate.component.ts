import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NavRootComponent } from '../nav-root/nav-root.component';

@Component({
  selector: 'app-navigate',
  templateUrl: './navigate.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule],
})
export class NavigateComponent {
  rootPage = NavRootComponent;
}