// components/TldrawWebView.tsx - FIXED INFINITE LOOP
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { loadCanvas, saveCanvas } from "../lib/canvasStore";
import SequentialDonutLoader from "./Loader/SequentialDonutLoader";
interface TldrawWebViewProps {
  userId: string;
  canvasName: string;
  onCanvasSaved?: (data: any) => void;
  style?: any;
}

const TldrawWebView: React.FC<TldrawWebViewProps> = ({
  userId,
  canvasName,
  onCanvasSaved,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editorReady, setEditorReady] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [messageQueue, setMessageQueue] = useState<any[]>([]);

  // ✅ FIXED: Load canvas data ONCE on mount (no infinite loop)
  useEffect(() => {
    const loadCanvasData = async () => {
      if (!userId || !canvasName) {
        console.warn("❌ Cannot load canvas: missing userId or canvasName");
        return;
      }

      console.log("🔄 Loading canvas from database...", { userId, canvasName });

      try {
        const loaded = await loadCanvas(userId, canvasName);
        if (loaded && loaded.data) {
          console.log("✅ Canvas data loaded from database");
          setInitialData(loaded.data);
        } else {
          console.log(
            "ℹ️ No existing canvas found in database, starting fresh"
          );
        }
      } catch (error) {
        console.error("❌ Error loading canvas from database:", error);
      }
    };

    loadCanvasData();
  }, [userId, canvasName]); // ✅ FIXED: Removed enhancedSupabase from dependencies

  // Send queued messages when editor becomes ready
  useEffect(() => {
    if (editorReady && messageQueue.length > 0) {
      console.log(`Processing ${messageQueue.length} queued messages`);
      messageQueue.forEach((message) => {
        webViewRef.current?.postMessage(JSON.stringify(message));
      });
      setMessageQueue([]);
    }
  }, [editorReady, messageQueue]);

  // Safe message sending with queueing
  const sendMessageToWebView = useCallback(
    (message: any) => {
      if (editorReady && webViewRef.current) {
        console.log("Sending message immediately:", message.type);
        webViewRef.current.postMessage(JSON.stringify(message));
      } else {
        console.log("Queueing message:", message.type);
        setMessageQueue((prev) => [...prev, message]);
      }
    },
    [editorReady]
  );

  // ✅ Simple auto-save (increased interval to avoid JWT conflicts)
  useEffect(() => {
    if (!editorReady) return;

    const autoSaveInterval = setInterval(() => {
      console.log("🔄 Auto-saving canvas to database...");
      sendMessageToWebView({ type: "AUTO_SAVE_REQUEST" });
    }, 20000); // ✅ 20 seconds to avoid JWT refresh conflicts

    return () => clearInterval(autoSaveInterval);
  }, [editorReady, sendMessageToWebView]);

  // ✅ Simple save function
  const saveCanvasToDatabase = async (canvasData: any) => {
    if (!userId || !canvasName || !canvasData) {
      console.warn("❌ Cannot save canvas: missing data");
      return;
    }

    try {
      console.log("💾 Saving canvas to database...");
      const saved = await saveCanvas(userId, canvasName, canvasData);
      console.log("✅ Canvas saved to database successfully");
      onCanvasSaved?.(saved);
    } catch (error) {
      console.error("❌ Error saving canvas to database:", error);
      // ✅ Only show alert for non-JWT errors
      if (
        !error?.message?.includes("JWT") &&
        !error?.code?.includes("PGRST303")
      ) {
        Alert.alert("Save Error", "Failed to save canvas. Please try again.");
      }
    }
  };

  // ✅ Your working HTML content
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>tldraw Canvas</title>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #root { width: 100vw; height: 100vh; position: relative; }
    .tldraw__editor { width: 100% !important; height: 100% !important; }
    
    .loading { 
      position: fixed; 
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999; 
      background: #d9d9d9;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    
    /* Sequential Donut Loader Styles */
    .sequential-donut-loader {
      position: relative;
      width: 60px;
      height: 60px;
      margin: 0 auto 16px;
    }
    
    .loader-base {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: #000000;
      border-radius: 50%;
    }
    
    .loader-ball {
      position: absolute;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .loader-hole {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: #333333;
      border-radius: 50%;
    }
    
    .ball-top {
      top: 10px;
      left: calc(50% - 6.5px);
    }
    
    .ball-right {
      top: calc(50% - 6.5px);
      right: 10px;
    }
    
    .ball-bottom {
      bottom: 10px;
      left: calc(50% - 6.5px);
    }
    
    .ball-left {
      top: calc(50% - 6.5px);
      left: 10px;
    }
    
    /* Animation keyframes */
    @keyframes ballSequence {
      0% { transform: scale(1); }
      8% { transform: scale(1); }
      16% { transform: scale(1.1); }
      25% { transform: scale(1); }
      100% { transform: scale(1); }
    }
    
    @keyframes holeSequence {
      0% { transform: scale(0.62); }
      8% { transform: scale(0.62); }
      25% { transform: scale(0); }
      100% { transform: scale(0); }
    }
    
    /* Apply animations with delays */
    .ball-top {
      animation: ballSequence 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    
    .ball-top .loader-hole {
      animation: holeSequence 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    
    .ball-right {
      animation: ballSequence 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 1s;
    }
    
    .ball-right .loader-hole {
      animation: holeSequence 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 1s;
      transform: scale(0);
    }
    
    .ball-bottom {
      animation: ballSequence 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 2s;
    }
    
    .ball-bottom .loader-hole {
      animation: holeSequence 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 2s;
      transform: scale(0);
    }
    
    .ball-left {
      animation: ballSequence 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 3s;
    }
    
    .ball-left .loader-hole {
      animation: holeSequence 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 3s;
      transform: scale(0);
    }
    
    .loading-text { 
      font-size: 18px; 
      color: #000000; 
      margin-bottom: 8px; 
      text-align: center;
      font-weight: 500;
    }
    
    .loading-subtext { 
      font-size: 14px; 
      color: #000000; 
      text-align: center;
    }
  </style>

  <link rel="stylesheet" href="https://unpkg.com/tldraw@2.4.0/tldraw.css" />

  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@19.0.0",
      "react-dom": "https://esm.sh/react-dom@19.0.0",
      "react-dom/client": "https://esm.sh/react-dom@19.0.0/client",
      "react/jsx-runtime": "https://esm.sh/react@19.0.0/jsx-runtime",
      "tldraw": "https://esm.sh/tldraw@2.4.0?external=react,react-dom"
    }
  }
  </script>
</head>
<body>
  <div id="root">
    <div class="loading">
      <div class="sequential-donut-loader">
        <div class="loader-base"></div>
        <div class="loader-ball ball-top">
          <div class="loader-hole"></div>
        </div>
        <div class="loader-ball ball-right">
          <div class="loader-hole"></div>
        </div>
        <div class="loader-ball ball-bottom">
          <div class="loader-hole"></div>
        </div>
        <div class="loader-ball ball-left">
          <div class="loader-hole"></div>
        </div>
      </div>
      <div class="loading-text">Loading</div>
      <div class="loading-subtext">Setting up drawing canvas</div>
    </div>
  </div>

  <script type="module">
    let globalEditor = null;
    let isEditorReady = false;
    let initializationTimeout = null;
    let debugSteps = [];
    let startTime = Date.now();

    function addDebugStep(step, details) {
      if (details === undefined) details = '';
      const timestamp = Date.now() - startTime;
      const message = '[' + timestamp + 'ms] ' + step + ' ' + details;
      debugSteps.push(message);
      console.log('[DEBUG]', message);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'DEBUG_STEP',
          step: step,
          details: details,
          timestamp: timestamp
        }));
      }
      const loadingText = document.querySelector('.loading-subtext');
      if (loadingText) loadingText.textContent = step + '...';
    }

    // Handle errors
    window.onerror = function (msg, src, line, col, err) {
      const info = { msg: String(msg), src: src || '', line: line || 0, col: col || 0 };
      console.error('[tldraw] uncaught error', info);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
          type: 'INITIALIZATION_ERROR', 
          error: JSON.stringify(info), 
          debugSteps: debugSteps 
        }));
      }
    };

    addDebugStep('INIT_START', 'Starting tldraw initialization');

    // Set timeout for initialization
    initializationTimeout = setTimeout(function() {
      addDebugStep('TIMEOUT_REACHED', '10 second timeout reached');
      if (!isEditorReady) {
        showError('Initialization timeout - please check your connection');
      }
    }, 10000);

    async function initializeTldraw() {
      try {
        addDebugStep('MODULE_LOADING_START', 'Loading React and tldraw modules');

        // Load React
        const React = await import('react');
        addDebugStep('REACT_LOADED', 'React version: ' + (React.version || 'unknown'));

        // Load React DOM
        const ReactDomClient = await import('react-dom/client');
        const createRoot = ReactDomClient.createRoot;
        addDebugStep('STARTING..', 'React DOM client loaded');

        const tldrawModule = await import('tldraw');
        const Tldraw = tldrawModule.Tldraw;
        if (!Tldraw) throw new Error('Tldraw component not found');

        addDebugStep('TLDRAW_LOADED', 'Tldraw component loaded');
        
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
          initializationTimeout = null;
        }

        setupTldrawApp(React, createRoot, Tldraw);

      } catch (error) {
        addDebugStep('INITIALIZATION_ERROR', 'Error: ' + (error?.message || String(error)));
        console.error('[tldraw] Initialization failed:', error);
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
          initializationTimeout = null;
        }
        showError('Failed to load tldraw: ' + (error?.message || 'Unknown error'));
      }
    }

    function setupTldrawApp(React, createRoot, Tldraw) {
      try {
        const rootElement = document.getElementById('root');
        if (!rootElement) throw new Error('Root element not found');

        const root = createRoot(rootElement);
        addDebugStep('CREATE_ROOT_OK', 'React root created');

        function App() {
          const [mounted, setMounted] = React.useState(false);

          React.useEffect(() => {
            setMounted(true);
          }, []);

          const handleMount = React.useCallback((editor) => {
            addDebugStep('EDITOR_MOUNTED', 'Tldraw editor mounted');
            console.log('[tldraw] Editor ready');

            globalEditor = editor;
            isEditorReady = true;

            // Hide loading indicator
            const loadingEl = document.querySelector('.loading');
            if (loadingEl) loadingEl.style.display = 'none';

            // Notify React Native
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'EDITOR_READY', 
                debugSteps: debugSteps 
              }));
            }

            // ✅ Load initial data from database if available
            const initialData = ${JSON.stringify(initialData)};
            if (initialData && editor.store) {
              setTimeout(() => {
                try {
                  console.log('[tldraw] Loading initial data from database');
                  editor.store.loadSnapshot(initialData);
                  addDebugStep('INITIAL_DATA_LOADED', 'Database data loaded');
                } catch (e) {
                  console.error('[tldraw] Error loading initial data:', e);
                }
              }, 500);
            }
          }, []);

          if (!mounted) return null;

          return React.createElement('div', { 
            style: { width: '100vw', height: '100vh', position: 'relative' } 
          }, [
            React.createElement(Tldraw, { 
              onMount: handleMount, 
              key: 'tldraw' 
            })
          ]);
        }

        // ✅ Database save function
        window.saveCanvasToDatabase = function() {
          if (!isEditorReady || !globalEditor || !globalEditor.store) {
            console.warn('[tldraw] Store not ready for save');
            return;
          }
          try {
            const snapshot = globalEditor.store.getSnapshot();
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'SAVE_CANVAS_DB', 
                data: snapshot 
              }));
            }
          } catch (error) {
            console.error('[tldraw] Save failed:', error);
          }
        };

        // Handle messages from React Native
        function handleMessage(data) {
          if (!isEditorReady || !globalEditor) {
            console.warn('[tldraw] Received message but editor not ready:', data.type);
            return;
          }
          
          console.log('[tldraw] Handling message:', data.type);
          
          try {
            switch(data.type) {
              case 'LOAD_CANVAS':
                if (data.data && globalEditor.store) {
                  globalEditor.store.loadSnapshot(data.data);
                  console.log('[tldraw] Canvas data loaded');
                }
                break;
              case 'AUTO_SAVE_REQUEST':
              case 'MANUAL_SAVE_REQUEST':
                window.saveCanvasToDatabase();
                break;
              case 'ZOOM_TO_FIT':
                globalEditor.zoomToFit();
                break;
              case 'SET_TOOL':
                globalEditor.setCurrentTool(data.tool || 'draw');
                break;
              default:
                console.log('[tldraw] Unknown message type:', data.type);
            }
          } catch (error) {
            console.error('[tldraw] Message handling error:', error);
          }
        }

        // Message listeners
        document.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            handleMessage(data);
          } catch (e) {
            console.error('[tldraw] Message parse error:', e);
          }
        });

        window.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            handleMessage(data);
          } catch (e) {
            console.error('[tldraw] Message parse error:', e);
          }
        });

        // Render the app
        root.render(React.createElement(App));
        addDebugStep('APP_RENDERED', 'App rendered successfully');

      } catch (error) {
        console.error('[tldraw] Setup failed:', error);
        showError('Failed to setup tldraw');
      }
    }

    function showError(message) {
      const root = document.getElementById('root');
      root.innerHTML = 
        '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center;">' +
          '<div>' +
            '<h3>⚠️ ' + message + '</h3>' +
            '<button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px;">Retry</button>' +
          '</div>' +
        '</div>';
    }

    // Start initialization
    initializeTldraw();
  </script>
