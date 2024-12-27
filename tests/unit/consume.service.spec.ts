import { MockEmailService } from "../../src/mock-email.service";
import { RabbitMQConnection } from "../../src/rabbitqm-connection.";

// Mock amqplib client methods
jest.mock("amqplib", () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertQueue: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn().mockImplementation((queue, cb) => {
        cb({
          content: Buffer.from(
            JSON.stringify({ totalSales: 100, skuSummary: [] })
          ),
        });
      }),
      ack: jest.fn(),
    }),
  }),
}));

describe("RabbitMQConnection", () => {
  let emailService: MockEmailService;
  let mqConnection: RabbitMQConnection;

  beforeEach(() => {
    emailService = new MockEmailService();
    mqConnection = new RabbitMQConnection(emailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should consume messages from the queue and process them", async () => {
    const mockHandleIncomingNotification = jest.fn();
    const queueName = "test-queue";

    await mqConnection.connect();
    await mqConnection.consume(queueName, mockHandleIncomingNotification);

    expect(mockHandleIncomingNotification).toHaveBeenCalledWith(
      '{"totalSales":100,"skuSummary":[]}',
      emailService
    );

    await emailService.sendEmail("admin", "dailyReport", {
      totalSales: 100,
      skuSummary: [],
    });

    expect(emailService.getSentEmails()).toHaveLength(1);
    const email = emailService.getSentEmails()[0];
    expect(email.subject).toBe("dailyReport");
  });
});
