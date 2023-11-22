import amqplib from "amqplib";

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
    await channel.assertQueue(RPC_QUEUE_NAME, { durable: false });
    channel.prefetch(NUM_OF_CONCURRENT_TASK);
    channel.consume(
        RPC_QUEUE_NAME,
        msg => {
            if (!msg) {
                return;
            }
            const n = parseInt(msg?.content?.toString() || "0");
            console.log(`Start to calculate fibonacci[${n}]`)
            const fibNum = fibonacci(n);
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
