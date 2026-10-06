import type { IMessageBroker } from "./message-broker.interface";
export interface RabbitMQConfig {
    url: string;
    reconnectInitialMs?: number;
}
/**
 * Producer-side wrapper built on amqp-connection-manager. The library handles
 * auto-reconnect, channel re-creation, and buffering publishes while
 * disconnected. Confirm channel → publish() waits for the broker ACK.
 */
export declare class RabbitMQClient implements IMessageBroker {
    private readonly config;
    private connection;
    private channel;
    constructor(config: RabbitMQConfig);
    connect(): Promise<void>;
    close(): Promise<void>;
    declareExchange(exchange: string): Promise<void>;
    publishConfirmed(exchange: string, routingKey: string, body: Buffer): Promise<void>;
}
