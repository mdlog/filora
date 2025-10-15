"use client";

import { useQuery } from "@tanstack/react-query";
import { PDPServer } from "@filoz/synapse-sdk";
import { DataSet } from "@/types";
import { useSynapse } from "@/providers/SynapseProvider";
import { useGetActiveAssets } from "@/hooks/useAssetRegistry";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

export const useAllDatasets = () => {
  const { synapse, warmStorageService } = useSynapse();
  const { data: registryAssets, isLoading: isLoadingRegistry } = useGetActiveAssets();

  return useQuery({
    queryKey: ["all-datasets", registryAssets?.length || 0],
    enabled: !!synapse && !!warmStorageService && !isLoadingRegistry,
    queryFn: async () => {
      if (!synapse) throw new Error("Synapse not found");
      if (!warmStorageService) throw new Error("Warm storage service not found");

      console.log("🔍 Registry assets from contract:", registryAssets);
      console.log("📊 Registry has AssetRegistry?", !!CONTRACT_ADDRESSES.AssetRegistry);
      console.log("📊 Registry assets count:", registryAssets?.length || 0);

      // Use registry if available
      if (CONTRACT_ADDRESSES.AssetRegistry && registryAssets && registryAssets.length > 0) {
        console.log("✅ Loading assets from AssetRegistry contract:", registryAssets.length, "assets");
        const allClientDatasets: DataSet[] = [];

        for (const asset of registryAssets) {
          try {
            console.log(`Processing asset: datasetId=${asset.datasetId}, providerId=${asset.providerId}, pieceCid=${asset.pieceCid}`);
            const provider = await synapse.getProviderInfo(asset.providerId);
            console.log(`Provider info:`, provider.name, provider.id);

            const serviceURL = provider.products.PDP?.data.serviceURL || "";
            if (!serviceURL) {
              console.warn(`No service URL for provider ${provider.id}`);
              continue;
            }

            // Create mock data with pieceCid from registry
            const mockData = {
              id: asset.datasetId,
              pieces: [{
                pieceId: 0,
                pieceCid: { toString: () => asset.pieceCid, toV1: () => ({ toString: () => asset.pieceCid }) },
              }],
              nextChallengeEpoch: 0,
              payer: asset.owner,
            };

            console.log(`Adding asset from registry with pieceCid: ${asset.pieceCid}, price: ${asset.price}`);
            allClientDatasets.push({
              pdpVerifierDataSetId: asset.datasetId,
              providerId: asset.providerId,
              payer: asset.owner,
              payee: (provider as any).address,
              provider,
              serviceURL,
              data: mockData as any,
              isLive: asset.isActive,
              price: asset.price,
            } as unknown as DataSet);
          } catch (error) {
            console.error(`Failed to load asset from registry:`, error);
            console.error(`Asset details:`, asset);
          }
        }

        console.log("✅ Total datasets loaded from registry:", allClientDatasets.length);
        console.log("📊 Registry-based datasets:", allClientDatasets.map(d => ({
          datasetId: d.pdpVerifierDataSetId,
          provider: d.provider?.name,
          owner: d.payer,
          price: d.price
        })));
        return { datasets: allClientDatasets };
      }

      console.log("No registry assets, falling back to provider scan");

      // Get all datasets from all providers
      const providerIds = await warmStorageService.getApprovedProviderIds();
      console.log("Approved provider IDs:", providerIds);

      // Fetch provider information
      const providers = await Promise.all(
        providerIds.map(async (providerId) => {
          try {
            return await synapse.getProviderInfo(providerId);
          } catch (error) {
            console.warn(`Failed to fetch provider ${providerId}:`, error);
            return null;
          }
        })
      );
      const filteredProviders = providers.filter((p) => p !== null);

      // Fetch all datasets from all providers
      const allClientDatasets: DataSet[] = [];
      const seenDatasets = new Set<string>();

      for (const provider of filteredProviders) {
        const serviceURL = provider.products.PDP?.data.serviceURL || "";
        if (!serviceURL) continue;

        console.log(`Fetching datasets from provider: ${provider.name} (${provider.id})`);

        const pdpServer = new PDPServer(null, serviceURL);
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 5;
        let providerDatasetCount = 0;

        for (let datasetId = 0; datasetId < 100; datasetId++) {
          try {
            const data = await pdpServer.getDataSet(datasetId);
            if (data && data.pieces && data.pieces.length > 0) {
              consecutiveFailures = 0;

              const datasetKey = `${provider.id}-${datasetId}`;
              if (seenDatasets.has(datasetKey)) continue;
              seenDatasets.add(datasetKey);

              providerDatasetCount++;
              const payer = (data as any).payer || (provider as any).address;

              console.log(`Provider ${provider.name} - Dataset ${datasetId}: payer=${payer}, pieces=${data.pieces.length}`);

              allClientDatasets.push({
                pdpVerifierDataSetId: datasetId,
                providerId: provider.id,
                payer,
                payee: (provider as any).address,
                provider,
                serviceURL,
                data,
                isLive: true,
              } as unknown as DataSet);
            }
          } catch (error) {
            consecutiveFailures++;
            if (consecutiveFailures >= maxConsecutiveFailures) {
              break;
            }
          }
        }
        console.log(`Provider ${provider.name} (${provider.id}): ${providerDatasetCount} datasets found`);
      }

      console.log("Total datasets found:", allClientDatasets.length);
      console.log("Datasets by provider:", allClientDatasets.reduce((acc, d) => {
        acc[d.provider?.name || 'Unknown'] = (acc[d.provider?.name || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));

      return { datasets: allClientDatasets };
    },
    staleTime: 10000, // 10 seconds - faster cache invalidation
    refetchInterval: 15000, // 15 seconds - more frequent auto-refresh
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  });
};
