import React, { useState, useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from 'primereact/button';
import { useAccount } from "wagmi";

const App: React.FC = () => {
  let { isConnected, address } = useAccount(); // Get isConnected and address from wagmi's useAccount
  const [maxDecibels, setMaxDecibels] = useState<number | null>(null);
  const [recording, setRecording] = useState<boolean>(false);

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;
    let workletNode: AudioWorkletNode | null = null;
    let timeoutId: NodeJS.Timeout | null = null; 
    let audioContextClosed = false;

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
              audioContextClosed = true;
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
        clearTimeout(timeoutId);
      }
      if (workletNode) workletNode.disconnect();
      if (microphone) microphone.disconnect();

      if (audioContext && !audioContextClosed && audioContext.state !== 'closed') {
        audioContext.close();
        audioContextClosed = true;
      }
    };
  }, [recording]);

  const handleStart = () => {
    setMaxDecibels(null);
    setRecording(true);
  };

  const handleMint = (decibels: number) => {
    if (!address) {
      console.error("Wallet not connected");
      return;
    }

    const chain = "optimism-sepolia";
    const recipientAddress = `${address}:${chain}`;  // Proper string interpolation with backticks

    const url = 'https://staging.crossmint.com/api/2022-06-09/collections/default/nfts';
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": process.env.REACT_APP_API_KEY!,
      },
      body: JSON.stringify({
        recipient: recipientAddress,
        metadata: {
          name: 'King\'s Shout',
          image: process.env.REACT_APP_NFT_URL!,
          description: `This NFT was generated based on a maximum shout of ${decibels} points`,
        },
      }),
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error("error:", err));
  };

  return (
    <div style={{ marginTop: '50px' }}>
      {/* Wallet Connect Button */}
      <div style={{
        position: 'fixed',
        top: '4%',
        right: '4%'
      }}>
        <ConnectButton 
          showBalance={false}
          accountStatus="address"
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
                <h2>Your Score: {maxDecibels} </h2>
                <Button label="Mint your NFT" onClick={() => handleMint(maxDecibels)} />
              </>
            )}
          </>
        ) : (
          <p>Please connect your wallet to start</p>
        )}
      </div>
    </div>
  );
};

export default App;
