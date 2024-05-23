const express = require('express');
const rtspStream = require('node-rtsp-stream');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const staticDir = path.join(__dirname, 'public');

// Sử dụng middleware express.static để phục vụ các tệp tĩnh từ thư mục public
app.use(express.static(staticDir));

let stream;
const startStream = (ip_address, username, password, wsPort) => {
    if (stream) {
        stream.stop();
    }

    stream = new rtspStream({
        streamUrl: `rtsp://${username}:${password}@${ip_address}:554/cam/realmonitor?channel=1&subtype=0&unicast=true&proto=Onvif`,
        wsPort: wsPort,
    });

    console.log(`Streaming from ${ip_address} on ws://localhost:${wsPort}`);
};

const pauseStream = () => {
    if (stream) {
        stream.pause();
    }
};

const resumeStream = () => {
    if (stream) {
        stream.resume();
    }
};

// Initial stream (optional)
const initialCamera = {
    ip_address: process.env.CAMERA_IP_ADDRESS || "192.168.0.114",
    username: process.env.CAMERA_USERNAME || "admin",
    password: process.env.CAMERA_PASSWORD || "Quangloi0727",
};

if (initialCamera.ip_address) {
    startStream(initialCamera.ip_address, initialCamera.username, initialCamera.password, 9999);
}

// Endpoint to switch cameras
app.post('/api/switch-camera', (req, res) => {
    const { ip_address, username, password } = req.body;

    if (!ip_address || !username || !password) {
        return res.status(400).json({ error: 'Missing camera credentials' });
    }

    startStream(ip_address, username, password, 9999);
    res.json({ message: 'Camera switched successfully' });
});

app.get('/', (req, res) => {
    res.sendFile("/Users/loinq/Desktop/Steaming-IP-Camera-Nodejs/public/index.html");
});

// Route to pause the stream
app.post('/api/pause-stream', (req, res) => {
    pauseStream();
    res.json({ message: 'Stream paused successfully' });
});

// Route to resume the stream
app.post('/api/resume-stream', (req, res) => {
    resumeStream();
    res.json({ message: 'Stream resumed successfully' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

