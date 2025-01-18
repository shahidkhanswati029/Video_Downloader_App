import { useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

function App() {
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);

  socket.on("connect", () => {
    console.log("Connected to socket.io server");
  });

  // useEffect(() => {
  function test() {
    console.log("{{{test function is running...}}}");
    socket.on("progress", (data) => {
      console.log("{{{data}}}", data);

      if (data.error) {
        console.error("Error:", data.error);
        alert("An error occurred while downloading the video.");
      } else {
        console.log("Progress update received:", data.progress); // Debug log
        setProgress(data.progress); // Update progress state
      }
    });

    return () => {
      socket.off("progress");
    };
  }

  test();
  // }, []);

  const handleDownload = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/videos/download",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );

      console.log("{{{handleDownload func is running...}}}");
      test();

      if (!response.ok) {
        throw new Error("Download failed.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "video.mp4";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center mt-32">
      <h1 className="font-bold text-xl">YouTube Downloader</h1>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full mt-5 p-3"
      />
      <button
        className="w-fit mt-3 bg-gray-200 hover:bg-gray-600 border border-gray-300 rounded-md p-3"
        onClick={handleDownload}
      >
        Download
      </button>
      <div className="w-full mt-5">
        <label>Download Progress:</label>
        <progress
          value={progress}
          max="100"
          className="w-full h-5 mt-2"
        ></progress>
        <p className="text-center mt-2">{progress}%</p>
      </div>
    </div>
  );
}

export default App;
