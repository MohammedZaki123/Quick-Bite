"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingProductIdsQueryError = exports.InvalidReserveItemsError = exports.ProductDoesNotExist = void 0;
exports.outOfStockError = outOfStockError;
const AppError_1 = require("../../lib/error/AppError");
exports.ProductDoesNotExist = new AppError_1.AppError('Branch Not Found', 404);
exports.InvalidReserveItemsError = new AppError_1.AppError('items must be a non-empty array of {productId, quantity}', 400);
exports.MissingProductIdsQueryError = new AppError_1.AppError('ids query is required', 400);
function outOfStockError(offending) {
    return new AppError_1.AppError(`OutOfStock: ${JSON.stringify(offending)}`, 409);
}
