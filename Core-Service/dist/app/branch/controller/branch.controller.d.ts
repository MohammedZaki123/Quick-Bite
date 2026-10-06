import { BranchService } from "../service/branch.service";
import { NextFunction, Request, Response } from "express";
export declare class BranchController {
    private readonly branchService;
    constructor(branchService: BranchService);
    addBranch: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNearbyBranches: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findByRestaurant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    patchBranch: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    patchBranchStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findByIdWithRestaurant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findByIdsWithRestaurant: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
}
