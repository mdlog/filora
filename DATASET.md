# Dataset View Implementation Guide

Step-by-step guide untuk mengimplementasikan dataset view di aplikasi lain.

## **1. Install Dependencies**
```bash
npm install @filoz/synapse-sdk @tanstack/react-query wagmi viem ethers
```

## **2. Setup Synapse Provider**
```typescript
// providers/SynapseProvider.tsx
"use client";
import { Synapse, WarmStorageService } from "@filoz/synapse-sdk";
import { createContext, useState, useEffect, useContext } from "react";
import { useEthersSigner } from "@/hooks/useEthers";

export const SynapseContext = createContext<{
  synapse: Synapse | null;
  warmStorageService: WarmStorageService | null;
}>({ synapse: null, warmStorageService: null });

export const SynapseProvider = ({ children }: { children: React.ReactNode }) => {
  const [synapse, setSynapse] = useState<Synapse | null>(null);
  const [warmStorageService, setWarmStorageService] = useState<WarmStorageService | null>(null);
  const signer = useEthersSigner();

  useEffect(() => {
    const createSynapse = async () => {
      if (!signer) return;
      const synapse = await Synapse.create({
        signer,
        withCDN: true,
        disableNonceManager: false,
      });
      const warmStorageService = await WarmStorageService.create(
        synapse.getProvider(),
        synapse.getWarmStorageAddress()
      );
      setSynapse(synapse);
      setWarmStorageService(warmStorageService);
    };
    createSynapse();
  }, [signer]);

  return (
    <SynapseContext.Provider value={{ synapse, warmStorageService }}>
      {children}
    </SynapseContext.Provider>
  );
};

export const useSynapse = () => useContext(SynapseContext);
```

## **3. Create Types**
```typescript
// types.ts
import { EnhancedDataSetInfo, ProviderInfo, DataSetData } from "@filoz/synapse-sdk";

export interface DataSet extends EnhancedDataSetInfo {
  data: DataSetData | null;
  provider: ProviderInfo | null;
}
```

## **4. Create useDatasets Hook**
```typescript
// hooks/useDatasets.ts
import { useQuery } from "@tanstack/react-query";
import { EnhancedDataSetInfo, PDPServer } from "@filoz/synapse-sdk";
import { useAccount } from "wagmi";
import { DataSet } from "@/types";
import { useSynapse } from "@/providers/SynapseProvider";

export const useDatasets = () => {
  const { address } = useAccount();
  const { synapse, warmStorageService } = useSynapse();

  return useQuery({
    enabled: !!address,
    queryKey: ["datasets", address],
    queryFn: async () => {
      if (!synapse || !address || !warmStorageService) 
        throw new Error("Services not available");

      // Get providers and datasets
      const [providerIds, datasets] = await Promise.all([
        warmStorageService.getApprovedProviderIds(),
        warmStorageService.getClientDataSetsWithDetails(address),
      ]);

      // Map provider IDs to addresses
      const providerIdToAddressMap = datasets.reduce((acc, dataset) => {
        acc[dataset.providerId] = dataset.payee;
        return acc;
      }, {} as Record<number, string>);

      // Fetch provider info
      const providers = await Promise.all(
        providerIds.map(async (providerId) => {
          const providerAddress = providerIdToAddressMap[providerId];
          if (!providerAddress) return null;
          try {
            return await synapse.getProviderInfo(providerId);
          } catch (error) {
            console.warn(`Failed to fetch provider ${providerId}:`, error);
            return null;
          }
        })
      );

      const filteredProviders = providers.filter(p => p !== null);

      // Create provider ID to service URL mapping
      const providerIdToServiceUrlMap = filteredProviders.reduce((acc, provider) => {
        acc[provider.id] = provider.products.PDP?.data.serviceURL || "";
        return acc;
      }, {} as Record<string, string>);

      // Fetch dataset details with PDP data
      const datasetDetailsPromises = datasets.map(async (dataset: EnhancedDataSetInfo) => {
        const serviceURL = providerIdToServiceUrlMap[dataset.providerId];
        const provider = filteredProviders.find(p => p.id === dataset.providerId);

        try {
          const pdpServer = new PDPServer(null, serviceURL || "");
          const data = await pdpServer.getDataSet(dataset.pdpVerifierDataSetId);
          return { ...dataset, provider, serviceURL, data } as DataSet;
        } catch (error) {
          console.warn(`Failed to fetch dataset details:`, error);
          return { ...dataset, provider, serviceURL } as unknown as DataSet;
        }
      });

      const datasetDataResults = await Promise.all(datasetDetailsPromises);
      return { datasets: datasetDataResults };
    },
  });
};
```

## **5. Create Download Hook**
```typescript
// hooks/useDownloadPiece.ts
import { useMutation } from "@tanstack/react-query";
import { useSynapse } from "@/providers/SynapseProvider";

export const useDownloadPiece = (commp: string, filename: string) => {
  const { synapse } = useSynapse();

  const mutation = useMutation({
    mutationKey: ["download-piece", commp, filename],
    mutationFn: async () => {
      if (!synapse) throw new Error("Synapse not found");
      const uint8ArrayBytes = await synapse.storage.download(commp);
      const file = new File([uint8ArrayBytes as BlobPart], filename);
      
      // Download file
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      return file;
    },
  });

  return { downloadMutation: mutation };
};
```

