"use client";
import React, { useState } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ResponseStatus } from "../../../../utils/enum";

const QRCodeScanner: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [count, setCount] = useState<number>(0);
  const [checkInStatus, setCheckInStatus] = useState<string>("");

  const checkInTicket = useMutation(api.tickets.checkInTicket);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const qrData: string = detectedCodes[0].rawValue;
      setCount((prevCount) => prevCount + 1);
      console.log("qr", qrData);
      try {
        const parsedData = JSON.parse(qrData);
        console.log("parsedData", parsedData);

        if (
          parsedData &&
          typeof parsedData === "object" &&
          "ticketUniqueId" in parsedData
        ) {
          console.log("Scanned QR Code:", parsedData.ticketUniqueId);
          setResult(parsedData.ticketUniqueId);

          // Call the checkInTicket mutation
          const response = await checkInTicket({
            ticketUniqueId: parsedData.ticketUniqueId as string,
          });

          if (response.status === ResponseStatus.SUCCESS) {
            setCheckInStatus("Check-in successful!");
          } else {
            setCheckInStatus(`Check-in failed: ${response.error}`);
          }
        } else {
          console.error(
            "Parsed data does not contain the expected structure:",
            parsedData
          );
          setCheckInStatus("Invalid QR code format");
        }
      } catch (error) {
        console.error("Error parsing QR code data:", error);
        setCheckInStatus("Error parsing QR code");
      }
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
  };

  const handleReset = () => {
    setResult(""); // Clear scanned result
    setCount(0); // Reset count
  };

  return (
    <div>
      <h1>QR Code Scanner</h1>
      <Scanner
        onScan={handleScan}
        onError={handleError}
        constraints={{ facingMode: "environment" }}
        paused={false} // Ensure scanning is always active
      />
      <p>Scan Count: {count}</p>
      {result && (
        <div>
          <h2>Scanned Result:</h2>
          <p>{result}</p>
          <p>Check-in Status: {checkInStatus}</p>
          <button onClick={handleReset}>Reset</button>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
