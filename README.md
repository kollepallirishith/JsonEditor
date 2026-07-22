# JsonEditor

A lightweight, deployable JSON editor built as a static web app. It lets you edit JSON, validate it, format or minify it, and inspect the document as a tree view.

## Features

- Edit JSON directly in the browser
- Format and minify JSON
- Validate JSON syntax in real time
- Preview the JSON structure as a tree
- Copy or download the current document

## Run locally

From the project folder, start a local server:

```bash
python -m http.server 3000
```

Then open http://127.0.0.1:3000/ in your browser. If you start the server from the parent directory of the project, use http://127.0.0.1:3000/JsonEditor/ instead.

## Deploy

Because the app is a static site, it can be deployed to:

- GitHub Pages
- Netlify
- Vercel
- Any static hosting provider

For GitHub Pages, publish the repository contents as the site root.

## Docker

Build the image:

```bash
docker build -t json-studio .
```

Run it locally:

```bash
docker run -d -p 8080:80 --name json-studio json-studio
```

Then open http://localhost:8080/.

To deploy it to a container host such as Render, Railway, Fly.io, Azure Container Apps, or a VPS, push the image to a registry and start the container there.

## Tests

Run the automated tests with:

```bash
npm test
```