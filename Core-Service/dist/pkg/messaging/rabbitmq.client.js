"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQClient = void 0;
const amqp_connection_manager_1 = __importDefault(require("amqp-connection-manager"));
/**
 * Producer-side wrapper built on amqp-connection-manager. The library handles
 * auto-reconnect, channel re-creation, and buffering publishes while
 * disconnected. Confirm channel → publish() waits for the broker ACK.
 */
class RabbitMQClient {
    config;
    connection = null;
    channel = null;
    constructor(config) {
        this.config = config;
    }
    async connect() {
        if (this.connection)
            return;
        this.connection = amqp_connection_manager_1.default.connect([this.config.url], {
            reconnectTimeInSeconds: Math.max(1, Math.round((this.config.reconnectInitialMs ?? 500) / 1000)),
        });
        this.channel = this.connection.createChannel({ json: false });
        await this.channel.waitForConnect();
    }
    async close() {
        try {
            if (this.channel)
                await this.channel.close();
        }
        catch { }
        try {
            if (this.connection)
                await this.connection.close();
        }
        catch { }
        this.channel = null;
        this.connection = null;
    }
    async declareExchange(exchange) {
        if (!this.channel)
            await this.connect();
        await this.channel.addSetup((ch) => ch.assertExchange(exchange, "topic", { durable: true }));
    }
    async publishConfirmed(exchange, routingKey, body) {
        if (!this.channel)
            await this.connect();
        await this.channel.publish(exchange, routingKey, body, {
            persistent: true,
            contentType: "application/json",
        });
    }
}
exports.RabbitMQClient = RabbitMQClient;