## **6. Create Dataset Viewer Component**
```typescript
// components/DatasetsViewer.tsx
"use client";
import { useAccount } from "wagmi";
import { useDatasets } from "@/hooks/useDatasets";
import { useDownloadPiece } from "@/hooks/useDownloadPiece";
import { DataSet } from "@/types";
import { DataSetPieceData } from "@filoz/synapse-sdk";

export const DatasetsViewer = () => {
  const { isConnected } = useAccount();
  const { data, isLoading } = useDatasets();

  if (!isConnected) return null;

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm max-h-[900px] overflow-y-auto">
      <h3 className="text-xl font-semibold mb-4">Datasets</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading datasets...</p>
        </div>
      ) : data?.datasets?.length > 0 ? (
        <div className="space-y-6">
          {data.datasets.map((dataset: DataSet | undefined) =>
            dataset && (
              <div key={dataset.clientDataSetId} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium">Dataset #{dataset.pdpVerifierDataSetId}</h4>
                    <p className="text-sm text-gray-500">
                      Status: <span className={dataset.isLive ? "text-green-600" : "text-red-600"}>
                        {dataset.isLive ? "Live" : "Inactive"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      PDP URL: <span 
                        className="cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(dataset.provider?.products.PDP?.data.serviceURL || "");
                          alert("PDP URL copied!");
                        }}
                      >
                        {dataset.provider?.products.PDP?.data.serviceURL}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Commission: {dataset.commissionBps / 100}%</p>
                    <p className="text-sm">Managed: {dataset.isManaged ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Piece Count</p>
                      <p className="font-medium">{dataset.currentPieceCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Piece ID</p>
                      <p className="font-medium">{dataset.nextPieceId}</p>
                    </div>
                  </div>

                  {dataset.data?.pieces && (
                    <div>
                      <h6 className="text-sm font-medium mb-2">Available Pieces</h6>
                      <div className="space-y-2">
                        {dataset.data.pieces.map((piece) => (
                          <PieceDetails key={piece.pieceId} piece={piece} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="flex justify-center py-8">
          <p>No datasets found</p>
        </div>
      )}
    </div>
  );
};

const PieceDetails = ({ piece }: { piece: DataSetPieceData }) => {
  const filename = `piece-${piece.pieceCid}.png`;
  const { downloadMutation } = useDownloadPiece(piece.pieceCid.toString(), filename);

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Piece #{piece.pieceId}</p>
        <p className="text-xs text-gray-500 truncate">{piece.pieceCid.toString()}</p>
      </div>
      <button
        onClick={() => downloadMutation.mutate()}
        disabled={downloadMutation.isPending}
        className="px-3 py-1 text-sm rounded border-2 border-black bg-black text-white hover:bg-white hover:text-black disabled:bg-gray-200"
      >
        {downloadMutation.isPending ? "Downloading..." : "Download"}
      </button>
    </div>
  );
};
```

## **7. Setup App Layout**
```typescript
// app/layout.tsx
import { WagmiProvider } from "wagmi";
import { filecoinCalibration } from "wagmi/chains";
import { http, createConfig } from "@wagmi/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SynapseProvider } from "@/providers/SynapseProvider";

const queryClient = new QueryClient();
const config = createConfig({
  chains: [filecoinCalibration],
  connectors: [],
  transports: { [filecoinCalibration.id]: http() },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            <SynapseProvider>
              {children}
            </SynapseProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

## **8. Use in Page**
```typescript
// app/page.tsx
import { DatasetsViewer } from "@/components/DatasetsViewer";

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <DatasetsViewer />
    </div>
  );
}
```

## **9. Required useEthers Hook**
```typescript
// hooks/useEthers.ts
import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

export function useEthersSigner() {
  const { data: walletClient } = useWalletClient();
  
  return useMemo(() => {
    if (!walletClient) return undefined;
    const { account, chain, transport } = walletClient;
    const network = { chainId: chain.id, name: chain.name };
    const provider = new BrowserProvider(transport, network);
    return new JsonRpcSigner(provider, account.address);
  }, [walletClient]);
}
```

## **Data Sources**

### **On-Chain Data:**
- **WarmStorage Contract**: Dataset metadata
- **PDP Verifier Contract**: Dataset status, piece count
- **Service Provider Registry**: Provider info, PDP URLs

### **Off-Chain Data:**
- **PDP Servers**: Piece details, CIDs, challenge epochs

## **Key Features**
- ✅ Display all user datasets
- ✅ Show dataset status (Live/Inactive)
- ✅ Display piece count and details
- ✅ Copy PDP URL to clipboard
- ✅ Download individual pieces
- ✅ Real-time data from Filecoin Calibration chain

**Selesai!** Dataset view akan menampilkan semua datasets user dengan piece details dan download functionality.