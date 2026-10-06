import {toMs} from "../../../pkg/utils/time";
import {getPermissionsByRoleName} from "../repository/permission.repo";

export class PermissionCacheService {
    private cache:Map<string, {permissions:String[], cachedAt:number}> = new Map();
    private readonly TTL = toMs(1,'h');

    getPermissions = async (role: string) => {
    //     check if input role name exist as a key in the cache
    //     if it exists And cachedAt of key is more than or equal new Date() return the permissions object of it
    //     if not:
    //     call rbac repository layer function getPermissionsByRoleName storing role name as a key with returned
    //     result in permissions object  return permissions array of strings and
        let res;
        const cached = this.cache.get(role);
        if(cached && cached.cachedAt + this.TTL >= Date.now()){
            res = cached.permissions;
        }else{
            res = await getPermissionsByRoleName(role)
            this.cache.set(role, {permissions: res,cachedAt: Date.now()})
        }
        return res;

    }

    hasPermission = (permissions: String[], resource: string, action: string)=> {
        return permissions.includes(`${resource}:${action}`);
    }

}
export const permissionCacheService = new PermissionCacheService()