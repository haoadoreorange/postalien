"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postwoman = void 0;
require("./lib/polyfill");
const requests_1 = require("./types/requests");
const varnager_1 = require("./lib/varnager");
const inquirer_1 = __importDefault(require("inquirer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ensureDirectoryExistence = (file_path) => {
    const dirname = path_1.default.dirname(file_path);
    if (fs_1.default.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs_1.default.mkdirSync(dirname);
};
const extractRequests = (() => {
    let level = -1;
    const indent = (str, c = ` `) => {
        if (level === 0)
            return str;
        return c.repeat(level * 2 + 1) + ` ` + str;
    };
    const choices = [];
    const requests = {};
    return function f(r, p = ``) {
        for (const key in r) {
            const sub_p = p + `/` + key.replaceAll(` `, `-`);
            const tmp = r[key];
            if ((0, requests_1.isRequest)(tmp)) {
                requests[sub_p] = tmp;
                choices.push({ name: indent(key), value: sub_p });
            }
            else {
                level++;
                choices.push(new inquirer_1.default.Separator(indent(key, `=`)));
                f(tmp, sub_p);
                level--;
            }
        }
        return { choices, requests };
    };
})();
const prompt = (rqs) => {
    const prompt_name = `request`;
    const { choices, requests } = extractRequests(rqs);
    const p = {
        type: `list`,
        name: prompt_name,
        message: `Which request to make ?`,
        choices,
    };
    const injectVariables = (body) => {
        let str = JSON.stringify(body);
        const matched = new Set();
        // TODO: match 2 regex in 1 pass
        for (const match of [...str.matchAll(/"{{(.*?)}}"/g)]) {
            if (!matched.has(match[0])) {
                matched.add(match[0]);
                str = str.replaceAll(match[0], JSON.stringify((0, varnager_1.getVar)(match[1])));
            }
        }
        matched.clear();
        for (const match of [...str.matchAll(/{{(.*?)}}/g)]) {
            if (!matched.has(match[0])) {
                matched.add(match[0]);
                const variable = (0, varnager_1.getVar)(match[1]);
                str = str.replaceAll(match[0], typeof variable === `string` ? variable : JSON.stringify(variable).replaceAll(`"`, `\\"`));
            }
        }
        return JSON.parse(str);
    };
    return function f() {
        inquirer_1.default
            .prompt([p])
            .then(async (answers) => {
            const request = requests[answers[prompt_name]];
            if (request.body) {
                request.body = injectVariables(request.body);
            }
            const result = await request.request(request.prequest ? await request.prequest() : null);
            const stringified = JSON.stringify(result, null, 4);
            if (!request.quiet) {
                console.log(`Result of query ${answers[prompt_name]}`);
                console.log(stringified);
            }
            if (request.postquest)
                await request.postquest(result);
            const file_path = `results` + answers[prompt_name] + `.json`;
            ensureDirectoryExistence(file_path);
            fs_1.default.writeFileSync(file_path, stringified);
        })
            .catch((e) => {
            console.error(e);
        })
            .finally(() => f());
    };
};
const postwoman = (rqs) => prompt(rqs)();
exports.postwoman = postwoman;
__exportStar(require("./lib/varnager"), exports);

//# sourceMappingURL=index.js.map
