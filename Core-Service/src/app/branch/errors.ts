import {AppError} from "../../lib/error/AppError";

export const BranchNotFound = new AppError('Branch ID not found', 404);


export const BranchAccessNotPermitted = new AppError('Branch Access Denied', 403);

export const EmptyInputData = new AppError('At least one field must be provided for update', 400);

