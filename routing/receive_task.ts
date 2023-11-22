import amqplib, { Replies } from "amqplib";

const EXCHANGE_NAME = "tasks";
const ROUTING_KEY = "task_queue";

const NUM_QUEUES = 100;

export const receiveTask = async () => {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "headers", { durable: true });
    channel.prefetch(NUM_QUEUES);

    const q = await channel.assertQueue("task", { exclusive: true });
    channel.bindQueue(q.queue, EXCHANGE_NAME, ROUTING_KEY)
    channel.consume(q.queue, msg => {
        if (!msg?.content) {
            console.log("null message");
            return;
        }
        const content = msg?.content.toString();
        const timeConsumed = (2 + 5 * Math.random()) * 1000;
        setTimeout(() => {
            console.log(`[${q.queue}] Finished ${content} in ${Math.floor(timeConsumed) / 1000}s`);
            channel.ack(msg);
        }, timeConsumed)
    },
        { noAck: false }
    );
}

receiveTask()