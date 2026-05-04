import {
  Component, OnInit, OnDestroy, NgZone,
  ViewChild, ElementRef, AfterViewChecked,
  ChangeDetectorRef, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface MessageDTO {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: 'PATIENT' | 'NUTRITIONIST';
  content: string;
  isRead: boolean;
  sentAt: string;
}

export interface ConversationDTO {
  id: number;
  patientId: number;
  nutritionistId: number;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  messages: MessageDTO[];
}

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './conversation.html',
  styleUrls: ['./conversation.css']
})
export class ConversationComponent implements OnInit, OnDestroy, AfterViewChecked, OnChanges {

  @ViewChild('messagesEl') private messagesEl!: ElementRef<HTMLDivElement>;

  @Input() initialPatientId: number | null = null;  // ← AJOUT

  readonly currentRole: 'NUTRITIONIST' | 'PATIENT' = 'NUTRITIONIST';
  readonly currentUserId = 1;
  readonly nutritionistId = 1;

  private readonly apiUrl = 'http://localhost:8084/api';

  conversations: ConversationDTO[] = [];
  selectedConv: ConversationDTO | null = null;
  messages: MessageDTO[] = [];
  loadingMessages = false;
  searchQuery = '';

  newMessage = '';
  sendingMessage = false;

  showNewConvModal = false;
  newConvPatientId: number | null = null;
  newConvNutritionistId: number | null = this.nutritionistId;
  newConvError = '';
  creatingConv = false;

  private pollSub: Subscription | null = null;
  private shouldScrollBottom = false;

  private readonly avatarColors = [
    'av-rose', 'av-plum', 'av-sage', 'av-amber', 'av-teal'
  ];

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadConversations();

    // depuis l'URL (ancienne route)
    const patientId = this.route.snapshot.paramMap.get('patientId');
    if (patientId) {
      this.autoOpenOrCreateConversation(Number(patientId));
    }

