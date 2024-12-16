import { Modal, ModalProps, Divider } from "@mantine/core";
import React from "react";
import { useMediaQuery } from "@mantine/hooks";

interface IFAssetModal extends ModalProps {
    children: React.ReactNode;
}

const FAssetModal: React.FC<IFAssetModal> & {
    Body: React.FC<{ children: React.ReactNode }>;
    Footer: React.FC<{ children: React.ReactNode }>;
} = ({ children, ...props }) => {
    const mediaQueryMatches = useMediaQuery('(max-width: 640px)');

    return (
        <Modal
            fullScreen={mediaQueryMatches}
            removeScrollProps={{ allowPinchZoom: true }}
            {...props}
        >
            {React.Children.toArray(children).filter(child => React.isValidElement(child) && child.type === FAssetModal.Body)}
            {React.Children.toArray(children).filter(child => React.isValidElement(child) && child.type === FAssetModal.Footer).length > 0 &&
                <Divider
                    className="my-8"
                    styles={{
                        root: {
                            marginLeft: '-1rem',
                            marginRight: '-1rem'
                        }
                    }}
                />
            }
            {React.Children.toArray(children).filter(child => React.isValidElement(child) && child.type === FAssetModal.Footer)}
        </Modal>
    );
};

const Body = ({ children }: { children: React.ReactNode }) => (
    <div className="px-0 sm:px-7">
        {children}
    </div>
);

const Footer = ({ children }: { children: React.ReactNode }) => (
    <div className="px-0 sm:px-7 pb-3">
        {children}
    </div>
);

Body.displayName = 'FAssetModal.Body';
Footer.displayName = 'FAssetModal.Footer';

FAssetModal.Body = Body;
FAssetModal.Footer = Footer;

export default FAssetModal;


