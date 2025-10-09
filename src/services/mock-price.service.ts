import { Injectable } from "@nestjs/common";
import { Token } from "../models/token.entity";

@Injectable()
export class MockPriceService {
  // eslint-disable-next-line
  async getRandomPriceForToken(token: Token): Promise<number> {
    // Simulate API call delay
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, this.getRandomInt(50, 200));
    });

    const basePrice = this.getRandomInt(1, 100000);
    const randomFactor = Math.random() * 10;

    return basePrice * randomFactor;
  }

  private getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
