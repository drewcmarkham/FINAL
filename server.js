import http from 'http';
import url from 'url';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { OpenAI } from 'openai';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const server = http.createServer(function (req, res) {
    //run server and serve all files
    const parsedUrl = url.parse(req.url);
    let pathname = "." + parsedUrl.pathname;

    //get request & data
    if (req.method === 'POST' && req.url === '/process') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', async () => {
            try {
                const obj = JSON.parse(body);
                const input = obj.input;
                //api response
                const response = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        { role: "user", content: "Create a personalized daily planner based on the following details. Include time-blocked activities from morning to evening. Structure Create a personalized daily planner based on the following details. Format the output using plain text with line breaks between entries so that it can be displayed in HTML using <br> tags. Include time-blocked activities from morning to night, with suggested start times. Keep it organized and easy to scan. Details: " + input }
                    ]
                });
                const planner = response.choices[0].message.content;
                console.log(planner);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ planner }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    else {
        if (pathname === './') {
            pathname = './index.html';
        }

        if (pathname.endsWith('html')) res.writeHead(200, { 'Content-Type': "text/html" });
        else if (pathname.endsWith('css')) res.writeHead(200, { 'Content-Type': "text/css" });
        else if (pathname.endsWith('js')) res.writeHead(200, { 'Content-Type': "application/javascript" });
        else if (pathname.endsWith('ttf')) res.writeHead(200, { 'Content-Type': "font/ttf" });
        else if (pathname.endsWith('ico')) res.writeHead(200, { 'Content-Type': "image/x-icon" });

        try {
            const filePath = path.join(__dirname, pathname);
            const file = fs.readFileSync(filePath);
            res.end(file);
            return;
        } catch {

        }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(8080, () => {
    console.log('Server listening at http://localhost:8080');
});