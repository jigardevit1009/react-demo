import amqp from "amqplib";

class RabbitMQConfig {
    private connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private isConnecting: boolean = false;

    async connect(): Promise<amqp.Channel> {
        if (this.channel) return this.channel;

        if (this.isConnecting) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return this.connect();
        }

        this.isConnecting = true;
        const url = process.env.RABBITMQ_URL || "amqp://localhost:5672";

        try {
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();
            this.isConnecting = false;

            console.log("[RabbitMQ] Connected successfully!");

            this.connection.on("close", () => {
                console.warn("[RabbitMQ] Connection closed. Reconnecting in 5s...");
                this.channel = null;
                this.connection = null;
                setTimeout(() => this.connect(), 5000);
            });

            this.connection.on("error", (err) => {
                console.error("[RabbitMQ] Connection error:", err.message);
            });

            return this.channel;
        } catch (error: any) {
            this.isConnecting = false;
            console.warn(`[RabbitMQ] Unable to connect to RabbitMQ broker (${error.message}). Will retry...`);
            throw error;
        }
    }

    // Publish message to a durable queue
    async publishToQueue(queueName: string, data: any): Promise<boolean> {
        const channel = await this.connect();
        await channel.assertQueue(queueName, { durable: true });

        const messageBuffer = Buffer.from(JSON.stringify(data));
        return channel.sendToQueue(queueName, messageBuffer, { persistent: true });
    }

    // Consume messages from a queue
    async consumeQueue(
        queueName: string,
        onMessage: (data: any, ack: () => void, nack: () => void) => Promise<void>
    ) {
        const channel = await this.connect();
        await channel.assertQueue(queueName, { durable: true });
        channel.prefetch(1); // Process 1 job at a time

        console.log(`[RabbitMQ] Consumer listening on queue: "${queueName}"`);

        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    await onMessage(
                        content,
                        () => channel.ack(msg),
                        () => channel.nack(msg, false, true)
                    );
                } catch (err) {
                    console.error(`[RabbitMQ] Error processing message from "${queueName}":`, err);
                    channel.nack(msg, false, false); // Reject and drop malformed message
                }
            }
        });
    }
}

export const rabbitMQ = new RabbitMQConfig();
export default rabbitMQ;
