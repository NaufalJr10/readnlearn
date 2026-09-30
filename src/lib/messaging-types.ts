export type MessageDTO = {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
};

export type ConversationDTO = {
  partnerId: string;
  partnerName: string;
  partnerRole: "student" | "tutor";
  lastMessage: string | null;
  lastAt: string | null;
  lastFromMe: boolean;
  unread: number;
};

export type ContactDTO = { id: string; name: string; role: "student" | "tutor"; detail: string };

export type SearchHitDTO = { id: string; partnerId: string; partnerName: string; content: string; createdAt: string };
