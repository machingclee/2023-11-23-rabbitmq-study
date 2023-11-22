import amqplib from "amqplib";

const QUEUE_NAME = "task";
const msg = "hello world";

const sendTask = async () => {
    const connection = await amqplib.connect("amqp://localhost");

    // pipeline of messages into RabbitMQ
    // direct exchange by default
    const channel = await connection.createChannel();

    // create a queue with queuename if not exists
    // durable: false means it will be recreated if the service restart, true by default
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(msg), { persistent: true });

    console.log("sent:", msg);
    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 1000)

}

sendTask();