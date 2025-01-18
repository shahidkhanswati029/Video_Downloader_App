import path from 'path';
import { spawn } from 'child_process';
import { Server } from 'socket.io';
import cors from "cors";
let socket;
export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",  // Ensure your frontend is on this port
      methods: ["GET", "POST"],
    },
  });

  socket = io

  io.on("connection", (socket) => {
    console.log("A client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};



export const downloadVideo = async (req, res) => {
  try {
    const videoUrl = req.body.url;

    const ytDlpPath = path.join(
      'C:', 'Users', 'Hp', 'AppData', 'Roaming', 'npm', 'node_modules', 'youtube-dl-exec', 'bin', 'yt-dlp.exe'
    );

    const commandArgs = [
      videoUrl,
      '--format', 'mp4',
      '--progress',
      '--output', '-', // Stream directly
    ];

    const ytDlpProcess = spawn(ytDlpPath, commandArgs);

    // Track progress and emit events via `socket.io`
    ytDlpProcess.stderr.on('data', (data) => {
      const message = data.toString();
      console.log('stderr:', message);

      // Extract progress percentage
      const progressMatch = message.match(/\[download\]\s+(\d+(\.\d+)?)%/);
      if (progressMatch) {
        const progress = parseFloat(progressMatch[1]);
        console.log(`Progress: ${progress}%`);

        console.log(`socket: ${socket}`);
        socket.emit('progress', { progress });
        // if (io) {
        // }
      }


    });

    // Handle video streaming
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    ytDlpProcess.stdout.pipe(res);

    ytDlpProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`yt-dlp process exited with code ${code}`);
        if (socket) {
          socket.emit('progress', { error: 'Error processing the video' });
        }
      } else {
        console.log('yt-dlp process completed successfully');
        if (socket) {
          socket.emit('progress', { progress: 100 }); // Completion
        }
      }
    });
  } catch (error) {
    console.error('Error processing the video:', error);
    if (socket) {
      socket.emit('progress', { error: 'Error processing the video' });
    }
    res.status(500).send('Error processing the video');
  }
};
