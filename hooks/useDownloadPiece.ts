import { useMutation } from "@tanstack/react-query";
import { useSynapse } from "@/providers/SynapseProvider";
import { getFilbeamPieceUrl } from "@/utils/filbeam";
import { useState } from "react";

/**
 * Hook to download a piece from Filecoin using Filbeam CDN (fast) with Synapse fallback.
 */
export const useDownloadPiece = (commp: string, filename: string) => {
  const { synapse } = useSynapse();
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [downloadError, setDownloadError] = useState<string>("");

  const mutation = useMutation({
    mutationKey: ["download-piece", commp, filename],
    mutationFn: async () => {
      console.log("🔽 Starting download:", {
        pieceCid: commp,
        filename,
        hasSynapse: !!synapse
      });

      setDownloadStatus("🔍 Preparing download...");
      setDownloadError("");

      // Validate inputs
      if (!commp || commp === "undefined" || commp === "null") {
        throw new Error("Invalid piece CID");
      }

      try {
        // Try Filbeam CDN first (faster)
        console.log("📡 Attempting download from Filbeam CDN...");
        setDownloadStatus("📡 Connecting to Filbeam CDN...");

        const filbeamUrl = getFilbeamPieceUrl(commp);
        console.log("🌐 Filbeam URL:", filbeamUrl);

        const response = await fetch(filbeamUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
        });

        console.log("📥 Filbeam response status:", response.status);

        if (response.ok) {
          console.log("✅ Filbeam CDN success, downloading blob...");
          setDownloadStatus("⬇️ Downloading from CDN...");

          const blob = await response.blob();
          console.log("📦 Blob size:", blob.size, "bytes");

          if (blob.size === 0) {
            throw new Error("Downloaded file is empty");
          }

          const file = new File([blob], filename, { type: blob.type });

          // Download file
          console.log("💾 Triggering browser download...");
          setDownloadStatus("💾 Saving file...");

          const url = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          console.log("✅ Download complete via Filbeam CDN");
          setDownloadStatus("✅ Download complete!");
          return file;
        } else {
          console.warn("❌ Filbeam CDN failed with status:", response.status);
          throw new Error(`Filbeam CDN returned status ${response.status}`);
        }
      } catch (error: any) {
        console.warn("⚠️ Filbeam CDN failed, trying Synapse fallback:", error.message);
        setDownloadStatus("⚠️ CDN failed, trying direct download...");

        // Fallback to Synapse
        if (!synapse) {
          const errorMsg = "Synapse SDK not available. Cannot download file.";
          console.error("❌", errorMsg);
          setDownloadError(errorMsg);
          throw new Error(errorMsg);
        }

        try {
          console.log("🔄 Downloading via Synapse SDK...");
          setDownloadStatus("🔄 Downloading directly from Filecoin...");

          const uint8ArrayBytes = await synapse.storage.download(commp);
          console.log("📦 Downloaded bytes:", uint8ArrayBytes.length);

          if (!uint8ArrayBytes || uint8ArrayBytes.length === 0) {
            throw new Error("Downloaded file is empty");
          }

          const file = new File([uint8ArrayBytes as BlobPart], filename);

          console.log("💾 Triggering browser download via Synapse...");
          setDownloadStatus("💾 Saving file...");

          const url = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          console.log("✅ Download complete via Synapse");
          setDownloadStatus("✅ Download complete!");
          return file;
        } catch (synapseError: any) {
          const errorMsg = `Failed to download: ${synapseError.message || "Unknown error"}`;
          console.error("❌ Synapse download failed:", synapseError);
          setDownloadError(errorMsg);
          throw new Error(errorMsg);
        }
      }
    },
    onSuccess: () => {
      console.log("✅ File downloaded successfully:", filename);
      setTimeout(() => setDownloadStatus(""), 3000);
    },
    onError: (error: any) => {
      const errorMsg = error.message || "Failed to download asset";
      console.error("❌ Download error:", errorMsg);
      setDownloadError(errorMsg);
      setDownloadStatus("");
    },
  });

  return {
    downloadMutation: mutation,
    downloadStatus,
    downloadError,
    clearError: () => setDownloadError(""),
  };
};
