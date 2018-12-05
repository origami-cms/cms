/**
 * Wraps some data in a styled HTML page
 * @param title Title of the document
 * @param html Optional HTML as the body
 */
export const wrapHTML = (title: string, html?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${title}</title>
  <link rel="stylesheet" href="/origami/zen.css" />
  <style>
    html {
      padding: var(--size-small);
    }
    h1 {
      font-size: 3.6rem;
      margin-bottom: var(--size-main);
    }
  </style>
</head>
<body>
  <article class="card">
    <h1>${title}</h1>
    ${html || '<p>No content</p>'}
  </article>
</body>
</html>`;
