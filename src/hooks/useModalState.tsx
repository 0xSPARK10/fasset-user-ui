import React, { createContext, useContext, useState } from "react";

type ModalStateType = {
    isMintModalActive: boolean;
    setIsMintModalActive: React.Dispatch<React.SetStateAction<boolean>>;
    isRedeemModalActive: boolean;
    setIsRedeemModalActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModalStateContext = createContext<ModalStateType | null>(null);

export const ModalStateProvider = ({ children }: React.PropsWithChildren<{ children: JSX.Element }>) => {
    const [isMintModalActive, setIsMintModalActive] = useState<boolean>(false);
    const [isRedeemModalActive, setIsRedeemModalActive] = useState<boolean>(false);

    return (
       <ModalStateContext.Provider
           value={{
               isMintModalActive: isMintModalActive,
               setIsMintModalActive: setIsMintModalActive,
               isRedeemModalActive: isRedeemModalActive,
               setIsRedeemModalActive: setIsRedeemModalActive
           }}
       >
           {children}
       </ModalStateContext.Provider>
    );
}

export function useModalState(): ModalStateType {
    const value = useContext(ModalStateContext);

    if (!value) {
        throw new Error('Must be used inside Modal state provider');
    }

    return value as NonNullable<ModalStateType>;
}
