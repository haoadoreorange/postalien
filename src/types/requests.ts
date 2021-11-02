export type Request = {
    body?: Record<string, unknown>;
    prequest?: () => Promise<unknown>;
    request: (prequest_result?: unknown) => Promise<unknown>;
    postquest?: (request_result?: unknown) => Promise<unknown>;
    quiet?: boolean;
};

export function isRequest(o: Record<string, unknown> | Request): o is Request {
    return typeof (o as Request).request == `function`;
}

export type Requests = {
    body?: never;
    prequest?: never;
    request?: never;
    postquest?: never;
    quiet?: never;
} & { [key: string]: Requests | Request };
