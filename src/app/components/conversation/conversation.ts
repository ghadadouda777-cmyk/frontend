import {
  Component, OnInit, OnDestroy, NgZone,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// ── Interfaces aligned with backend DTOs ──────────────────────────────────

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

// ── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './conversation.html',
  styleUrls: ['./conversation.css']
})
export class ConversationComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('messagesEl') private messagesEl!: ElementRef<HTMLDivElement>;

  // ── Config ──────────────────────────────────────────────────────────────
  /** Role of the logged-in user — switch to 'PATIENT' for the patient side */
  readonly currentRole: 'NUTRITIONIST' | 'PATIENT' = 'NUTRITIONIST';
  readonly currentUserId = 1;             // ID of the logged-in user
  readonly nutritionistId = 1;            // used when role = NUTRITIONIST

  private readonly apiUrl = '/api';

  // ── State ───────────────────────────────────────────────────────────────
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

  constructor(private http: HttpClient, private ngZone: NgZone) { }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadConversations();
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

  // ── Data loading ─────────────────────────────────────────────────────────

  loadConversations(): void {
    const url = this.currentRole === 'NUTRITIONIST'
      ? `${this.apiUrl}/conversations/nutritionist/${this.currentUserId}`
      : `${this.apiUrl}/conversations/patient/${this.currentUserId}`;

    this.http.get<ConversationDTO[]>(url).subscribe({
      next: data => this.ngZone.run(() => {
        this.conversations = data.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }),
      error: err => console.error('Erreur chargement conversations', err)
    });
  }

  selectConversation(conv: ConversationDTO): void {
    this.selectedConv = conv;
    this.messages = [];
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
      }),
      error: () => this.ngZone.run(() => { this.loadingMessages = false; })
    });
  }

  // ── Polling ──────────────────────────────────────────────────────────────

  private startPolling(convId: number): void {
    this.stopPolling();
    this.pollSub = interval(3000).pipe(
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
      })
    });
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }

  // ── Send message ─────────────────────────────────────────────────────────

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConv || this.sendingMessage) return;

    this.sendingMessage = true;
    const payload: Partial<MessageDTO> = {
      conversationId: this.selectedConv.id,
      senderId: this.currentUserId,
      senderRole: this.currentRole,
      content: this.newMessage.trim()
    };

    this.http.post<MessageDTO>(`${this.apiUrl}/messages`, payload).subscribe({
      next: msg => this.ngZone.run(() => {
        this.messages.push(msg);
        this.newMessage = '';
        this.sendingMessage = false;
        this.shouldScrollBottom = true;
        this.loadConversations();
      }),
      error: () => this.ngZone.run(() => { this.sendingMessage = false; })
    });
  }

  onEnterKey(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // ── Read receipt ─────────────────────────────────────────────────────────

  markAsRead(convId: number): void {
    const readerRole = this.currentRole;
    this.http.patch(
      `${this.apiUrl}/messages/conversation/${convId}/read?readerRole=${readerRole}`,
      {}
    ).subscribe();
  }

  // ── Conversation actions ──────────────────────────────────────────────────

  closeConversation(id: number): void {
    if (!confirm('Fermer cette conversation ?')) return;
    this.http.patch<ConversationDTO>(`${this.apiUrl}/conversations/${id}/close`, {}).subscribe({
      next: updated => this.ngZone.run(() => {
        if (this.selectedConv?.id === id) this.selectedConv = updated;
        this.stopPolling();
        this.loadConversations();
      })
    });
  }

  deleteConversation(id: number): void {
    if (!confirm('Supprimer cette conversation ? Cette action est irréversible.')) return;
    this.http.delete(`${this.apiUrl}/conversations/${id}`).subscribe({
      next: () => this.ngZone.run(() => {
        this.selectedConv = null;
        this.messages = [];
        this.stopPolling();
        this.loadConversations();
      })
    });
  }

  // ── New conversation modal ────────────────────────────────────────────────

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
        this.loadConversations();
        setTimeout(() => this.selectConversation(conv), 300);
      }),
      error: err => this.ngZone.run(() => {
        this.creatingConv = false;
        this.newConvError = err.error?.message || 'Erreur lors de la création.';
      })
    });
  }

  // ── Computed / helpers ────────────────────────────────────────────────────

  get filteredConversations(): ConversationDTO[] {
    if (!this.searchQuery.trim()) return this.conversations;
    const q = this.searchQuery.toLowerCase();
    return this.conversations.filter(c =>
      String(c.patientId).includes(q) ||
      String(c.nutritionistId).includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  }

  /** Label shown in the list for the "other" participant */
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