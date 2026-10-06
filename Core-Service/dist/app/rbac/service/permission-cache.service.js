"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionCacheService = exports.PermissionCacheService = void 0;
const time_1 = require("../../../pkg/utils/time");
const permission_repo_1 = require("../repository/permission.repo");
class PermissionCacheService {
    cache = new Map();
    TTL = (0, time_1.toMs)(1, 'h');
    getPermissions = async (role) => {
        //     check if input role name exist as a key in the cache
        //     if it exists And cachedAt of key is more than or equal new Date() return the permissions object of it
        //     if not:
        //     call rbac repository layer function getPermissionsByRoleName storing role name as a key with returned
        //     result in permissions object  return permissions array of strings and
        let res;
        const cached = this.cache.get(role);
        if (cached && cached.cachedAt + this.TTL >= Date.now()) {
            res = cached.permissions;
        }
        else {
            res = await (0, permission_repo_1.getPermissionsByRoleName)(role);
            this.cache.set(role, { permissions: res, cachedAt: Date.now() });
        }
        return res;
    };
    hasPermission = (permissions, resource, action) => {
        return permissions.includes(`${resource}:${action}`);
    };
}
exports.PermissionCacheService = PermissionCacheService;
exports.permissionCacheService = new PermissionCacheService();
