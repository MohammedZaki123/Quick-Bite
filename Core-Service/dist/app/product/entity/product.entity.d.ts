export declare class Product {
    id: number;
    restaurantId: number;
    categoryId: number | null;
    name: string;
    description: string;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    constructor(data: Partial<Product>);
}
