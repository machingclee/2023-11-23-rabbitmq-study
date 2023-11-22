import amqplib, { Replies } from "amqplib";

const EXCHANGE_NAME = "tasks_headers";

const NUM_QUEUES = 100;

export const receiveTask = async () => {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "headers", { durable: false });
    channel.prefetch(NUM_QUEUES);

    const q = await channel.assertQueue("task", { exclusive: true });
    channel.bindQueue(
        q.queue,
        EXCHANGE_NAME,
        "", // headers exchange ignore routing key
        {
            account: "new",
            method: "google",
            "x-match": "all" // <-- all mean match "and",
            // "x-match": "any" <-- any mean match "or"
        }
    )
    channel.consume(q.queue, msg => {
        if (!msg?.content) {
            console.log("null message");
            return;
        }
        const content = msg?.content.toString();
        const timeConsumed = (2 + 5 * Math.random()) * 1000;
        setTimeout(() => {
            console.log(`[${q.queue}] Get header: ${JSON.stringify(msg.properties.headers)}`);
            console.log(`[${q.queue}] Finished ${content} in ${Math.floor(timeConsumed) / 1000}s`);
            console.log("---")
            channel.ack(msg);
        }, timeConsumed)
    },
        { noAck: false }
    );
}

receiveTask()