
import { Injectable, signal, inject } from '@angular/core';
import { GoogleGenAI, Chat } from "@google/genai";
import { DataService } from './data.service';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private dataService = inject(DataService);
  
  // Signal to hold UI state of messages
  public messages = signal<ChatMessage[]>([]);
  public isThinking = signal(false);

  constructor() {
    // Initialize Gemini API
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.startNewSession();
  }

  startNewSession() {
    const context = this.buildContext();
    
    this.chatSession = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are CeyBot, the helpful AI assistant for the CeyHallo app. 
Your goal is to help Sri Lankans living in the UAE and Qatar find jobs, businesses, restaurants, and community events. 
Be polite, concise, and helpful. 

Here is the current data available in the app. Use this to answer user questions accurately.

${context}

If a user asks about something not in this list, suggest they check the Search tab or try a different query.`,
      },
    });
    
    // Reset UI messages with a welcome message
    this.messages.set([
      { role: 'model', text: 'Ayubowan! I am CeyBot. I can help you find restaurants, jobs, events, and businesses listed in CeyHallo. What are you looking for today?' }
    ]);
  }

  private buildContext(): string {
    const businesses = this.dataService.getBusinesses()();
    const restaurants = this.dataService.getRestaurants()();
    const events = this.dataService.getEvents()();
    const jobs = this.dataService.getJobs()();
    const offers = this.dataService.getOffers()();

    let context = "--- DATA START ---\n";

    if (restaurants.length > 0) {
      context += "\n[RESTAURANTS]\n";
      context += restaurants.map(r => `- ${r.name} (${r.category}) in ${r.location}. Rating: ${r.rating}. Desc: ${r.description}`).join('\n');
    }

    if (businesses.length > 0) {
      context += "\n\n[BUSINESSES]\n";
      context += businesses.map(b => `- ${b.name} (${b.category}) in ${b.location}. Desc: ${b.description}`).join('\n');
    }

    if (events.length > 0) {
      context += "\n\n[EVENTS]\n";
      context += events.map(e => `- ${e.title} on ${e.date.toDateString()} at ${e.location}. Category: ${e.category}.`).join('\n');
    }

    if (jobs.length > 0) {
      context += "\n\n[JOBS]\n";
      context += jobs.map(j => `- ${j.title} at ${j.company} (${j.location}). Type: ${j.jobType}.`).join('\n');
    }
    
    if (offers.length > 0) {
      context += "\n\n[OFFERS]\n";
      context += offers.map(o => `- ${o.title} at ${o.targetName}: ${o.discount}.`).join('\n');
    }

    context += "\n--- DATA END ---";
    return context;
  }

  async sendMessage(userText: string) {
    if (!this.chatSession || !userText.trim()) return;

    // 1. Add User Message immediately
    this.messages.update(msgs => [...msgs, { role: 'user', text: userText }]);
    this.isThinking.set(true);

    try {
      // 2. Call Gemini API
      const response = await this.chatSession.sendMessage({ message: userText });
      
      // 3. Add Model Response
      this.messages.update(msgs => [...msgs, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error('AI Error:', error);
      this.messages.update(msgs => [...msgs, { role: 'model', text: 'I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      this.isThinking.set(false);
    }
  }
}
