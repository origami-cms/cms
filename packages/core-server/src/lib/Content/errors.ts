import { OrigamiError } from '@origami/core-lib';

export class ErrorContentHasContent extends OrigamiError {
                      constructor() {
                      super(
            'Content',
            'HasContent',
            'Response already has content set'
        );
                    }
}

export class ErrorContentHasCode extends OrigamiError {
                      constructor() {
                      super(
            'Content',
            'HasCode',
            'Response already has response code set'
        );
                    }
}
