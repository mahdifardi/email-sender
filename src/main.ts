import { RabbitMQConnection } from "./rabbitqm-connection.";

const handleIncomingNotification = (msg: string) => {
  try {
    const parsedMessage = JSON.parse(msg);

    console.log(`Received Report`, parsedMessage);
  } catch (error) {
    console.error(`Error While Parsing the message`);
  }
};

const listen = async () => {
  const mqConnection = new RabbitMQConnection();

  await mqConnection.connect();

  await mqConnection.consume(
    process.env.RabbitMQ_QUEUE_NAME!,
    handleIncomingNotification
  );
};

listen();
