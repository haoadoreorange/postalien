// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
require(`../dist/index`).postwoman({
    collection: {
        folder1: {
            request1: {
                request: () => Promise.resolve(),
            },
        },
        folder2: {
            request1: {
                request: () => Promise.resolve(),
            },
        },
    },
});
