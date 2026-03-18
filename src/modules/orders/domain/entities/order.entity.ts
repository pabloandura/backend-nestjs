export interface OrderLineItem {
  productId: string;
  name: string;
  sku: string;
  priceAtPurchase: number;
  quantity: number;
  lineTotal: number;
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly clientName: string,
    public readonly items: OrderLineItem[],
    public readonly total: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
