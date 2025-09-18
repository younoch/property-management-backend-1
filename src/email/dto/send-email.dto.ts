export interface Attachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

export interface SendEmailDto {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}
