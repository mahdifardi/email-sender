import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import { MockEmailService } from "./mock-email.service";

type HandlerCB = (msg: string, emailService: MockEmailService) => any;

export class RabbitMQConnection {
  constructor(private emailService: MockEmailService) {}

  connection!: Connection;
  channel!: Channel;
  private connected!: boolean;

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retries: number,
    backoff: number
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
        } else {
          console.error(`Attempt ${attempt + 1} failed with unknown error`);
        }
        if (attempt === retries) {
          console.error("Max retries reached, aborting.");
          throw error;
        }
        const delay = backoff * 2 ** attempt;
        console.log(`Retrying in ${delay} ms...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw new Error("Operation failed after retries");
  }

  async connect(retries = 5, backoff = 1000) {
    if (this.connected && this.channel) return;

    this.connected = true;

    try {
      console.log(`Connecting to Rabbit-MQ Server`);

      const url = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;

      this.connection = await this.retryWithBackoff(
        () => client.connect(url),
        retries,
        backoff
      );

      console.log(`Rabbit MQ Connection is ready`);

      this.channel = await this.retryWithBackoff(
        () => this.connection.createChannel(),
        retries,
        backoff
      );

      console.log(`Created RabbitMQ Channel successfully`);
    } catch (error) {
      console.error(`Failed to connect to MQ Server after retries`);
      this.connected = false;
    }
  }

  async consume(queue: string, handleIncomingNotification: HandlerCB) {
    console.log("+++++++");

    console.log(queue);
    console.log("+++++++");

    try {
      await this.channel.assertQueue(queue, {
        durable: true,
      });

      this.channel.consume(
        queue,
        (msg) => {
          if (!msg) {
            return console.error(`Invalid incoming message`);
          }
          handleIncomingNotification(msg.content.toString(), this.emailService);
          this.channel.ack(msg);
        },
        {
          noAck: false,
        }
      );

      console.log(`Consuming messages from queue: ${queue}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error while consuming messages: ${error.message}`);
      } else {
        console.error(`Error while consuming messages due to unknown error`);
      }
    }
  }
}
