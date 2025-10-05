import { useMutation } from "@tanstack/react-query";
import { useSynapse } from "@/providers/SynapseProvider";
import { getFilbeamPieceUrl } from "@/utils/filbeam";

/**
 * Hook to download a piece from Filecoin using Filbeam CDN (fast) with Synapse fallback.
 */
export const useDownloadPiece = (commp: string, filename: string) => {
  const { synapse } = useSynapse();

  const mutation = useMutation({
    mutationKey: ["download-piece", commp, filename],
    mutationFn: async () => {
      try {
        // Try Filbeam CDN first (faster)
        const filbeamUrl = getFilbeamPieceUrl(commp);
        const response = await fetch(filbeamUrl);
        
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], filename);
          
          // Download file
          const url = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
          return file;
        }
      } catch (error) {
        console.warn("Filbeam CDN failed, falling back to Synapse:", error);
      }

      // Fallback to Synapse
      if (!synapse) throw new Error("Synapse not found");
      const uint8ArrayBytes = await synapse.storage.download(commp);
      const file = new File([uint8ArrayBytes as BlobPart], filename);

      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return file;
    },
    onSuccess: () => {
      console.log("File downloaded", filename);
    },
    onError: (error) => {
      console.error("Error downloading piece", error);
    },
  });

  return {
    downloadMutation: mutation,
  };
};
