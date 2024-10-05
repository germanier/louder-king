import React, { useState, useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from 'primereact/button'
import { useAccount } from "wagmi";

const App: React.FC = () => {
  const { isConnected } = useAccount(); // Using RainbowKit's hook to check if the wallet is connected
  const [maxDecibels, setMaxDecibels] = useState<number | null>(null);
  const [recording, setRecording] = useState<boolean>(false);

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;
    let workletNode: AudioWorkletNode | null = null;
    let timeoutId: NodeJS.Timeout | null = null; 
    let audioContextClosed = false; // Flag to track if AudioContext has been closed

    if (recording) {
      const startRecording = async () => {
        try {
          audioContext = new AudioContext();

          await audioContext.audioWorklet.addModule('worklet-processor.js'); // Load worklet

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          microphone = audioContext.createMediaStreamSource(stream);

          workletNode = new AudioWorkletNode(audioContext, 'decibel-processor');
          workletNode.port.onmessage = (event) => {
            const { maxDecibel } = event.data;
            setMaxDecibels(Number(maxDecibel.toFixed(2)));
          };

          microphone.connect(workletNode);
          workletNode.connect(audioContext.destination);

          // Automatically stop recording after 5 seconds
          timeoutId = setTimeout(() => {
            if (workletNode) workletNode.disconnect();
            if (microphone) microphone.disconnect();

            if (audioContext && !audioContextClosed && audioContext.state !== 'closed') {
              audioContext.close();
              audioContextClosed = true; // Mark as closed
            }

            setRecording(false);
          }, 5000);
        } catch (err) {
          console.error("Error accessing microphone:", err);
          setRecording(false);
        }
      };

      startRecording();
    }

    // Cleanup function when component unmounts or the recording stops
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId); // Clear timeout if the component unmounts before it finishes
      }

      if (workletNode) workletNode.disconnect();
      if (microphone) microphone.disconnect();

      // Ensure we only close the AudioContext once
      if (audioContext && !audioContextClosed && audioContext.state !== 'closed') {
        audioContext.close();
        audioContextClosed = true; // Mark as closed
      }
    };
  }, [recording]);

  const handleStart = () => {
    setMaxDecibels(null);
    setRecording(true);
  };

  const handleMint = (decibels: number) => {

  }

  return (
    <div style={{ marginTop: '50px' }}>
      {/* Wallet Connect Button */}
      <div style={{
            position: 'fixed',  // Fixed positioning relative to the viewport
            top: '4%',        // Distance from the top
            right: '4%'       // Distance from the right
          }}>
          <ConnectButton 
        showBalance={false} // Optionally hide balance
        accountStatus="address" // Show address only
      />
      </div>
      <div style={{textAlign: 'center'}}>
      <h1>👑 Louder, King! 👑</h1>
      <h2>The louder your shout, the better your NFT!</h2>
      {isConnected ? (
          <>
      <br />
      <Button onClick={handleStart} disabled={recording}>
        {recording ? "Hearing your screeches..." : "Shout, King!"}
      </Button>
      {maxDecibels !== null && (
        <>
          <h2>Maximum Decibels: {maxDecibels} dB</h2>
          <Button label="Mint your NFT" onClick={handleMint}></Button>
        </>
      )}
      </> ) : (<></>) }
    </div>
    </div>
  );
};

export default App;
