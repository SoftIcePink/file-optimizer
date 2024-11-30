export default class FileWorker {
    private worker: Worker;
  
    constructor() {
      this.worker = new Worker('/fileWorker.js'); // Reference the file in the public directory
    }
  
    postMessage(data: { chunk: string }) {
      this.worker.postMessage(data);
    }
  
    onMessage(callback: (files: File[]) => void) {
      this.worker.onmessage = (event) => callback(event.data);
    }
  
    terminate() {
      this.worker.terminate();
    }
  }
  