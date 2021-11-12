import "lib/polyfill";
import { isRequest, Request, Requests } from "types/requests";
import { getVar } from "lib/varnager";
import inquirer from "inquirer";
import path from "path";
import fs from "fs";

const ensureDirectoryExistence = (file_path: string) => {
    const dirname = path.dirname(file_path);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
};

const extractRequests = (() => {
    let level = -1;
    const indent = (str: string, c = ` `) => {
        if (level === 0) return str;
        return c.repeat(level * 2 + 1) + ` ` + str;
    };

    const choices: unknown[] = [];
    const requests: { [key: string]: Request } = {};

    return function f(r: Requests, p = ``) {
        for (const key in r) {
            const sub_p = p + `/` + key.replaceAll(` `, `-`);
            const tmp = r[key];
            if (isRequest(tmp)) {
                requests[sub_p] = tmp;
                choices.push({ name: indent(key), value: sub_p });
            } else {
                level++;
                choices.push(new inquirer.Separator(indent(key, `=`)));
                f(tmp, sub_p);
                level--;
            }
        }
        return { choices, requests };
    };
})();

// only export in dev mode for testing purpose
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const injectVariables = (body: Record<string, unknown>) => {
    let str = JSON.stringify(body);
    const matched = new Set();
    // TODO: match 2 regex in 1 pass
    for (const match of [...str.matchAll(/"{{(.*?)}}"/g)]) {
        if (!matched.has(match[0])) {
            matched.add(match[0]);
            str = str.replaceAll(match[0], JSON.stringify(getVar(match[1])));
        }
    }
    matched.clear();
    for (const match of [...str.matchAll(/{{(.*?)}}/g)]) {
        if (!matched.has(match[0])) {
            matched.add(match[0]);
            const variable = getVar(match[1]);
            str = str.replaceAll(
                match[0],
                typeof variable === `string` ? variable : JSON.stringify(variable).replaceAll(`"`, `\\"`),
            );
        }
    }
    return JSON.parse(str) as Record<string, unknown>;
};

const prompt = (rqs: Requests) => {
    const prompt_name = `request`;
    const { choices, requests } = extractRequests(rqs);
    const p = {
        type: `list`,
        name: prompt_name,
        message: `Which request to make ?`,
        choices,
    };
    const raw_body: Record<string, Record<string | number, unknown>> = {};

    return function f() {
        inquirer
            .prompt([p])
            .then(async (answers: { [prompt_name]: string }) => {
                const request = requests[answers[prompt_name]];
                if (request.body) {
                    if (!raw_body[answers[prompt_name]])
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        raw_body[answers[prompt_name]] = JSON.parse(JSON.stringify(request.body));
                    request.body = injectVariables(raw_body[answers[prompt_name]]);
                }
                const result = await request.request(request.prequest ? await request.prequest() : null);
                const stringified = JSON.stringify(result, null, 4);
                if (!request.quiet) {
                    console.log(`Result of query ${answers[prompt_name]}`);
                    console.log(stringified);
                }
                if (request.postquest) await request.postquest(result);
                const file_path = `results` + answers[prompt_name] + `.json`;
                ensureDirectoryExistence(file_path);
                fs.writeFileSync(file_path, stringified);
            })
            .catch((e) => {
                console.error(e);
            })
            .finally(() => f());
    };
};

export const postwoman = (rqs: Requests): void => prompt(rqs)();
export { Requests } from "types/requests";
export * from "lib/varnager";

/* <DEV-ONLY> */
export { injectVariables };
/* </DEV-ONLY> */
