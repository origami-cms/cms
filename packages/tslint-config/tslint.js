module.exports = {
  "extends": [
    "tslint:latest",
    "tslint-config-prettier",
    "tslint-microsoft-contrib",
    "tslint-eslint-rules"
  ],
  "rules": {
    // "indent": [true, 'spaces', 2],
    "ter-indent": {
      "severity": "none",
      "options": [true, 2]
    },
    "curly": [true, "ignore-same-line"],
    "object-curly-spacing": [false, "never"],
    "import-name": false,
    "trailing-comma": [true, "never"],
    "arrow-parens": [true, "as-needed"],
    "variable-name": [true, "allow-leading-underscore"],
    "object-shorthand-properties-first": false,
    "no-magic-numbers": [
      true, -1, 0, 1, 2, 3, 10, 60, 100, 1000
    ],
    "typedef-whitespace": [
      true,
      {
        "call-signature": "nospace",
        "index-signature": "nospace",
        "parameter": "nospace",
        "property-declaration": "nospace",
        "variable-declaration": "nospace"
      },
      {
        "call-signature": "onespace",
        "index-signature": "onespace",
        "parameter": "onespace",
        "property-declaration": "onespace",
        "variable-declaration": "onespace"
      }
    ],
    "prefer-template": [true, "never"],
    "max-line-length": {
      "severity": "warning",
      "options": [100]
    },
    "align": false,
    "function-name": [
      true,
      {
        'protected-method-regex': /^_?[a-z$][\w\d]+$/,
        "private-method-regex": /^_[a-z$][\w\d]+$/
      }
    ],
    "no-else-after-return": false,
    "no-consecutive-blank-lines": [true, 2],
    "radix": ["error", "as-needed"],

    // Microsoft contrib overrides
    "missing-jsdoc": false,
    "no-relative-imports": false,
    "no-suspicious-comment": false,
    "non-literal-require": {
      "severity": "warning"
    },
    "interface-name": [true, "never-prefix"],
    "underscore-consistent-invocation": [true, { "style": "static" }],
    "max-func-body-length": false,
    "mocha-no-side-effect-code": false,


    "no-any": false,
    "typedef": {
      "severity": "warning"
    },
    "no-backbone-get-set-outside-model": false,
    "no-non-null-assertion": false,
    "prefer-type-cast": false,
    "newline-before-return": false,
    "no-object-literal-type-assertion": false,
    "no-reserved-keywords": false,
    "no-empty": false,
    "no-unsafe-any": {
      "severity": "warning"
    },
    "strict-boolean-expressions": false,
    "no-use-before-declare": false,
    "no-parameter-properties": false,
    "switch-default": false,
    "completed-docs": false,
    "no-void-expression": [true, "ignore-arrow-function-shorthand"],
    "max-classes-per-file": [true, 20],
    "import-spacing": {
      "severity": "warning"
    },
    "no-implicit-dependencies": [
      true,
      [
        "jest-extended"
      ]
    ],
    "no-import-side-effect": [
      true,
      {
        "ignore-module": "(jest)"
      }
    ]
  },
}
