import { spawn } from "child_process";

describe(`Postwoman test suite`, () => {
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
