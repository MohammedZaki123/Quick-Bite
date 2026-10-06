import { AppError } from "../../lib/error/AppError";
export declare const ProductDoesNotExist: AppError;
export declare const InvalidReserveItemsError: AppError;
export declare const MissingProductIdsQueryError: AppError;
export declare function outOfStockError(offending: unknown): AppError;
