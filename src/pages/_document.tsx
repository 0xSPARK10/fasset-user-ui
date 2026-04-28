import { Html, Head, Main, NextScript } from "next/document";
import { ColorSchemeScript } from "@mantine/core";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <ColorSchemeScript defaultColorScheme="auto" />
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <body>
                <script dangerouslySetInnerHTML={{ __html: `
                    (function() {
                        var SWALLOWED = ['Request expired', 'user rejected action', 'ACTION_REJECTED', 'ethers-user-denied'];
                        window.addEventListener('unhandledrejection', function(e) {
                            var msg = (e.reason && e.reason.message) ? e.reason.message : String(e.reason || '');
                            if (SWALLOWED.some(function(s) { return msg.indexOf(s) !== -1; })) {
                            console.log("error ", msg);    
                            e.preventDefault();
                            }
                        }, true);
                    })();
                ` }} />
                <Main/>
                <NextScript />
            </body>
        </Html>
    );
}
