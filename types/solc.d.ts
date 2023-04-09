declare module "solc" {
    function compile(input: StandardInput): StandardOutput;

    export = {
        compile: compile,
    };
}
