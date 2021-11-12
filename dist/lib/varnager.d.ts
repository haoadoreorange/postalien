declare type Variable = {
    [key: string | number]: Variable;
} | {
    [key: string | number]: Variable;
}[] | number | number[] | bigint | bigint[] | string | string[];
export declare const getVar: (key: string) => Variable;
export declare const setVar: (key: string, value: unknown) => void;
export {};
