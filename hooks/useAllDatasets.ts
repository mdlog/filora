"use client";

import { useQuery } from "@tanstack/react-query";
import { PDPServer } from "@filoz/synapse-sdk";
import { DataSet } from "@/types";
import { useSynapse } from "@/providers/SynapseProvider";

export const useAllDatasets = () => {
  const { synapse, warmStorageService } = useSynapse();

  return useQuery({
    queryKey: ["all-datasets"],
    enabled: !!synapse && !!warmStorageService,
    queryFn: async () => {
      if (!synapse) throw new Error("Synapse not found");
      if (!warmStorageService) throw new Error("Warm storage service not found");

      const providerIds = await warmStorageService.getApprovedProviderIds();
      console.log("Approved provider IDs:", providerIds);

      const providers = await Promise.all(
        providerIds.map(async (providerId) => {
          try {
            return await synapse.getProviderInfo(providerId);
          } catch {
            return null;
          }
        })
      );

      const filteredProviders = providers.filter((p) => p !== null);
      console.log("Filtered providers:", filteredProviders.length);

      const allDatasets: DataSet[] = [];
      
      for (const provider of filteredProviders) {
        const serviceURL = provider.products.PDP?.data.serviceURL || "";
        if (!serviceURL) continue;
        
        try {
          const allDatasetInfos = await warmStorageService.getAllDataSetsWithDetails(provider.id);
          console.log(`Provider ${provider.id} has ${allDatasetInfos.length} datasets`);
          
          const pdpServer = new PDPServer(null, serviceURL);
          
          for (const datasetInfo of allDatasetInfos) {
            try {
              const data = await pdpServer.getDataSet(datasetInfo.pdpVerifierDataSetId);
              allDatasets.push({
                ...datasetInfo,
                provider,
                serviceURL,
                data,
                isLive: true,
              } as DataSet);
            } catch (error) {
              console.error(`Error fetching dataset ${datasetInfo.pdpVerifierDataSetId}:`, error);
            }
          }
        } catch (error) {
          console.error(`Error with provider ${provider.id}:`, error);
        }
      }

      console.log("Total datasets found:", allDatasets.length);
      return { datasets: allDatasets };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
};
