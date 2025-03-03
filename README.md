# Development

This extension project uses [WXT](https://wxt.dev/) with [React](https://react.dev/).

## Install

Download and install [Node.js](https://nodejs.org/en/download)

Then in the directory run:

```bash
npm i
```

To install all the required dependencies.

Also install [zxcvbn](https://github.com/dropbox/zxcvbn) password strength estimator in the same project directory:

```bash
npm install zxcvbn
```

If needed or in case library fails to load also run:

```bash
npm i --save-dev @types/zxcvbn
```

## Build

To build:

```bash
npm run build
```

The extension should be available in the generated .output folder.

## Develop

To develop in browser, with hot-reloading:

```bash
npm run dev
```

(more run scripts can be found in [package.json](package.json))