const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

http.createServer(function (req, res) {
    //run server and serve all files
    const parsedUrl = url.parse(req.url);
    let pathname = "." + parsedUrl.pathname;

    if (pathname === './') {
        pathname = './index.html';
    }

    if (pathname.endsWith('html')) res.writeHead(200, { 'Content-Type': "text/html" });
    else if (pathname.endsWith('css')) res.writeHead(200, { 'Content-Type': "text/css" });
    else if (pathname.endsWith('js')) res.writeHead(200, { 'Content-Type': "application/js" });
    else if (pathname.endsWith('ttf')) res.writeHead(200, { 'Content-Type': "font/ttf" });
    const filePath = path.join(__dirname, pathname);
    const file = fs.readFileSync(filePath);
    res.end(file);

    //get request & data
    if (req.method === 'POST' && req.url === '.process') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                const obj = JSON.parse(body);
                const input = obj.input;
                //api response
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ response }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(8080, () => {
    console.log('Server listening at http://localhost:8080');
});