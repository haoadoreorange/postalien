import { spawn } from "child_process";

describe(`Postwoman test suite`, () => {
    test(`injectVariables`, async () => {
        jest.mock(`lib/varnager`, () => ({
            setVar: () => {
                // empty
            },
            getVar: (var_name: string) => {
                switch (var_name) {
                    case `var1`:
                        return `value`;
                    case `var2`:
                        return [`value`];
                    case `var3`:
                        return { key: `value` };
                }
            },
        }));

        expect(
            (await import(`index`)).injectVariables({
                property1: `{{var1}}`,
                property11: `something {{var1}} in between`,
                property2: `{{var2}}`,
                property21: `something {{var2}} in between`,
                property3: `{{var3}}`,
                property31: `something {{var3}} in between`,
            }),
        ).toEqual({
            property1: `value`,
            property11: `something value in between`,
            property2: [`value`],
            property21: `something ["value"] in between`,
            property3: { key: `value` },
            property31: `something {"key":"value"} in between`,
        });
    });

    test(`cli output`, (done) => {
        const child = spawn(`node`, [`examples/bin.js`]);

        const chunks: Uint8Array[] = [];

        child.stdout.on(`data`, (chunk) => {
            chunks.push(chunk);
        });

        child.stdout.on(`end`, () => {
            const stdout = Buffer.concat(chunks).toString();
            expect(stdout).toMatchSnapshot();
            done();
        });

        setTimeout(() => child.kill(), 500);
    });
});
