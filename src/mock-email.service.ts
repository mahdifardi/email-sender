import { DailySummaryReport, Email } from "./email.model";

export class MockEmailService {
  private sentEmails: Email[] = [];

  async sendEmail(
    to: string,
    subject: string,
    body: DailySummaryReport
  ): Promise<void> {
    console.log(`Mock sending email to ${to} with subject "${subject}"`);
    this.sentEmails.push({ to, subject, body });
  }

  getSentEmails(): Email[] {
    return this.sentEmails;
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }
}