</body>
</html>
`;

  // ✅ Enhanced message handler
  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        console.log("[RN] Received from WebView:", data.type);

        switch (data.type) {
          case "DEBUG_STEP":
            console.log(`[WebView Debug] ${data.step}: ${data.details}`);
            break;

          case "EDITOR_READY":
            setIsLoading(false);
            setEditorReady(true);
            console.log("✅ tldraw editor is ready!");

            // Load initial data if available
            if (initialData) {
              setTimeout(() => {
                sendMessageToWebView({
                  type: "LOAD_CANVAS",
                  data: initialData,
                });
              }, 1000);
            }
            break;

          case "SAVE_CANVAS_DB":
            saveCanvasToDatabase(data.data);
            break;

          case "INITIALIZATION_ERROR":
            console.error("WebView initialization error:", data.error);
            setIsLoading(false);
            Alert.alert(
              "Loading Error",
              `Failed to load tldraw: ${data.error}`
            );
            break;

          default:
            console.log("Received message:", data.type);
        }
      } catch (error) {
        console.error("Error parsing WebView message:", error);
      }
    },
    [initialData, sendMessageToWebView, saveCanvasToDatabase]
  );

  // ✅ Prop validation
  if (!userId || !canvasName) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText} className="font-sftmedium">
          ❌ Cannot load canvas:{" "}
          {!userId ? "User not loaded" : "Canvas name missing"}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        onError={(error) => {
          console.error("WebView error:", error);
          setIsLoading(false);
        }}
        allowsInlineMediaPlaybook={true}
        mixedContentMode="compatibility"
        originWhitelist={["*"]}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <SequentialDonutLoader size="80px" ball="20px" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(226, 226, 226)",
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
  },
});

export default TldrawWebView;
