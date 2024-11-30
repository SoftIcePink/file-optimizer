// public/fileWorker.js
self.onmessage = (event) => {
    const { chunk } = event.data;
    const lines = chunk.split('\n');
    const parsedFiles = [];
  
    for (const line of lines) {
      try {
        const file = JSON.parse(line);
        parsedFiles.push(file);
      } catch (err) {
        console.error('Error parsing JSON line in worker:', err, line);
      }
    }
  
    self.postMessage(parsedFiles);
  };
  