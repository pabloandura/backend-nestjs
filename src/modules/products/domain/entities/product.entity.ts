export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly sku: string,
    public readonly price: number,
    public readonly imageUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
