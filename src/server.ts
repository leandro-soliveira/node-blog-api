import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const server = express();

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static('public'));

server.get('/api/ping', (request, response) => {
    response.json({ ping: true })
});

server.listen(4444, () => {
    console.log('B7Blog backend porta http://localhost:4444')
})