import { useMemo, useState } from "react";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { detectDependencies, sanitizeSandpackFiles } from "../utils/sandpackUtils";
import SandpackErrorMonitor from "./SandpackErrorMonitor";

const FullPagePreview = ({ files }) => {
  const [showErrorOverlay, setShowErrorOverlay] = useState(true);

  const sandpackFiles = useMemo(() => {
    if (!files) return {};
    const cleanFiles = sanitizeSandpackFiles(files);
    const spFiles = {};
    for (const [path, code] of Object.entries(cleanFiles)) {
      spFiles[path] = {
        code,
      };
    }
    return spFiles;
  }, [files]);

  const dependencies = useMemo(() => {
    if (!files) return {};
    return detectDependencies(files);
  }, [files]);

  return (
    <div className="h-screen w-screen bg-white overflow-hidden full-page-preview">
      <SandpackProvider
        template="react"
        files={sandpackFiles}
        customSetup={{ dependencies }}
        options={{
          recompileMode: "delayed",
          recompileDelay: 500,
          externalResources: [
            "https://cdn.tailwindcss.com",
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
          ],
          classes: {
            "sp-wrapper": "!h-screen !w-screen",
            "sp-layout": "!h-screen !w-screen",
            "sp-preview": "!h-screen !w-screen",
            "sp-preview-container": "!h-screen !w-screen",
            "sp-preview-iframe": "!h-screen !w-screen",
          },
          logLevel: 0,
        }}
        style={{ height: "100vh", width: "100vw" }}
        className="h-screen w-screen"
      >
        <SandpackErrorMonitor onErrorChange={setShowErrorOverlay} />
        <SandpackLayout
          style={{
            height: "100vh",
            width: "100vw",
            border: "none",
            borderRadius: 0,
            background: "transparent",
          }}
        >
          <SandpackPreview
            showNavigator={false}
            showRefreshButton={false}
            showOpenInCodeSandbox={false}
            showSandpackErrorOverlay={showErrorOverlay}
            style={{
              height: "100vh",
              width: "100vw",
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default FullPagePreview;