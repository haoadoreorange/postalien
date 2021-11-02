declare type Variable = {
    [key: string | number | symbol]: Variable;
} | {
    [key: string | number | symbol]: Variable;
}[] | number | number[] | string | string[];
export declare const getVar: (key: string) => Variable;
export declare const setVar: (key: string, value: unknown) => void;
export {};
