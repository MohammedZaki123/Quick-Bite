import { ProductService } from "../service/product.service";
import { NextFunction, Request, Response } from "express";
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    findCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findByRestaurant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findByBranch: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findByBranchAndIds: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    reserveStock: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    undoReserveStock: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
