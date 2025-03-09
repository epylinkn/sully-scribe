import { useEffect, useRef } from 'react';

interface AudioWaveProps {
  isActive: boolean;
  stream?: MediaStream | null;
}

const WINDOW_SIZE = 30; // Fewer bars for the bar visualization
const HISTORY_DURATION = 10000; // 10 seconds in milliseconds
const UPDATE_INTERVAL = HISTORY_DURATION / WINDOW_SIZE; // How often to sample audio

export default function AudioWave({ isActive, stream }: AudioWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const amplitudeHistoryRef = useRef<number[]>(new Array(WINDOW_SIZE).fill(0.1));
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initialize audio context and analyzer if we have a stream
    if (stream && isActive && !audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 2048; // Larger FFT for better resolution
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);
    }

    let animationId: number;
    const dataArray = new Uint8Array(analyzerRef.current?.frequencyBinCount || 0);

    function draw(timestamp: number) {
      const timeSinceLastUpdate = timestamp - lastUpdateRef.current;

      if (analyzerRef.current && isActive && timeSinceLastUpdate >= UPDATE_INTERVAL) {
        // Get current audio data
        analyzerRef.current.getByteTimeDomainData(dataArray);
        
        // Calculate RMS amplitude from the waveform
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const amplitude = (dataArray[i] - 128) / 128;
          sum += amplitude * amplitude;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        
        // Update history
        amplitudeHistoryRef.current.push(Math.max(0.1, rms * 2)); // Amplify and ensure minimum value
        amplitudeHistoryRef.current.shift();
        
        lastUpdateRef.current = timestamp;
      }

      // Draw visualization
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background with slight transparency
      ctx.fillStyle = 'rgba(255, 240, 240, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = Math.floor(canvas.width / WINDOW_SIZE) - 2;
      const barSpacing = 2;
      const maxBarHeight = canvas.height - 4;
      
      // Draw bars
      amplitudeHistoryRef.current.forEach((amplitude, i) => {
        const x = i * (barWidth + barSpacing) + barSpacing;
        const barHeight = Math.min(amplitude * maxBarHeight, maxBarHeight);
        const y = canvas.height - barHeight - 2;
        
        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height - 2);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#ff8787');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
      });

      animationId = requestAnimationFrame(draw);
    }

    draw(performance.now());

    return () => {
      cancelAnimationFrame(animationId);
      if (!isActive && audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        analyzerRef.current = null;
        amplitudeHistoryRef.current = new Array(WINDOW_SIZE).fill(0.1);
      }
    };
  }, [isActive, stream]);

  return (
    <div className="h-12 bg-pink-50 rounded-full overflow-hidden border border-pink-100">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
} 
