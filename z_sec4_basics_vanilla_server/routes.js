const fs = require('fs');

const requestHandler = (req, res) => {
    const method = req.method;
    const url = req.url;

    if (url === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<html><body><form action="/message" method ="POST"><input type="text" name="mesage"><button type="submit">posli</button></form></body></html>');
        return res.end();
    }
    
    if (url === '/message' && method === 'POST') {
        /* pro odpovedi jsou streamovane */
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
           // console.log(chunk);
        });
    
        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            //console.log('parsedBody: ', parsedBody);
            const message = parsedBody.split('=')[1];
            fs.writeFile('message.txt', message, (err) => {
                res.statusCode = 302;
                res.setHeader('Location', '/');
                return res.end();
    
            });
        });
    }

    // res.setHeader('Content-Type', 'text/html');
    // res.write('<html><body>baf</body></html>');
    // return res.end();
}; 

module.exports = requestHandler;



