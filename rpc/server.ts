import amqplib from "amqplib";
const EXCHANGE_NAME = "task_RPC";
const RPC_QUEUE_NAME = "rpc_queue";

function fibonacci(n: number): number {
    if (n == 0 || n == 1) {
        return n;
    } else {
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}

const NUM_OF_CONCURRENT_TASK = 100;

const processTask = async () => {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
    await channel.assertQueue(RPC_QUEUE_NAME, { durable: false });
    channel.bindQueue(RPC_QUEUE_NAME, EXCHANGE_NAME, "llm")
    channel.prefetch(NUM_OF_CONCURRENT_TASK);
    channel.consume(
        RPC_QUEUE_NAME,
        msg => {
            if (!msg) {
                return;
            }
            const message = msg?.content?.toString() || "";
            // do something...
            channel.sendToQueue(
                msg?.properties.replyTo,
                Buffer.from(fibNum.toString()),
                { correlationId: msg?.properties.correlationId }
            );
            channel.ack(msg);
        },
        { noAck: false }
    )


}


processTask();
