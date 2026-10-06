export declare class CreateProductDTO {
    name: string;
    description?: string;
    imageUrl?: string;
    categoryName?: string;
}
export declare class UpdateProductDTO {
    name?: string;
    description?: string;
    imageUrl?: string;
    categoryName?: string;
    price?: number;
    stock?: number;
    isAvailable?: boolean;
}
