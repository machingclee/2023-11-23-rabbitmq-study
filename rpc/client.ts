import amqplib, { Replies } from "amqplib";
import { v4 as uuidv4 } from "uuid";

const EXCHANGE_NAME = "task_RPC";
const RPC_QUEUE_NAME = "rpc_queue";



const NUM_QUEUES = 100;

// const num = parseInt(process.argv[2]);
const uuid = uuidv4() as string;

export const requestTask = async () => {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    channel.prefetch(NUM_QUEUES);
    const q = await channel.assertQueue("", { exclusive: true });

    for (let i = 0; i < 200; i++) {
        const randomSmallNumber = Math.floor(40 * Math.random()) + 1;
        console.log(`[task-${uuid}] Sent a number ${randomSmallNumber} for calculation`)
        channel.sendToQueue(
            RPC_QUEUE_NAME,
            Buffer.from(randomSmallNumber.toString()),
            {
                replyTo: q.queue,
                correlationId: uuid,
                persistent: false
            }
        );
    }

    channel.consume(q.queue,
        msg => {
            if (msg?.properties?.correlationId === uuid) {
                console.log(`[task-${uuid}]`, msg.content.toString());
            }
        },
        { noAck: true }
    )

    // connection.close();
    // process.exit(0);
}

requestTask()