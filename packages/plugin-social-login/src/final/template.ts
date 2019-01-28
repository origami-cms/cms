export const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Origami Social Login</title>
</head>
<body>
  <script>
    window.localStorage.setItem(
      'token',
      window.location.search.slice('?token='.length)
    )
    window.close();
  </script>
</body>
</html>`;
