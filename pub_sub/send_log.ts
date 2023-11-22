import amqplib from "amqplib";

const EXCHANGE_NAME = "logs";
const msg = "hello world";

const sendLog = async () => {
    const connection = await amqplib.connect("amqp://localhost");

    // pipeline of messages into RabbitMQ
    // direct exchange by default
    const channel = await connection.createChannel();

    // create a queue with queuename if not exists
    // durable: false means it will be recreated if the service restart, true by default
    // fanout:
    //
    //      A
    //     /
    //    /
    //   /
    //  /
    //  ----- B
    //  \
    //   \
    //    \
    //     \ 
    //      C
    // 
    // A, B, C receive msg at the same time
    await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: true });
    channel.publish(EXCHANGE_NAME, "", Buffer.from(msg), { persistent: true });

    console.log("sent:", msg);
    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 1000)

}

sendLog();