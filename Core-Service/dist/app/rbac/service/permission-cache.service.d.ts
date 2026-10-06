export declare class PermissionCacheService {
    private cache;
    private readonly TTL;
    getPermissions: (role: string) => Promise<String[]>;
    hasPermission: (permissions: String[], resource: string, action: string) => boolean;
}
export declare const permissionCacheService: PermissionCacheService;
