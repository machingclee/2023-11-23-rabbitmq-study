import amqplib from "amqplib";

const EXCHANGE_NAME = "tasks_headers";


const sendTasks = async () => {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "headers", { durable: false });

    const sendLog = async (msg: string) => {
        channel.publish(
            EXCHANGE_NAME,
            "", // headers ignore routing key
            Buffer.from(msg),
            { headers: { account: "new", method: "google" } }
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
