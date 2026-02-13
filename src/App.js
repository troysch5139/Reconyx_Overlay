import { useState, useRef, useEffect } from "react";
import "@/App.css";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Image as ImageIcon } from "lucide-react";

function App() {
  const [baseImage, setBaseImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlayOpacity, setOverlayOpacity] = useState(100);
  const canvasRef = useRef(null);
  const baseInputRef = useRef(null);

  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Load the permanent overlay image on mount
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOverlayImage(img);
    };
    img.src = "/overlay.png";
  }, []);

  useEffect(() => {
    if (baseImage && overlayImage) {
      drawCanvas();
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseImage, overlayImage, overlayOpacity]);

  const handleBaseImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setBaseImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImage || !overlayImage) return;

    const ctx = canvas.getContext("2d");
    
    // Set canvas size to match base image exactly (no stretching)
    canvas.width = baseImage.naturalWidth;
    canvas.height = baseImage.naturalHeight;

    // Draw base image at original size
    ctx.drawImage(baseImage, 0, 0, baseImage.naturalWidth, baseImage.naturalHeight);

    // Draw overlay permanently
    ctx.globalAlpha = overlayOpacity / 100;
    ctx.drawImage(overlayImage, 0, 0, baseImage.naturalWidth, baseImage.naturalHeight);
    ctx.globalAlpha = 1.0;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-with-overlay-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-tight text-neutral-900 mb-2">
            Reconyx_Overlay
          </h1>
          <p className="text-neutral-600 text-sm">
            Upload your image and adjust the overlay transparency
          </p>
        </div>

        {/* Upload Control */}
        <div className="mb-8">
          <input
            ref={baseInputRef}
            type="file"
            accept="image/*"
            onChange={handleBaseImageUpload}
            className="hidden"
            data-testid="base-image-input"
          />
          <Button
            onClick={() => baseInputRef.current?.click()}
            variant="outline"
            className="w-full h-32 border-2 border-dashed border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100 transition-colors"
            data-testid="upload-base-btn"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">
                {baseImage ? "Change Image" : "Upload Image"}
              </span>
            </div>
          </Button>
        </div>

        {/* Canvas Preview */}
        {baseImage && (
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex justify-center mb-4">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto border border-neutral-200 rounded"
                  data-testid="image-canvas"
                />
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-4 pt-4 border-t border-neutral-200">
                {/* Opacity Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-neutral-700">
                      Overlay Transparency
                    </Label>
                    <span className="text-sm text-neutral-500" data-testid="opacity-value">
                      {overlayOpacity}%
                    </span>
                  </div>
                  <Slider
                    value={[overlayOpacity]}
                    onValueChange={(value) => setOverlayOpacity(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                    data-testid="opacity-slider"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className="bg-neutral-900 hover:bg-neutral-800"
                    data-testid="download-btn"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!baseImage && (
          <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
            <ImageIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-sm">
              Upload an image to apply the overlay
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-lg border border-neutral-200 p-8">
          <h2 className="text-xl font-medium text-neutral-900 mb-4">How to Use</h2>
          <div className="space-y-4 text-neutral-700">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 text-white text-sm flex items-center justify-center">1</span>
              <div>
                <p className="font-medium">Upload Your Image</p>
                <p className="text-sm text-neutral-600">Click the upload button and select an image from your device (phone or computer).</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 text-white text-sm flex items-center justify-center">2</span>
              <div>
                <p className="font-medium">Adjust Transparency</p>
                <p className="text-sm text-neutral-600">Use the slider to control the overlay visibility from 0% (invisible) to 100% (fully visible).</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 text-white text-sm flex items-center justify-center">3</span>
              <div>
                <p className="font-medium">Download Result</p>
                <p className="text-sm text-neutral-600">Click the Download button to save your image with the overlay applied.</p>
              </div>
            </div>
          </div>

          {/* Offline Instructions */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <h3 className="text-base font-medium text-neutral-900 mb-3">Use Offline (iPhone/Android)</h3>
            <div className="space-y-2 text-sm text-neutral-600">
              <p><strong>iPhone (Safari):</strong> Tap the Share button, then "Add to Home Screen"</p>
              <p><strong>Android (Chrome):</strong> Tap the menu (⋮), then "Add to Home Screen" or "Install App"</p>
              <p className="text-xs text-neutral-500 mt-3">Once installed, you can use this app without an internet connection.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
