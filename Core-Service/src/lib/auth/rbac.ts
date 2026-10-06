// This is the generic RBAC (Role-Based Access Control) implementation.
// It can be used to check if a user has the necessary permissions to access a resource or perform an action.
// The RBACOptions interface defines the structure of the options that can be passed to the rbac function, which checks if the user has the required permissions based on the resource and action specified.
// The requireRestaurantMember and requireBranchMember functions can be used to check if a user is a member of a specific restaurant or branch, respectively.

import {NextFunction, Request, Response} from "express";

import {validatePathParameter} from "../validation/validate";
import {SystemRole} from "../../app/user/enums";
import {NotAuthorized} from "./errors";
import {permissionCacheService} from "../../app/rbac/service/permission-cache.service";

export interface RBACOptions {
    resource: string;
    action: string;
    allowSystemAdmin?: boolean; // by default will be true
}
export function rbac (option: RBACOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // THIS IS A BIG ONE
        // There is a trade-off between storing permissions(resource,action) of member inside JWT Payload,
        // The other approach is retrieving from member permission from the Database.
        // Both approach are not sufficient at scale for different reasons
        // The first one's reason is holding too much information in payload and if role permission increased over time, the payload will increase more bytes to be stored in request, increasing latency over time
        // The second one's reason is the cost of DB call especially during peak, where for every request you have to JOIN tables in order to get permissions of required role name
        // We have chosen a mediator approach. A way to save more space in payload while avoid DB call for every request
        // Storing every role and permission used before within an hour in the cache hashmap where role name is the key and permission array act as the value

        // TODO:
        //   checking option allowSystemAdmin is true and user System role is System Admin
        //   if yes, call next layer
        //   if not:
        //    check that user is a restaurant user
        //    if yes
        //    get permissions of member restaurant role by calling getPermissions from rbac service layer
        //    call hasPermission function of one of RBAC service layer
        //     if result of function returns false thrown an exception,
        //     if it returns true call next layer
        //    if not a res user
        //     throw an error
        //   Keep in mind that all the operations of this function will be conducted inside a try/catch in order to catch any exception from DB calls
        try {
            
            const {resource, action, allowSystemAdmin = true} = option;

            if (req.user?.role == SystemRole.SYSTEM_ADMIN) {
                if (allowSystemAdmin) {
                    return next();
                }
                return res.status(403).json({
                    error: "Permission denied",
                })
            }
            if (req.user?.role == SystemRole.RESTAURANT_USER) {
                const permissions = await permissionCacheService.getPermissions(req.user?.restaurantRole!);
                const permissionExist = permissionCacheService.hasPermission(permissions, resource, action)
                if (!permissionExist) {
                    return res.status(403).json({
                        error: "Permission denied",
                    })
                }
                return next();
            }
            // if not restaurant ser -> throw err
            return res.status(403).json({
                error: "Permission denied",
            })
        } catch (err) {
            next(err);
        }

    }
}
export function requireRestaurantMember(paramName: string= 'restaurantId') {

    return async (req: Request, res: Response, next: NextFunction) => {
        // check if member restaurant ID is the same as the restaurant ID in the request params
        // if user role is system_admin, then call next middleware layer
        // else
        // extract restaurant ID from request interface
        // compare user two IDs together
        // If they are not equal, throw Not Auth    orized error
        //   if yes call next middleware layer

        const restaurantId = validatePathParameter(req.params[paramName], "Restaurant ID");
        if (req.user?.role == SystemRole.SYSTEM_ADMIN) {
            return next();
        }
       
        if (Number(req.user?.restaurantId) !== Number(restaurantId)) {
            return res.status(403).json({
                error: "Permission denied",
            })
        }
        next();
    }
}
// export function requireBranchMember(param: string = 'branchId') {
//     // TODO: This layer will fail if an owner has requested the endpoint because has an access to all branches so no need to add branches to his JWT payload
//     return async(req: Request, res: Response, next: NextFunction) => {
//     //  extract member id from req and validate it
//     //  if user system role is system_admin go to the next layer
//     //  if user branchIds does not include request branch ID then respond with Permission denied
//     //  if not call next layer
//         const branchId = validatePathParameter(param, "Branch ID");
//         if(req.user?.role == SystemRole.SYSTEM_ADMIN || req.user?.restaurantRole == "owner"){
//             return next();
//         }
//         if(!req.user?.branchIds?.includes(branchId)){
//             return res.status(403).json({
//                 error: "Permission denied",
//             })
//         }
//         next();
//     }
// }

export function requireBranchAccess(paramName: string = 'branchId') {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // System admins and owners bypass
            if (req.user?.role == SystemRole.SYSTEM_ADMIN || req.user?.restaurantRole == "owner") {
                return next();
            }

            // Extract branchId from params or query string
            const branchId = req.params[paramName] || req.query[paramName];

            if (!branchId) {
                return res.status(400).json({
                    error: "Branch ID is required",
                });
            }


            // Check if the branch is in the user's branchIds
            if (!req.user?.branchIds?.includes(Number(branchId))) {
                return res.status(403).json({
                    error: "You do not have access to this branch",
                });
            }

            next();
        } catch (err) {
            next(err);
        }
    }
}