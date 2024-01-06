export const homePage = ({ heading }) => {
  
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="icon" type="image/x-icon" href="/logo.svg" />
    <title>Ckret Connect</title>
    <style type="text/css">
      body {
        margin: 0px;
        padding: 0px;
        height: 100vh;
        display: grid;
        place-items: center;
        font-family: 'Fredoka', Helvetica, Arial, sans-serif;
        background-color: #f0f0f0 !important;
        text-align: center;
        color: #111;
        font-size: 18px;
      }
      a,
      h1,
      p {
        font-family: 'Fredoka', Helvetica, Arial, sans-serif;
        color: #111;
      }
      a {
        text-decoration: none;
      }
      h1 {
        font-size: 32px;
        letter-spacing: 1px;
      }
      h2 {
        font-size: 30px;
        font-weight: 600;
      }
      p {
        font-size: 20px;
      }
      .container {
        margin: 25px;
        padding: 25px;
        max-width: 500px;
        text-align: center;
        background-color: #fff;
        border: 2px solid #000;
        border-radius: 10px;
      }
      .logo-wrapper {
        margin: 0 auto;
        width: fit-content;
        display: flex;
        justify-items: center;
        align-items: center;
        gap: 4px;
        user-select: none;
      }
      .logo {
        height: 60px;
        width: 60px;
        margin: auto auto;
      }
      .logo-text {
        margin: auto auto;
        font-size: 30px;
        font-weight: 700;
        letter-spacing: 0.05em;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <a class="logo-wrapper" href="${process.env.CKRET_URL}" target="_blank">
        <img src="${process.env.CKRET_LOGO_URL}" class="logo" />
        <h1 class="logo-text">Ckret.</h1>
      </a>

      <h2 style="margin-bottom: 0">${heading}</h2>
      <p style="margin-top: 0">
        Here, your words are masked to keep them secret.
      </p>
      <br />
      <p style="margin-bottom: 0">We know a fact for sure!</p>
      <p style="margin-top: 0">You are a Software Engineer.</p>
    </div>
  </body>
</html>
    `;
  return html;
};
