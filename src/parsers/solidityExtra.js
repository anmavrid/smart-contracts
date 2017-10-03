define(['./solidity'], function (solidity) {

    /**
     * This function checks if the given input is a single function. In addition
     * it can check if the function defines the necessary type of return value as well
     * as checking if it is defined in the right scope
     * @param input
     * @param expectedReturnType
     * @param expectedScope
     * @return Null if everything checked out an error-like object otherwise.
     *
     * @example
     * {
     *  message: "Not a single function."
     *  line: 2
     * }
     */
    function checkForSingleFunction(input, expectedReturnType, expectedScope, lineOffset) {
        var parseText = "public class JustForParsing {\n" + input + "\n}",
            parseResult,
            scopeFound = false,
            i,
            methodInfo;

        try {
            parseResult = solidity.parse(parseText);

            if (parseResult.types.length !== 1) {
                return {
                    message: 'There should be a single function definition.',
                    line: lineOffset || 0
                };
            } else if (parseResult.types[0].bodyDeclarations.length !== 1) {
                return {
                    message: 'Expecting a single function definition.',
                    line: lineOffset || 0
                };
            } else {
                methodInfo = parseResult.types[0].bodyDeclarations[0];

                if (methodInfo.node !== 'MethodDeclaration') {
                    return {
                        message: 'Only method declaration allowed.',
                        line: lineOffset || 0
                    };
                }

                if (methodInfo.constructor !== false) {
                    return {
                        message: 'No constructor declaration allowed.',
                        line: lineOffset || 0
                    };
                }

                if (methodInfo.node !== 'MethodDeclaration') {
                    return {
                        message: 'Only method declaration allowed.',
                        line: lineOffset || 0
                    };
                }

                if (expectedReturnType && methodInfo.returnType2.primitiveTypeCode !== expectedReturnType) {
                    return {
                        message: 'The function should return \'' + expectedReturnType + '\'.',
                        line: lineOffset || 0
                    };
                }

                if (expectedScope) {
                    for (i = 0; i < methodInfo.modifiers.length; i += 1) {
                        if (methodInfo.modifiers[i].keyword === expectedScope) {
                            scopeFound = true;
                            break;
                        }
                    }
                    if (scopeFound === false) {
                        return {
                            message: 'The function should be in \'' + expectedScope + '\' scope.',
                            line: lineOffset || 0
                        };
                    }
                }
            }
            return null;
        } catch (e) {
            /* TODO it is not too sophisticated but the solidity parser tends to point to the closing '}'
               as the source of the erro which does not give too much information.
             */

            return {
                message: 'The syntax of the function is not correct.',
                line: lineOffset || 0
            };
        }
    }

    function checkWholeFile(input) {
        var parseResult;

        try {
            parseResult = solidity.parse(input);
            return null;
        } catch (e) {
            return {message: e.message, line: e.location.start.line};
        }
    }

    return {
        checkForSingleFunction: checkForSingleFunction,
        checkWholeFile: checkWholeFile
    }
});
