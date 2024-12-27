import { DailySummaryReport } from "../../src/email.model";
import { MockEmailService } from "../../src/mock-email.service";

describe("MockEmailService", () => {
  let emailService: MockEmailService;
  beforeAll(async () => {
    emailService = new MockEmailService();
  });

  it("should send an email and store it in sentEmails", async () => {
    const report: DailySummaryReport = {
      totalSales: 1000,
      skuSummary: [
        { sku: "sku-1", totalQuantity: 10 },
        { sku: "sku-2", totalQuantity: 20 },
      ],
    };

    await emailService.sendEmail("admin", "Daily Report", report);

    const sentEmails = emailService.getSentEmails();

    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe("admin");
    expect(sentEmails[0].subject).toBe("Daily Report");
    expect(sentEmails[0].body).toEqual(report);

    expect(emailService.getSentEmails().length).toBe(1);
  });

  it("should clear sent emails", () => {
    emailService.clearSentEmails();
    expect(emailService.getSentEmails()).toHaveLength(0);
  });
});
