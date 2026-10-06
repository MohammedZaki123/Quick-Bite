export declare class Role {
    id: number;
    name: string;
    displayName: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: Partial<Role>);
}
