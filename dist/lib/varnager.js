"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setVar = exports.getVar = void 0;
const fs_1 = __importDefault(require("fs"));
let db;
try {
    db = JSON.parse(fs_1.default.readFileSync(`db.json`, `utf8`));
    if (!db.variables)
        db = { ...db, variables: {} };
}
catch (e) {
    if (e.code === `ENOENT`) {
        db = { variables: {} };
    }
    else {
        throw e;
    }
}
const getVar = (key) => {
    if (db.variables[key])
        return db.variables[key];
    throw new Error(`Variable '${key}' does not exist`);
};
exports.getVar = getVar;
const setVar = (key, value) => {
    db.variables[key] = value;
    fs_1.default.writeFileSync(`db.json`, JSON.stringify(db, null, 4));
};
exports.setVar = setVar;

//# sourceMappingURL=varnager.js.map