    // depuis le dashboard via @Input
    if (this.initialPatientId) {
      this.autoOpenOrCreateConversation(this.initialPatientId);
    }
  }

  // ← AJOUT : réagit quand initialPatientId change
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialPatientId'] && changes['initialPatientId'].currentValue) {
      this.autoOpenOrCreateConversation(changes['initialPatientId'].currentValue);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollBottom) {
      this.scrollToBottom();
      this.shouldScrollBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  autoOpenOrCreateConversation(patientId: number): void {
    const payload = { patientId, nutritionistId: this.nutritionistId };
    this.http.post<ConversationDTO>(`${this.apiUrl}/conversations`, payload).subscribe({
      next: conv => this.ngZone.run(() => {
        const idx = this.conversations.findIndex(c => c.id === conv.id);
        if (idx === -1) this.conversations = [conv, ...this.conversations];
        this.selectConversation(conv);
        this.cdr.detectChanges();
      }),
      error: err => console.error('Erreur auto-open', err)
    });
  }

  loadConversations(): void {
    const url = this.currentRole === 'NUTRITIONIST'
      ? `${this.apiUrl}/conversations/nutritionist/${this.currentUserId}`
      : `${this.apiUrl}/conversations/patient/${this.currentUserId}`;

    this.http.get<ConversationDTO[]>(url).subscribe({
      next: data => this.ngZone.run(() => {
        this.conversations = data.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        this.cdr.detectChanges();
      }),
      error: err => console.error('Erreur chargement conversations', err)
    });
  }

  selectConversation(conv: ConversationDTO): void {
    this.selectedConv = conv;
    this.messages = [];
    this.loadingMessages = false;
    this.stopPolling();
    this.loadMessages(conv.id);
    this.startPolling(conv.id);
    if (conv.status === 'ACTIVE') {
      this.markAsRead(conv.id);
    }
  }

  loadMessages(convId: number): void {
    this.loadingMessages = true;
    this.http.get<MessageDTO[]>(`${this.apiUrl}/messages/conversation/${convId}`).subscribe({
      next: data => this.ngZone.run(() => {
        this.messages = data;
        this.loadingMessages = false;
        this.shouldScrollBottom = true;
        this.cdr.detectChanges();
      }),
      error: () => this.ngZone.run(() => {
        this.loadingMessages = false;
        this.cdr.detectChanges();
      })
    });
  }

  private startPolling(convId: number): void {
    this.stopPolling();
    this.pollSub = interval(5000).pipe(
      switchMap(() => this.http.get<MessageDTO[]>(`${this.apiUrl}/messages/conversation/${convId}`))
    ).subscribe({
      next: data => this.ngZone.run(() => {
        const hadNew = data.length > this.messages.length;
        this.messages = data;
        if (hadNew) {
          this.shouldScrollBottom = true;
          if (this.selectedConv?.status === 'ACTIVE') {
            this.markAsRead(convId);
          }
        }
        this.cdr.detectChanges();
      })
    });
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConv || this.sendingMessage) return;

    const content = this.newMessage.trim();
    this.newMessage = '';

    const tempMsg: MessageDTO = {
      id: Date.now(),
      conversationId: this.selectedConv.id,
      senderId: this.currentUserId,
      senderRole: this.currentRole,
      content: content,
      isRead: false,
      sentAt: new Date().toISOString()
    };
    this.messages = [...this.messages, tempMsg];
    this.shouldScrollBottom = true;
    this.cdr.detectChanges();

    this.sendingMessage = true;
    const payload: Partial<MessageDTO> = {
      conversationId: this.selectedConv.id,
      senderId: this.currentUserId,
      senderRole: this.currentRole,
      content: content
    };

    this.http.post<MessageDTO>(`${this.apiUrl}/messages`, payload).subscribe({
      next: msg => this.ngZone.run(() => {
        this.messages = this.messages.map(m => m.id === tempMsg.id ? msg : m);
        this.sendingMessage = false;
        this.shouldScrollBottom = true;
        this.cdr.detectChanges();
      }),
      error: () => this.ngZone.run(() => {
        this.messages = this.messages.filter(m => m.id !== tempMsg.id);
        this.newMessage = content;
        this.sendingMessage = false;
        this.cdr.detectChanges();
      })
    });
  }

  onEnterKey(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  markAsRead(convId: number): void {
    this.http.patch(
      `${this.apiUrl}/messages/conversation/${convId}/read?readerRole=${this.currentRole}`,
      {}
    ).subscribe({ next: () => {}, error: () => {} });
  }

  closeConversation(id: number): void {
    if (!confirm('Fermer cette conversation ?')) return;
    this.http.patch<ConversationDTO>(`${this.apiUrl}/conversations/${id}/close`, {}).subscribe({
      next: updated => this.ngZone.run(() => {
        if (this.selectedConv?.id === id) this.selectedConv = updated;
        this.stopPolling();
        this.loadConversations();
        this.cdr.detectChanges();
      })
    });
  }

  deleteConversation(id: number): void {
    if (!confirm('Supprimer cette conversation ?')) return;
    this.http.delete(`${this.apiUrl}/conversations/${id}`).subscribe({
      next: () => this.ngZone.run(() => {
        this.selectedConv = null;
        this.messages = [];
        this.stopPolling();
        this.loadConversations();
        this.cdr.detectChanges();
      })
    });
  }

  openNewConvModal(): void {
    this.showNewConvModal = true;
    this.newConvError = '';
    this.newConvPatientId = null;
    this.newConvNutritionistId = this.nutritionistId;
  }

  closeNewConvModal(): void {
    this.showNewConvModal = false;
  }

  createConversation(): void {
    if (!this.newConvPatientId || !this.newConvNutritionistId) {
      this.newConvError = 'Veuillez remplir tous les champs.';
      return;
    }
    this.creatingConv = true;
    this.newConvError = '';

    const payload = {
      patientId: this.newConvPatientId,
      nutritionistId: this.newConvNutritionistId
    };

    this.http.post<ConversationDTO>(`${this.apiUrl}/conversations`, payload).subscribe({
      next: conv => this.ngZone.run(() => {
        this.creatingConv = false;
        this.showNewConvModal = false;
        const idx = this.conversations.findIndex(c => c.id === conv.id);
        if (idx === -1) {
          this.conversations = [conv, ...this.conversations];
        }
        this.selectConversation(conv);
        this.cdr.detectChanges();
      }),
      error: err => this.ngZone.run(() => {
        this.creatingConv = false;
        this.newConvError = err.error?.message || 'Erreur lors de la création.';
      })
    });
  }

  get filteredConversations(): ConversationDTO[] {
    if (!this.searchQuery.trim()) return this.conversations;
    const q = this.searchQuery.toLowerCase();
    return this.conversations.filter(c =>
      String(c.patientId).includes(q) ||
      String(c.nutritionistId).includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  }

  getOtherLabel(conv: ConversationDTO): string {
    return this.currentRole === 'NUTRITIONIST'
      ? `Patient #${conv.patientId}`
      : `Nutritionniste #${conv.nutritionistId}`;
  }

  lastMessage(conv: ConversationDTO): string {
    if (!conv.messages || conv.messages.length === 0) return 'Aucun message';
    const last = conv.messages[conv.messages.length - 1];
    return last.content.length > 45 ? last.content.slice(0, 45) + '…' : last.content;
  }

  isMine(msg: MessageDTO): boolean {
    return msg.senderId === this.currentUserId && msg.senderRole === this.currentRole;
  }

  senderInitial(msg: MessageDTO): string {
    return msg.senderRole === 'PATIENT' ? 'P' : 'N';
  }

  avatarColor(convId: number): string {
    return this.avatarColors[convId % this.avatarColors.length];
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { }
  }
}