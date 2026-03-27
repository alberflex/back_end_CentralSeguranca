import { AsyncLocalStorage } from "node:async_hooks";

type User = {
    id: number;
    nome?: string;
    papel: string;
};

type Context = {
    user?: User;
};

export const requestContext = new AsyncLocalStorage<Context>();

export function getUser() {
    return requestContext.getStore()?.user;
}