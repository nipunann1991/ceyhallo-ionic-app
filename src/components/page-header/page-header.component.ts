import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
  styles: [`
    .page-header-safe {
      padding-top: calc(4rem + env(safe-area-inset-top));
    }
    :host-context(.plt-android) .page-header-safe {
      padding-top: calc(2rem + env(safe-area-inset-top));
    }
  `]
})
export class PageHeaderComponent {
  title = input.required<string>();
  searchPlaceholder = input<string>('Search...');
  searchValue = input<string>('');
  isModal = input<boolean>(false);

  searchChange = output<string>();
  back = output<void>();

  onSearchInput(ev: any) {
    this.searchChange.emit(ev.target.value || '');
  }

  onBack() {
    this.back.emit();
  }
}