export interface IUser {
    user: User;
    chains: Chain[];
}

export interface Chain {
    id_chain: number;
    name: string;
    locations: Location[];
}

export interface Location {
    id_location: number;
    name: string;
    code: string;
    chain_id: number;
    roles: Role[];
}

export interface Role {
    id_role: number;
    name: string;
    description: string;
    application_id: number;
    application: Application;
    permissions: Permission[];
}

export interface Application {
    id_application: number;
    name: string;
}

export interface Permission {
    id_permission: number;
    name: string;
    description: string;
    restriction_key: string;
}

export interface User {
    username: string;
    email: string;
    id_user: number;
    dni: string;
    name: string;
    phone: null;
    position: string;
    department: string;
    avatar?: string;
    status?: string;
}

