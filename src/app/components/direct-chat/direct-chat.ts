import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  senderRole: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

@Component({
  selector: 'app-direct-chat',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  template: `
<div class="dc-wrap">
  @if (loading) { <div class="dc-center">Connexion...</div> }
  @if (error && !loading) { <div class="dc-center dc-err">{{ error }}</div> }
  @if (!loading && !error) {
    <div class="dc-messages" #msgEl>
      @if (messages.length === 0) {
        <div class="dc-center">
          <div class="dc-av">{{ targetName ? targetName[0] : '?' }}</div>
          <p class="dc-name">{{ targetName }}</p>
          <p class="dc-hint">Commencez la conversation</p>
        </div>
      }
      @for (m of messages; track m.id) {
        <div class="dc-row" [class.dc-mine]="isMine(m)" [class.dc-theirs]="!isMine(m)">
          @if (!isMine(m)) { <div class="dc-av sm">{{ targetName ? targetName[0] : '?' }}</div> }
          <div class="dc-col">
            @if (!isMine(m)) { <span class="dc-sender">{{ targetName }}</span> }
            <div class="dc-bubble" [class.dc-b-mine]="isMine(m)" [class.dc-b-theirs]="!isMine(m)">{{ m.content }}</div>
            <span class="dc-time" [class.dc-tr]="isMine(m)">{{ m.sentAt | date:'HH:mm' }}</span>
          </div>
        </div>
      }
    </div>
    <div class="dc-bar">
      <input class="dc-input" type="text" placeholder="Write a message" [(ngModel)]="newMessage" (keydown.enter)="onEnter($any($event))" />
      <button class="dc-send" [disabled]="!newMessage.trim() || sending" (click)="sendMessage()">{{ sending ? '⏳' : '➤' }}</button>
    </div>
  }
</div>`,
  styles: [`
.dc-wrap{display:flex;flex-direction:column;height:calc(100vh - 180px);background:#fff;border-radius:20px;box-shadow:0 2px 16px rgba(13,148,136,.08);overflow:hidden}
.dc-messages{flex:1;overflow-y:auto;padding:24px 20px;display:flex;flex-direction:column;gap:16px;background:#f8fffe}
.dc-center{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:10px;padding:60px 0;color:#9ca3af;font-size:14px}
.dc-err{color:#ef4444}
.dc-av{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#0d9488,#059669);color:#fff;font-size:20px;font-weight:800;display:flex;align-items:center;justify-content:center}
.dc-av.sm{width:36px;height:36px;font-size:14px;flex-shrink:0}
.dc-name{font-size:16px;font-weight:700;color:#111827}
.dc-hint{font-size:13px}
.dc-row{display:flex;align-items:flex-end;gap:10px;max-width:75%}
.dc-mine{align-self:flex-end;flex-direction:row-reverse}
.dc-theirs{align-self:flex-start}
.dc-col{display:flex;flex-direction:column;gap:3px}
.dc-sender{font-size:11px;font-weight:600;color:#6b7280;padding-left:4px}
.dc-bubble{padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.5;word-break:break-word}
.dc-b-theirs{background:#e8f5f3;color:#111827;border-bottom-left-radius:4px}
.dc-b-mine{background:#0d9488;color:#fff;border-bottom-right-radius:4px}
.dc-time{font-size:11px;color:#9ca3af;padding:0 4px}
.dc-tr{text-align:right}
.dc-bar{display:flex;align-items:center;gap:12px;padding:16px 20px;border-top:1px solid #f0fdf4;background:#fff}
.dc-input{flex:1;border:none;outline:none;font-size:14px;color:#111827;background:transparent;padding:8px 0}
.dc-input::placeholder{color:#9ca3af}
.dc-send{width:40px;height:40px;border-radius:50%;background:#0d9488;color:#fff;border:none;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center}
.dc-send:hover:not(:disabled){background:#059669}
.dc-send:disabled{background:#d1d5db;cursor:not-allowed}
`]
})
export class DirectChatComponent implements OnInit, OnDestroy, OnChanges, AfterViewChecked {

  @Input() patientId: string = '';
  @Input() targetId: string | null = null;
  @Input() targetName: string = '';
  @Input() senderRole: string = 'PATIENT';
  @Input() isCoach: boolean = false;

  @ViewChild('messagesEl') messagesEl!: ElementRef<HTMLDivElement>;

  conversationId: number | null = null;
  messages: Message[] = [];
  newMessage = '';
  sending = false;
  loading = true;
  error = '';
  private shouldScroll = false;
  private pollSub: Subscription | null = null;
  private readonly api = 'http://localhost:8084/api';

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.patientId && this.targetId) {
      this.initConversation();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['patientId'] || changes['targetId'] || changes['isCoach']) && this.patientId && this.targetId) {
      this.stopPolling();
      this.conversationId = null;
      this.messages = [];
      this.initConversation();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  initConversation(): void {
    this.loading = true;
    this.error = '';
    const payload: any = { patientId: this.patientId };
    if (this.isCoach) {
      payload.coachId = this.targetId;
    } else {
      payload.nutritionistId = this.targetId;
    }

    console.log('📤 initConversation payload:', JSON.stringify(payload));

    this.http.post<any>(`${this.api}/conversations`, payload).subscribe({
      next: (conv) => {
        this.ngZone.run(() => {
          this.conversationId = conv.id;
          this.loading = false;
          this.loadMessages();
          this.startPolling();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.error = 'Impossible de charger la conversation.';
          console.error('❌ initConversation:', err);
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadMessages(): void {
    if (!this.conversationId) return;
    this.http.get<Message[]>(`${this.api}/messages/conversation/${this.conversationId}`).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.messages = data;
          this.shouldScroll = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('❌ loadMessages:', err)
    });
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollSub = interval(4000).pipe(
      switchMap(() => this.http.get<Message[]>(`${this.api}/messages/conversation/${this.conversationId}`))
    ).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          if (data.length !== this.messages.length) {
            this.messages = data;
            this.shouldScroll = true;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.conversationId || this.sending) return;
    const content = this.newMessage.trim();
    this.newMessage = '';
    this.sending = true;

    const payload = {
      conversationId: this.conversationId,
      senderId: this.patientId,
      senderRole: this.senderRole,
      content
    };

    this.http.post<Message>(`${this.api}/messages`, payload).subscribe({
      next: (msg) => {
        this.ngZone.run(() => {
          this.messages = [...this.messages, msg];
          this.sending = false;
          this.shouldScroll = true;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.newMessage = content;
          this.sending = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  onEnter(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isMine(msg: Message): boolean {
    return String(msg.senderId) === String(this.patientId);
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
