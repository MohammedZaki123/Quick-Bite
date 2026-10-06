export declare class ProductBranchDetails {
    id: number;
    productId: number;
    branchId: number;
    stock: number;
    isAvailable: boolean;
    price: number;
    constructor(data: Partial<ProductBranchDetails>);
}
