import { OrigamiError } from '../OrigamiError';

export class ErrorRouteInvalidParent extends OrigamiError {
    constructor() {
        super(
            'Route',
            'InvalidParent',
            'Invalid parent. Should be of type Route'
        );
    }
}

export class ErrorRouteUnknownPosition extends OrigamiError {
    constructor(position: string) {
        super(
            'Route',
            'UnknownPosition',
            `Unknown position '${position}' for Route`
        );
    }
}

export class ErrorRouteInvalidMiddlewareType extends OrigamiError {
    constructor(type: string) {
        super(
            'Route',
            'InvalidMiddlewareType',
            `Invalid type of middleware '${type}' for Route`
        );
    }
}

export class ErrorRouteFileNotRoute extends OrigamiError {
    constructor(file: string) {
        super(
            'Route',
            'FileNotRoute',
            `File '${file}' does not export a Route`
        );
    }
}

export class ErrorRouteInvalidInclude extends OrigamiError {
    constructor(path: string) {
        super(
            'Route',
            'InvalidInclude',
            `Invalid include path '${path}'. Path is not file or directory`
        );
    }
}
