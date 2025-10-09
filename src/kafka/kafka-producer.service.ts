import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";
import {
  TokenPriceUpdateMessage,
  tokenPriceUpdateMessageSchema,
} from "../models/token-price-update-message";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class KafkaProducerService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly producer: Producer;
  private readonly topic: string = "token-price-updates";

  constructor(private configService: ConfigService) {
    const kafka = new Kafka({
      clientId: this.configService.get<string>("KAFKA_CLIENT_ID"),
      brokers: [this.configService.get<string>("KAFKA_BROKER")],
    });

    this.producer = kafka.producer();
    this.connect();
  }

  private async connect(): Promise<void> {
    await this.producer.connect();
    this.logger.log("Connected to Kafka");
  }

  async sendPriceUpdateMessage(
    message: TokenPriceUpdateMessage
  ): Promise<void> {
    try {
      // Validate the message with Zod schema
      tokenPriceUpdateMessageSchema.parse(message);

      const value = JSON.stringify(message);

      this.producer.send({
        topic: this.topic,
        messages: [
          {
            key: message.tokenId,
            value,
          },
        ],
      });

      this.logger.log(`Sent message to Kafka: ${value}`);
      return;
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.producer.disconnect();
      this.logger.log("Disconnected from Kafka");
    } catch (error) {
      this.logger.error("Error disconnecting from Kafka", error.stack);
    }
  }
}
