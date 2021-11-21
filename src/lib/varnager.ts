import fs from "fs";

type Variable =
    | { [key: string | number]: Variable }
    | { [key: string | number]: Variable }[]
    | number
    | number[]
    | bigint
    | bigint[]
    | string
    | string[];
type DB = {
    variables: {
        [key: string]: Variable;
    };
};
let db: DB;
try {
    db = JSON.parse(fs.readFileSync(`db.json`, `utf8`)) as DB;
    if (!db.variables) db = { ...db, variables: {} };
} catch (e) {
    if ((e as NodeJS.ErrnoException).code === `ENOENT`) {
        db = { variables: {} };
    } else {
        throw e;
    }
}

export const getVar = (key: string): Variable => {
    if (db.variables[key]) return db.variables[key];
    throw new Error(`Variable '${key}' does not exist`);
};

export const setVar = (key: string, value: unknown): void => {
    db.variables[key] = value as Variable;
    fs.writeFileSync(`db.json`, JSON.stringify(db, null, 4));
};
