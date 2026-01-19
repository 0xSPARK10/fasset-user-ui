import { MantineProvider } from "@mantine/core";
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from "@mantine/modals";
import type { AppProps } from "next/app";
import type { NextComponentType } from "next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CookiesProvider } from "react-cookie";
import { defaultThemeOverride } from "@/config/theme";
import MainLayout from "@/components/layouts/MainLayout";
import { Web3Provider } from "@/hooks/useWeb3";
import { Web3ModalProvider } from "@/hooks/useWeb3Modal";
import { ModalStateProvider } from "@/hooks/useModalState";
import RouteGuard from "@/components/RouteGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import "@/config/i18n";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@/styles/globals.scss";
import "@mantine/charts/styles.css";

type CustomAppProps = AppProps & {
    Component: NextComponentType & { protected?: boolean }
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false
        },
    },
});

export default function App({ Component, pageProps }: CustomAppProps) {
    return (
        <MantineProvider
            theme={{...defaultThemeOverride}}
            forceColorScheme="light"
        >
            <Notifications />
            <QueryClientProvider client={queryClient}>
                <CookiesProvider>
                    <Web3Provider>
                        <Web3ModalProvider isProtected={Component.protected}>
                            <ModalsProvider>
                                <ModalStateProvider>
                                    <MainLayout>
                                        <ErrorBoundary>
                                            {Component.protected
                                                ? <RouteGuard>
                                                    <Component {...pageProps} />
                                                </RouteGuard>
                                                : <Component {...pageProps} />
                                            }
                                        </ErrorBoundary>
                                    </MainLayout>
                                </ModalStateProvider>
                            </ModalsProvider>
                        </Web3ModalProvider>
                    </Web3Provider>
                </CookiesProvider>
            </QueryClientProvider>
        </MantineProvider>
    );
}
