import { motion } from "framer-motion";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/filora.png" alt="Filora" width={40} height={40} className="rounded-full" />
              <h3 className="text-2xl font-bold">Filora</h3>
            </div>
            <p className="text-sm opacity-90">
              Decentralized Digital Asset Marketplace on Filecoin blockchain.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-bold mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li><a href="/?tab=marketplace" className="hover:underline">Browse Assets</a></li>
              <li><a href="/?tab=upload" className="hover:underline">Upload Asset</a></li>
              <li><a href="/?tab=my-assets" className="hover:underline">My Assets</a></li>
              <li><a href="/?tab=storage" className="hover:underline">Storage</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li><a href="https://github.com/FilOzone/synapse-sdk" target="_blank" className="hover:underline">Synapse SDK</a></li>
              <li><a href="https://docs.secured.finance/usdfc-stablecoin/getting-started" target="_blank" className="hover:underline">USDFC Token</a></li>
              <li><a href="https://faucet.calibnet.chainsafe-fil.io/funds.html" target="_blank" className="hover:underline">Get tFIL</a></li>
              <li><a href="https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc" target="_blank" className="hover:underline">Get USDFC</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-bold mb-4">Community</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li><a href="https://github.com/mdlog/filora" target="_blank" className="hover:underline">GitHub</a></li>
              <li><a href="https://filecoin.io" target="_blank" className="hover:underline">Filecoin</a></li>
              <li><a href="https://docs.filecoin.io" target="_blank" className="hover:underline">Documentation</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-80">
            © 2025 Filora. Built with ❤️ on Filecoin.
          </p>
          <div className="flex items-center gap-4 text-sm opacity-80">
            <span>Powered by Synapse SDK</span>
            <span>•</span>
            <span>Filecoin Calibration Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
