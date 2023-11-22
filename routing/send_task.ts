import amqplib from "amqplib";

const EXCHANGE_NAME = "tasks";
const ROUTING_KEY = "task_queue";


const sendTasks = async () => {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

    const sendLog = async (msg: string) => {
        channel.publish(
            EXCHANGE_NAME,
            ROUTING_KEY,                 // routingKey
            Buffer.from(msg),
            { persistent: true }
        );

        console.log("sent:", msg);

    }
    for (let i = 0; i < 200; i++) {
        const msg = `Message ${i}`;
        sendLog(msg);
    }

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 1000)
}


sendTasks();
