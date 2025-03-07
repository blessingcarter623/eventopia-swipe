
import React from "react";
import { useQrScanner } from "./qr-scanner/useQrScanner";
import ScannerView from "./qr-scanner/ScannerView";
import IdleState from "./qr-scanner/IdleState";
import ScanResultDialog from "./qr-scanner/ScanResultDialog";
import { QrCodeScannerProps } from "./qr-scanner/types";

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onSuccess, eventId }) => {
  const {
    scanning,
    cameraError,
    scanResult,
    showResultDialog,
    setShowResultDialog,
    hasCheckedIn,
    videoRef,
    canvasRef,
    startScanner,
    stopScanner,
    handleCheckIn,
    scanAnother
  } = useQrScanner(eventId, onSuccess);
  
  return (
    <div className="qr-scanner">
      <div className="flex flex-col items-center">
        {scanning ? (
          <ScannerView
            isScanning={scanning}
            videoRef={videoRef}
            canvasRef={canvasRef}
            onStopScanner={stopScanner}
          />
        ) : (
          <IdleState
            cameraError={cameraError}
            onStartScanner={startScanner}
          />
        )}
      </div>
      
      <ScanResultDialog
        open={showResultDialog}
        onOpenChange={setShowResultDialog}
        scanResult={scanResult}
        hasCheckedIn={hasCheckedIn}
        onCheckIn={handleCheckIn}
        onScanAnother={scanAnother}
      />
    </div>
  );
};

export default QrCodeScanner;
