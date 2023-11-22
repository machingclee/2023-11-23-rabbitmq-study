import amqplib from "amqplib";

const EXCHANGE_NAME = "logs";

const receiveLog = async () => {
    const connection = await amqplib.connect("amqp://localhost");

    // pipeline of messages into/outof RabbitMQ
    // direct exchange by default
    const channel = await connection.createChannel();

    // create a queue with queuename if not exists, no matter we publish or receive
    // durable: false means it will be recreated if the service restart, true by default
    await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: true });
    const q = await channel.assertQueue("", { exclusive: true });
    // limit the amount of tasks to be run on a node
    // channel.prefetch(1)
    console.log("waiting for messages in queue:", q.queue)
    channel.bindQueue(q.queue, EXCHANGE_NAME, "")

    channel.consume(
        q.queue,
        msg => {
            if (!msg?.content) {
                console.log("null message")
                return;
            }
            console.log("[X] Receive:", msg?.content.toString());
        },
        { noAck: true }
    );

}

receiveLog();