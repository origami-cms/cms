# Origami Default Pages plugin

This plugin provides fallbacks for default pages such as 404, 500, /index, etc.
It also provides some common styling static resources used across the site like
`base.css`, `logo.svg`, `waves.svg`, etc.

**This is a default plugin in Origami**

## Installation
`yarn add origami-plugin-default-pages`

## Configuration
In your `.origami` file, add this to your `plugins`:


```JSON
{
    ...
    "plugins": {
        "default-pages": true
    }
    ...
}
```
