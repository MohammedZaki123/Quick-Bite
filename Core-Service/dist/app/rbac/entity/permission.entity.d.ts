export declare class Permission {
    id: number;
    resource: string;
    action: string;
    createdAt: Date;
    constructor(data: Partial<Permission>);
}
