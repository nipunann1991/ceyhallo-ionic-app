
import { Component, ChangeDetectionStrategy, signal, ViewChild, ElementRef, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  template: `
<ion-header class="ion-no-border shadow-sm">
  <ion-toolbar class="bg-[#083594]" style="--background: #083594; --color: white;">
    <div slot="start" class="pl-3">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <ion-icon name="sparkles" class="text-white text-lg"></ion-icon>
        </div>
    </div>
    <ion-title class="text-sm font-bold">CeyBot Assistant</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="close()">
        <ion-icon name="close" class="text-white text-2xl"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="bg-[#F2F4F7]" [scrollY]="false">
  <div class="flex flex-col h-full">
    
    <!-- Chat Area -->
    <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F2F4F7]">
      
      @for (msg of messages(); track $index) {
        <div class="flex w-full" [class.justify-end]="msg.role === 'user'">
          
          <!-- Avatar for AI -->
          @if (msg.role === 'model') {
            <div class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 mr-2 self-end mb-1 shadow-sm">
                <ion-icon name="logo-android" class="text-[#083594]"></ion-icon>
            </div>
          }

          <div 
            class="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm relative break-words"
            [class.bg-[#083594]]="msg.role === 'user'"
            [class.text-white]="msg.role === 'user'"
            [class.rounded-br-none]="msg.role === 'user'"
            [class.bg-white]="msg.role === 'model'"
            [class.text-gray-800]="msg.role === 'model'"
            [class.rounded-bl-none]="msg.role === 'model'">
            {{ msg.text }}
          </div>

        </div>
      }

      <!-- Thinking Indicator -->
      @if (isThinking()) {
        <div class="flex w-full">
            <div class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 mr-2 self-end mb-1 shadow-sm">
                <ion-icon name="logo-android" class="text-[#083594]"></ion-icon>
            </div>
            <div class="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1 items-center h-10">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
        </div>
      }

    </div>

    <!-- Suggestions Chips -->
    @if (messages().length < 3 && !isThinking()) {
      <div class="px-4 pb-2">
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button (click)="sendMessage('Find Sri Lankan restaurants')" class="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-[#083594] shadow-sm active:bg-blue-50 transition-colors">
            🍛 Restaurants
          </button>
          <button (click)="sendMessage('Any upcoming events?')" class="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-[#083594] shadow-sm active:bg-blue-50 transition-colors">
            📅 Events
          </button>
          <button (click)="sendMessage('Looking for jobs')" class="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-[#083594] shadow-sm active:bg-blue-50 transition-colors">
            💼 Jobs
          </button>
          <button (click)="sendMessage('Community news')" class="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-[#083594] shadow-sm active:bg-blue-50 transition-colors">
            📰 News
          </button>
        </div>
      </div>
    }

    <!-- Input Area -->
    <div class="bg-white border-t border-gray-100 p-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div class="flex items-end gap-2 bg-gray-100 rounded-[1.5rem] p-1.5 pl-4 transition-all focus-within:ring-2 focus-within:ring-[#083594]/20 focus-within:bg-white focus-within:shadow-md">
        <textarea 
            [(ngModel)]="inputText"
            rows="1"
            class="w-full bg-transparent border-none outline-none text-sm text-[#1A1C1E] py-2.5 max-h-32 resize-none placeholder-gray-400"
            placeholder="Ask CeyBot..."
            style="min-height: 40px;"
            (keydown.enter)="$event.preventDefault(); sendMessage()"></textarea>
        
        <button 
            (click)="sendMessage()"
            [disabled]="!inputText() || isThinking()"
            class="w-10 h-10 rounded-full bg-[#083594] text-white flex items-center justify-center shrink-0 shadow-md active:scale-90 transition-all disabled:opacity-50 disabled:shadow-none">
            <ion-icon name="send" class="ml-0.5"></ion-icon>
        </button>
      </div>
    </div>

  </div>
</ion-content>
`,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AiChatComponent {
  private aiService = inject(AiService);
  private modalCtrl: ModalController = inject(ModalController);

  messages = this.aiService.messages;
  isThinking = this.aiService.isThinking;
  
  inputText = signal('');
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    // Auto-scroll effect when messages change
    effect(() => {
      const _ = this.messages();
      const __ = this.isThinking();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  sendMessage(text?: string) {
    const msg = text || this.inputText().trim();
    if (!msg) return;

    this.inputText.set(''); // Clear input
    this.aiService.sendMessage(msg);
  }

  private scrollToBottom() {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
