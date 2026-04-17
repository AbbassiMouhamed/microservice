import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Conversation,
  Message,
  ChatbotResponse,
  ChatHistory,
  Language,
  TranslationHistoryEntry,
  Invitation,
  MsgUser,
} from '../models';

@Injectable({ providedIn: 'root' })
export class MessagingApiService {
  private readonly base = '/api/messaging';

  constructor(private http: HttpClient) {}

  // Users
  getAllUsers(): Observable<MsgUser[]> {
    return this.http.get<MsgUser[]>(`${this.base}/users`);
  }

  // Conversations
  getUserConversations(userId: number): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.base}/conversations/user/${userId}`);
  }

  getConversation(conversationId: number, userId: number): Observable<Conversation> {
    return this.http.get<Conversation>(
      `${this.base}/conversations/${conversationId}/user/${userId}`,
    );
  }

  getConversationBetween(userId1: number, userId2: number): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.base}/conversations/between/${userId1}/${userId2}`);
  }

  // Messages
  sendMessage(senderId: number, receiverId: number, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.base}/messages/send/${senderId}`, {
      receiverId,
      content,
    });
  }

  getConversationMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.base}/messages/conversation/${conversationId}`);
  }

  sendMessageToConversation(conversationId: number, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.base}/messages/conversation/${conversationId}`, {
      content,
    });
  }

  getMessagesBetween(userId1: number, userId2: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.base}/messages/between/${userId1}/${userId2}`);
  }

  markMessagesRead(userId: number, conversationId: number): Observable<void> {
    return this.http.put<void>(`${this.base}/messages/mark-read/${userId}/${conversationId}`, {});
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/messages/unread-count/${userId}`);
  }

  getUnreadMessages(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.base}/messages/unread/${userId}`);
  }

  // Chatbot
  sendChatbotMessage(userId: number, message: string, level: string): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.base}/chatbot/message`, {
      userId,
      message,
      level,
    });
  }

  getChatbotHistory(userId: number): Observable<ChatHistory[]> {
    return this.http.get<ChatHistory[]>(`${this.base}/chatbot/history/${userId}`);
  }

  // Translation
  getLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(`${this.base}/translate/languages`);
  }

  translate(q: string, source: string, target: string, userId?: number): Observable<any> {
    const headers = userId ? new HttpHeaders({ 'X-User-Id': userId.toString() }) : undefined;
    return this.http.post(`${this.base}/translate`, { q, source, target }, { headers });
  }

  getTranslationHistory(userId: number): Observable<TranslationHistoryEntry[]> {
    return this.http.get<TranslationHistoryEntry[]>(`${this.base}/translate/history`, {
      headers: new HttpHeaders({ 'X-User-Id': userId.toString() }),
    });
  }

  // Invitations
  createInvitation(
    senderId: number,
    receiverId: number,
    message: string,
    invitationType: string,
  ): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.base}/invitations/create`, {
      senderId,
      receiverId,
      message,
      invitationType,
    });
  }

  getReceivedInvitations(userId: number): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.base}/invitations/received/${userId}`);
  }

  getSentInvitations(userId: number): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.base}/invitations/sent/${userId}`);
  }

  getPendingInvitations(userId: number): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.base}/invitations/pending/${userId}`);
  }

  acceptInvitation(invitationId: number): Observable<Invitation> {
    return this.http.put<Invitation>(`${this.base}/invitations/${invitationId}/accept`, {});
  }

  rejectInvitation(invitationId: number): Observable<Invitation> {
    return this.http.put<Invitation>(`${this.base}/invitations/${invitationId}/reject`, {});
  }

  // Block
  blockUser(blockerId: number, blockedId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/block/${blockerId}/${blockedId}`, {});
  }

  unblockUser(blockerId: number, blockedId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/block/${blockerId}/${blockedId}`);
  }

  getBlockedUsers(blockerId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/block/${blockerId}`);
  }

  // Presence
  getOnlineUsers(): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/presence/online`);
  }

  sendHeartbeat(userId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/presence/heartbeat`, { userId });
  }
}
