import { MockEmailService } from "./mock-email.service";
import { RabbitMQConnection } from "./rabbitqm-connection.";

const handleIncomingNotification = (
  msg: string,
  emailService: MockEmailService
) => {
  try {
    const parsedMessage = JSON.parse(msg);
    emailService.sendEmail("admin", "dailyReport", parsedMessage);
    console.log(`Received Report`, parsedMessage);
  } catch (error) {
    console.error(`Error While Parsing the message`);
  }
};

const listen = async () => {
  const emailService = new MockEmailService();

  const mqConnection = new RabbitMQConnection(emailService);

  await mqConnection.connect();

  await mqConnection.consume(
    process.env.RabbitMQ_QUEUE_NAME!,
    handleIncomingNotification
  );
};

listen();
