import { IDirectMintingInfo, IMintingCapInfo } from "@/types";

// Direct minting fee parameters in whole units (the API sends UBA strings)
export interface MintingParams {
    feeBips: number;
    minimumFee: number;
    executorFee: number;
}

export class MintingInfoMapper {
    static toParams(info: IDirectMintingInfo, decimals: number = 6): MintingParams {
        const unit = 10 ** decimals;
        return {
            feeBips: Number(info.mintingFeeBIPS ?? 0),
            minimumFee: Number(info.minimumMintingFeeUBA ?? 0) / unit,
            executorFee: Number(info.fassetsExecutorFee ?? 0) / unit,
        };
    }
}

export class MintCapMapper {
    // FAssets left under the mint cap; Infinity = no cap (missing info or "0" from the API)
    static remaining(cap?: IMintingCapInfo): number {
        if (!cap || cap.mintingCap === "0") return Infinity;
        return Number(BigInt(cap.mintingCap) - BigInt(cap.totalSupply)) / 1e6;
    }
}
