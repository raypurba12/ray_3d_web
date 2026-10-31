import { request } from "../../../lib/api";

export const MESSAGES_UPDATED_EVENT = "admin:messages-updated";

export type MessageStatus = "NEW" | "READ" | "ARCHIVED";
export type MessageFilter = "all" | MessageStatus;

export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  readAt: string | null;
  createdAt: string;
};

export const listMessages = (filter: MessageFilter = "all") =>
  request<AdminMessage[]>(
    filter === "all" ? "/contact" : `/contact?status=${filter}`
  );

export const getUnreadMessageCount = () =>
  request<{ count: number }>("/contact/unread-count");

export const updateMessageStatus = (id: string, status: MessageStatus) =>
  request<AdminMessage>(`/contact/${id}`, {
    method: "PATCH",
    body: { status },
  });

export const deleteMessage = (id: string) =>
  request<{ id: string }>(`/contact/${id}`, { method: "DELETE" });

export const notifyMessagesUpdated = () =>
  window.dispatchEvent(new Event(MESSAGES_UPDATED_EVENT));
