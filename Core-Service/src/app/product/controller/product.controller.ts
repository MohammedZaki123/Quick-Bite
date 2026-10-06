import {ProductService} from "../service/product.service";
import {validateBody, validatePathParameter} from "../../../lib/validation/validate";
import {NextFunction, Request, Response} from "express";
import {SystemRole} from "../../user/enums";
import {CreateProductDTO, UpdateProductDTO} from "../dto/product.dto";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {sendSuccess, sendPaginated} from "../../../lib/http/response";
import {parseFilterQuery, parsePaginationQuery} from "../../../lib/http/pagination/parse-query";
import {PaginationParams} from "../../../lib/http/pagination/cursor-pagination";
import {InvalidReserveItemsError, MissingProductIdsQueryError} from "../errors";

@injectable()
export class ProductController {
    constructor(@inject(TOKENS.ProductService) private readonly productService: ProductService) {
    }

    findCategories = async (req: Request , res: Response, next: NextFunction) => {
        try{
            const restaurantId = validatePathParameter(req.params.restaurantId, "Restaurant ID");
            // const params: PaginationParams = parsePaginationQuery(req.query, ['id','name']);
            // const filters = parseFilterQuery(req.query, ['id', 'name']);
            const result = await this.productService.findCategories(restaurantId);
            sendPaginated(res, result.data, result.meta);
        }catch(err){
            next(err);
        }
    }

    findByRestaurant = async (req: Request , res: Response, next: NextFunction) => {
        try{
            const restaurantId = validatePathParameter(req.params.restaurantId, "Restaurant ID");
            // const params: PaginationParams = parsePaginationQuery(req.query);
            // const filters = parseFilterQuery(req.query, ['id', 'name', 'category_id']);
            const result = await this.productService.findByRestaurant(restaurantId, req.user?.role as SystemRole, req.user?.userId!);
            sendPaginated(res, result.data, result.meta);
        }catch(err){
            next(err);
        }
    }

    findByBranch = async (req: Request , res: Response, next: NextFunction) => {
        try{
            const branchId = validatePathParameter(req.params.branchId, "Branch ID");
            // const params: PaginationParams = parsePaginationQuery(req.query, ['description','price','stock']);
            // const filters = parseFilterQuery(req.query, ['id', 'name', 'category_id']);
            // const result = await this.productService.findByBranch(branchId, params, filters);
            const result = await this.productService.findByBranch(branchId);
            // sendPaginated(res, result.data, result.meta);
            sendSuccess(res, result);
        }catch(err){
            next(err);
        }
    }
    findById = async (req: Request , res: Response, next: NextFunction) => {
        try{
            const productId = validatePathParameter(req.params.id, "Product ID");
            const result = await this.productService.findById(productId);
            sendSuccess(res, result);
        }catch(err){
            next(err);
        }
    }

    create = async (req: Request , res: Response, next: NextFunction) => {
        try{
            const restaurantId = validatePathParameter(req.params.restaurantId, "Restaurant ID");
            const validatedData = await validateBody(CreateProductDTO, req.body);
            const result = await this.productService.create(restaurantId,req.user?.role as SystemRole, req.user?.userId!, validatedData)
            sendSuccess(res, {
                product: result
            }, 201);
        }catch(err){
            next(err);
        }
    }
    update = async (req: Request , res: Response, next: NextFunction) => {
        try{
            const productId = validatePathParameter(req.params.id, "Product ID");
            const validatedData = await validateBody(UpdateProductDTO,req.body);
            const branchId:number | undefined = req.query.branchId? Number(req.query.branchId): undefined;
            const result = await this.productService.update( productId, validatedData, req.user?.role as SystemRole, req.user?.userId!, branchId);
            sendSuccess(res, {message : "Product Updated Successfully", ...result});
        }catch(err){
            next(err);
        }
    }

    findByBranchAndIds = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.id);
            const raw = typeof req.query.ids === "string" ? req.query.ids : "";
            const ids = raw.split(",").map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0);
            if (ids.length === 0) throw MissingProductIdsQueryError;
            const products = await this.productService.findByBranchAndIds(branchId, ids);
            sendSuccess(res, products);
        } catch (err) {
            next(err);
        }
    }

    reserveStock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.id);
            const items = req.body?.items;
            if (!Array.isArray(items) || items.length === 0) {
                throw InvalidReserveItemsError;
            }
            const result = await this.productService.reserveStock(branchId, items);
            sendSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }
    undoReserveStock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.id);
            const items = req.body?.items;
            if (!Array.isArray(items) || items.length === 0) {
                throw InvalidReserveItemsError;
            }
            await this.productService.undoReserveStock(branchId, items);
            sendSuccess(res, null);
        } catch (err) {
            next(err);
        }
    }
}

