import amqplib from "amqplib";

const QUEUE_NAME = "task";

const consumeTask = async () => {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.prefetch(1)
    console.log("waiting for messages in queue:", QUEUE_NAME)

    channel.consume(
        QUEUE_NAME,
        msg => {
            if (!msg) {
                return;
            }
            console.log("[X] Receive:", msg?.content.toString());
            setTimeout(() => {
                console.log("Pretend to be resizing image");
                channel.ack(msg);
            }, 5000);
        },
        { noAck: false }
    );

}

consumeTask();