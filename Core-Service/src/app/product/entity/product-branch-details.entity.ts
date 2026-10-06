export class ProductBranchDetails {
    id: number;
    productId: number;
    branchId: number;
    stock: number;
    isAvailable: boolean;
    price: number;

    constructor(data: Partial<ProductBranchDetails>) {
        this.id = data.id!;
        this.productId = data.productId!;
        this.branchId = data.branchId!;
        this.stock = data.stock!;
        this.isAvailable = data.isAvailable!;
        this.price = data.price!;
    }
}

