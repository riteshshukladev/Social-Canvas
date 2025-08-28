// components/TldrawWebView.tsx - Fixed version with proper ESM loading
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface TldrawWebViewProps {
  onCanvasReady?: () => void;
  onCanvasSaved?: (data: any) => void;
  initialData?: any;
  showNativeToolbar?: boolean;
  style?: any;
}

const TldrawWebView: React.FC<TldrawWebViewProps> = ({
  onCanvasReady,
  onCanvasSaved,
  initialData,
  showNativeToolbar = true,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editorReady, setEditorReady] = useState(false);
  const [canvasData, setCanvasData] = useState(initialData);
  const [messageQueue, setMessageQueue] = useState<any[]>([]);

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

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  />
  <title>tldraw Canvas</title>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #root { width: 100vw; height: 100vh; position: relative; }
    .tldraw__editor { width: 100% !important; height: 100% !important; }
    .loading { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; text-align: center; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); min-width: 280px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #007AFF; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .loading-text { font-size: 16px; color: #333; margin-bottom: 8px; }
    .loading-subtext { font-size: 12px; color: #666; }
    .mobile-toolbar { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(255, 255, 255, 0.95); border-radius: 24px; padding: 8px 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); display: flex; gap: 8px; z-index: 1000; backdrop-filter: blur(10px); }
    .mobile-btn { background: #007AFF; color: white; border: none; border-radius: 16px; padding: 8px 12px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; min-width: 50px; user-select: none; }
    .mobile-btn.secondary { background: #6C7B7F; }
    .mobile-btn.danger { background: #FF3B30; }
    .error-container { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ff4444; color: white; padding: 30px; border-radius: 12px; text-align: center; max-width: 90%; z-index: 3000; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    .retry-btn { margin-top: 15px; padding: 10px 20px; background: white; color: #ff4444; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .fallback-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: crosshair; background: white; touch-action: none; }
  </style>

  <!-- tldraw styles (match the tldraw version used below) -->
  <link rel="stylesheet" href="https://unpkg.com/tldraw@2.4.0/tldraw.css" />

  <!-- Import map: force a single React 19 instance everywhere -->
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
      <div class="spinner"></div>
      <div class="loading-text">Loading tldraw...</div>
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
          timestamp: timestamp,
          allSteps: debugSteps
        }));
      }
      const loadingText = document.querySelector('.loading-subtext');
      if (loadingText) loadingText.textContent = step + '...';
    }

    // Report uncaught errors to RN
    window.onerror = function (msg, src, line, col, err) {
      try {
        const info = { msg: String(msg), src: src || '', line: line || 0, col: col || 0, stack: (err && err.stack) ? err.stack : '' };
        console.error('[tldraw] uncaught error', info);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'INITIALIZATION_ERROR', error: JSON.stringify(info), debugSteps: debugSteps }));
        }
      } catch (e) {
        console.error('[tldraw] window.onerror failed', e);
      }
    };

    addDebugStep('INIT_START', 'Starting ESM initialization');
    addDebugStep('BROWSER_CHECK', 'UA: ' + navigator.userAgent.substring(0, 50) + '...');

    if (!HTMLScriptElement.supports || !HTMLScriptElement.supports('importmap')) {
      addDebugStep('IMPORTMAP_UNSUPPORTED', 'Import maps not supported, this might cause issues');
    } else {
      addDebugStep('IMPORTMAP_SUPPORTED', 'Import maps are supported');
    }

    const supportsESModules = ('noModule' in HTMLScriptElement.prototype);
    addDebugStep('ES_MODULES_CHECK', supportsESModules ? 'ES modules supported' : 'ES modules NOT supported');

    initializationTimeout = setTimeout(function() {
      addDebugStep('TIMEOUT_REACHED', '10 second timeout reached');
      if (!isEditorReady) {
        addDebugStep('SHOWING_FALLBACK', 'Initialization timeout, showing fallback canvas');
        showFallbackCanvas();
      }
    }, 10000);

    async function initializeTldraw() {
      try {
        addDebugStep('MODULE_LOADING_START', 'Starting module loading');

        try {
          addDebugStep('NETWORK_TEST', 'Testing network connectivity to esm.sh');
          const testResponse = await fetch('https://esm.sh/react@19.0.0', { method: 'HEAD' });
          addDebugStep('NETWORK_TEST_RESULT', 'Status: ' + testResponse.status);
        } catch (networkError) {
          addDebugStep('NETWORK_ERROR', 'Network test failed: ' + (networkError && networkError.message ? networkError.message : String(networkError)));
        }

        addDebugStep('REACT_IMPORT_START', 'Loading React module');
        const React = await Promise.race([
          import('react'),
          new Promise(function(_, reject){ setTimeout(function(){ reject(new Error('React import timeout')); }, 5000); })
        ]);
        addDebugStep('REACT_LOADED', 'React version: ' + (React.version || 'unknown'));

        addDebugStep('REACT_DOM_IMPORT_START', 'Loading React DOM client');
        const ReactDomClient = await Promise.race([
          import('react-dom/client'),
          new Promise(function(_, reject){ setTimeout(function(){ reject(new Error('ReactDOM import timeout')); }, 5000); })
        ]);
        const createRoot = ReactDomClient.createRoot;
        addDebugStep('REACT_DOM_LOADED', 'React DOM client loaded');

        addDebugStep('TLDRAW_IMPORT_START', 'Loading tldraw module');
        const tldrawModule = await Promise.race([
          import('tldraw').catch(function(tldrawError){
            addDebugStep('TLDRAW_IMPORT_ERROR', 'Tldraw import failed: ' + (tldrawError && tldrawError.message ? tldrawError.message : String(tldrawError)));
            throw tldrawError;
          }),
          new Promise(function(_, reject){ setTimeout(function(){ reject(new Error('Tldraw import timeout')); }, 8000); })
        ]);

        addDebugStep('TLDRAW_MODULE_CHECK', 'Tldraw module keys: ' + Object.keys(tldrawModule).slice(0, 10).join(', '));
        const Tldraw = tldrawModule.Tldraw;
        if (!Tldraw) throw new Error('Tldraw component not found in module');

        addDebugStep('TLDRAW_LOADED', 'Tldraw component type: ' + (typeof Tldraw));
        if (initializationTimeout) { clearTimeout(initializationTimeout); initializationTimeout = null; addDebugStep('TIMEOUT_CLEARED', 'Cleared initialization timeout'); }

        addDebugStep('SETUP_START', 'Starting tldraw app setup');
        setupTldrawApp(React, createRoot, Tldraw);

      } catch (error) {
        addDebugStep('INITIALIZATION_ERROR', 'Error: ' + (error && error.message ? error.message : String(error)));
        addDebugStep('ERROR_STACK', error && error.stack ? error.stack.substring(0, 200) : 'No stack trace');
        console.error('[tldraw] ESM loading failed:', error);
        if (initializationTimeout) { clearTimeout(initializationTimeout); initializationTimeout = null; }
        setTimeout(function(){ addDebugStep('SHOWING_FALLBACK_ERROR', 'Showing fallback due to error'); showFallbackCanvas(); }, 2000);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'INITIALIZATION_ERROR',
            error: (error && error.message) ? error.message : String(error),
            stack: error && error.stack ? error.stack : '',
            debugSteps: debugSteps
          }));
        }
      }
    }

    function setupTldrawApp(React, createRoot, Tldraw) {
      try {
        addDebugStep('APP_CREATE_ROOT_START', 'Looking for #root and creating root');
        const rootElement = document.getElementById('root');
        if (!rootElement) {
          addDebugStep('NO_ROOT_ELEMENT', 'document.getElementById("root") returned null');
          throw new Error('Root element not found');
        }

        var root;
        try {
          root = createRoot(rootElement);
          addDebugStep('CREATE_ROOT_OK', 'createRoot succeeded');
        } catch (err) {
          addDebugStep('CREATE_ROOT_ERROR', err && err.message ? err.message : String(err));
          throw err;
        }

        function App() {
          const mountedRef = React.useRef(false);
          const [mounted, setMounted] = React.useState(false);

          React.useEffect(function() {
            addDebugStep('APP_MOUNTED', 'App effect ran and setMounted(true)');
            mountedRef.current = true;
            setMounted(true);
          }, []);

          const handleMount = React.useCallback(function(editor) {
            addDebugStep('EDITOR_MOUNTED', 'Editor onMount called');
            console.log('[tldraw] Editor mounted and ready');

            globalEditor = editor;
            isEditorReady = true;

            try {
              editor.setCurrentTool('draw');
              addDebugStep('EDITOR_CONFIGURED', 'Editor tool set to draw');
            } catch (e) {
              console.error('[tldraw] Error configuring editor:', e);
              addDebugStep('EDITOR_CONFIG_ERROR', e && e.message ? e.message : String(e));
            }

            const loadingEl = document.querySelector('.loading');
            if (loadingEl) loadingEl.style.display = 'none';

            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EDITOR_READY', debugSteps: debugSteps }));
            }

            const initialData = ${JSON.stringify(initialData)};
            if (initialData && editor.store) {
              setTimeout(function(){
                try {
                  console.log('[tldraw] Loading initial data');
                  editor.store.loadSnapshot(initialData);
                  addDebugStep('INITIAL_DATA_LOADED', 'Loaded initial snapshot');
                } catch (e) {
                  console.error('[tldraw] Error loading initial data:', e);
                  addDebugStep('INITIAL_DATA_ERROR', e && e.message ? e.message : String(e));
                }
              }, 500);
            }
          }, []);

          const handleError = React.useCallback(function(error) {
            console.error('[tldraw] Editor error:', error);
            addDebugStep('EDITOR_RUNTIME_ERROR', (error && error.message) ? error.message : String(error));
            showError('Editor initialization failed');
          }, []);

          if (!mounted) return null;

          return React.createElement('div', { style: { width: '100vw', height: '100vh', position: 'relative' } }, [
            React.createElement(Tldraw, { onMount: handleMount, onError: handleError, key: 'tldraw' }),
            
          ]);
        }

        // Export current drawing to SVG -> base64 back to RN
        window.exportCanvas = function() {
          if (!isEditorReady || !globalEditor) { console.warn('[tldraw] Editor not ready for export'); return; }
          try {
            globalEditor.getSvgString().then(function(svgString){
              if (svgString) {
                const base64 = btoa(unescape(encodeURIComponent(svgString)));
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXPORT_PNG', data: base64 }));
                }
              }
            }).catch(function(err){ console.error('[tldraw] Export error:', err); });
          } catch (error) { console.error('[tldraw] Export failed:', error); }
        };

        // Save snapshot back to RN
        window.saveCanvas = function() {
          if (!isEditorReady || !globalEditor || !globalEditor.store) { console.warn('[tldraw] Store not ready for save'); return; }
          try {
            const snapshot = globalEditor.store.getSnapshot();
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SAVE_CANVAS', data: snapshot }));
            }
          } catch (error) { console.error('[tldraw] Save failed:', error); }
        };

        // Clear current shapes
        window.clearCanvas = function() {
          if (!isEditorReady || !globalEditor) { console.warn('[tldraw] Editor not ready for clear'); return; }
          try {
            globalEditor.selectAll();
            globalEditor.deleteShapes(globalEditor.getSelectedShapeIds());
          } catch (error) { console.error('[tldraw] Clear failed:', error); }
        };

        // Messages from RN -> perform actions inside tldraw
        function handleMessage(data) {
          if (!isEditorReady || !globalEditor) { console.warn('[tldraw] Received message but editor not ready:', data.type); return; }
          console.log('[tldraw] Handling message:', data.type);
          try {
            switch(data.type) {
              case 'ADD_IMAGE': addImageToCanvas(data.base64, data.x, data.y); break;
              case 'ADD_TEXT': addTextToCanvas(data.text, data.x, data.y); break;
              case 'LOAD_CANVAS': loadCanvasData(data.data); break;
              case 'ZOOM_TO_FIT': globalEditor.zoomToFit(); break;
              case 'SET_TOOL': globalEditor.setCurrentTool(data.tool || 'draw'); break;
              default: console.log('[tldraw] Unknown message type:', data.type);
            }
          } catch (error) { console.error('[tldraw] Message handling error:', error); }
        }

        function addImageToCanvas(base64, x, y) {
          if (x === undefined) x = 100;
          if (y === undefined) y = 100;
          try {
            const assetId = globalEditor.createAssetId();
            const shapeId = globalEditor.createShapeId();
            globalEditor.createAssets([{
              id: assetId,
              type: 'image',
              typeName: 'asset',
              props: {
                name: 'image.png',
                src: 'data:image/png;base64,' + base64,
                w: 200, h: 200,
                mimeType: 'image/png',
                isAnimated: false
              }
            }]);
            globalEditor.createShapes([{
              id: shapeId, type: 'image', x: x, y: y, props: { w: 200, h: 200, assetId: assetId }
            }]);
            console.log('[tldraw] Image added successfully');
          } catch (error) { console.error('[tldraw] Add image error:', error); }
        }

        function addTextToCanvas(text, x, y) {
          if (x === undefined) x = 100;
          if (y === undefined) y = 100;
          try {
            const shapeId = globalEditor.createShapeId();
            globalEditor.createShapes([{
              id: shapeId,
              type: 'text',
              x: x,
              y: y,
              props: { text: text, size: 'l' }
            }]);
            console.log('[tldraw] Text added successfully');
          } catch (error) { console.error('[tldraw] Add text error:', error); }
        }

        function loadCanvasData(data) {
          try {
            if (data && globalEditor.store) {
              globalEditor.store.loadSnapshot(data);
              console.log('[tldraw] Canvas data loaded');
            }
          } catch (error) { console.error('[tldraw] Load canvas error:', error); }
        }

        // RN -> WebView message bridges
        document.addEventListener('message', function(event){
          try { const data = JSON.parse(event.data); handleMessage(data); } catch (e) { console.error('[tldraw] Message parse error:', e); }
        });
        window.addEventListener('message', function(event){
          try { const data = JSON.parse(event.data); handleMessage(data); } catch (e) { console.error('[tldraw] Message parse error:', e); }
        });

        // Render React app
        try {
          try {
            root.render(React.createElement(App));
            addDebugStep('APP_RENDERED', 'root.render() completed');
            console.log('[tldraw] App rendered successfully');
            if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'APP_RENDERED', debugSteps: debugSteps }));
          } catch (renderErr) {
            addDebugStep('ROOT_RENDER_ERROR', renderErr && renderErr.message ? renderErr.message : String(renderErr));
            console.error('[tldraw] root.render error', renderErr);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'INITIALIZATION_ERROR', error: (renderErr && renderErr.message) ? renderErr.message : String(renderErr), debugSteps: debugSteps }));
            }
            throw renderErr;
          }
        } catch (error) {
          console.error('[tldraw] Setup failed (outer)', error);
          showError('Failed to initialize drawing canvas');
        }

      } catch (error) {
        console.error('[tldraw] Setup outermost error:', error);
        showError('Failed to initialize drawing canvas');
      }
    }

    function showError(message) {
      const root = document.getElementById('root');
      root.innerHTML =
        '<div class="error-container">' +
          '<h3>⚠️ Loading Error</h3>' +
          '<p>' + message + '</p>' +
          '<p style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Switching to fallback canvas...</p>' +
          '<button class="retry-btn" onclick="location.reload()">Retry</button>' +
        '</div>';
      setTimeout(showFallbackCanvas, 2000);
    }

    function showFallbackCanvas() {
      addDebugStep('FALLBACK_START', 'Showing fallback HTML5 canvas');
      const root = document.getElementById('root');
      root.innerHTML =
        '<div style="display: flex; flex-direction: column; height: 100%; background: #f5f5f5;">' +
          '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; text-align: center; color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
            '<h3 style="margin: 0; font-size: 18px;">✏️ Drawing Canvas (Fallback)</h3>' +
            '<p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">Touch and drag to draw • Pinch to zoom</p>' +
          '</div>' +
          '<div style="flex: 1; position: relative; overflow: hidden;">' +
            '<canvas id="fallback-canvas" class="fallback-canvas"></canvas>' +
          '</div>' +
          '<div style="background: white; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0; box-shadow: 0 -2px 10px rgba(0,0,0,0.05);">' +
            '<button id="clear-btn" style="background: #ff4757; color: white; border: none; border-radius: 8px; padding: 12px 20px; margin: 0 8px; font-weight: 500; box-shadow: 0 2px 8px rgba(255,71,87,0.3);">🗑️ Clear</button>' +
            '<button id="save-btn" style="background: #007AFF; color: white; border: none; border-radius: 8px; padding: 12px 20px; margin: 0 8px; font-weight: 500; box-shadow: 0 2px 8px rgba(0,122,255,0.3);">💾 Save</button>' +
            '<button id="debug-btn" style="background: #28a745; color: white; border: none; border-radius: 8px; padding: 12px 20px; margin: 0 8px; font-weight: 500; box-shadow: 0 2px 8px rgba(40,167,69,0.3);">🐛 Debug</button>' +
          '</div>' +
        '</div>';
      addDebugStep('FALLBACK_DOM_SETUP', 'Fallback DOM structure created');
      setupFallbackCanvas();
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FALLBACK_READY', debugSteps: debugSteps }));
      }
      addDebugStep('FALLBACK_READY', 'Fallback canvas is ready');
    }

    function setupFallbackCanvas() {
      const canvas = document.getElementById('fallback-canvas');
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 120;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      let drawing = false, lastX = 0, lastY = 0;
      function startDrawing(x, y) { drawing = true; lastX = x; lastY = y; ctx.beginPath(); ctx.moveTo(x, y); }
      function draw(x, y) { if (!drawing) return; ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke(); lastX = x; lastY = y; }
      function stopDrawing() { drawing = false; }
      canvas.addEventListener('touchstart', function(e){ e.preventDefault(); const rect = canvas.getBoundingClientRect(); const x = e.touches[0].clientX - rect.left; const y = e.touches[0].clientY - rect.top; startDrawing(x, y); });
      canvas.addEventListener('touchmove', function(e){ e.preventDefault(); const rect = canvas.getBoundingClientRect(); const x = e.touches[0].clientX - rect.left; const y = e.touches[0].clientY - rect.top; draw(x, y); });
      canvas.addEventListener('touchend', function(e){ e.preventDefault(); stopDrawing(); });
      canvas.addEventListener('mousedown', function(e){ const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; startDrawing(x, y); });
      canvas.addEventListener('mousemove', function(e){ const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; draw(x, y); });
      canvas.addEventListener('mouseup', function(){ stopDrawing(); });
      document.getElementById('clear-btn').addEventListener('click', function(){ ctx.clearRect(0, 0, canvas.width, canvas.height); });
      document.getElementById('save-btn').addEventListener('click', function(){
        try {
          const imageData = canvas.toDataURL('image/png');
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SAVE_CANVAS', data: { fallbackImage: imageData } }));
        } catch (error) { console.error('Save fallback canvas error:', error); }
      });
      document.getElementById('debug-btn').addEventListener('click', function(){
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DEBUG_INFO', debugSteps: debugSteps, userAgent: navigator.userAgent, timestamp: Date.now() }));
      });
      addDebugStep('FALLBACK_CANVAS_READY', 'Fallback canvas fully ready');
    }

    addDebugStep('STARTING_INITIALIZATION', 'Calling initializeTldraw function (React 19)');
    initializeTldraw();
  </script>
</body>
</html>
`;

  // Enhanced message handler
  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        console.log("[RN] Received from WebView:", data.type);

        switch (data.type) {
          case "DEBUG_STEP":
            console.log(`[WebView Debug] ${data.step}: ${data.details}`);
            break;

          case "DEBUG_INFO":
            console.log("[WebView Debug] Full debug info:", data.debugSteps);
            console.log("[WebView Debug] User Agent:", data.userAgent);
            Alert.alert(
              "Debug Information",
              `Latest step: ${data.debugSteps[data.debugSteps.length - 1] || "None"}\n\nTotal steps: ${data.debugSteps.length}`,
              [
                { text: "OK", style: "default" },
                {
                  text: "Show All Steps",
                  onPress: () =>
                    console.log("All debug steps:", data.debugSteps),
                },
              ]
            );
            break;

          case "EDITOR_READY":
            setIsLoading(false);
            setEditorReady(true);
            console.log("✅ tldraw editor is ready!");
            onCanvasReady?.();
            break;

          case "FALLBACK_READY":
            setIsLoading(false);
            setEditorReady(true);
            console.log("✅ Fallback canvas is ready!");
            console.log("Debug steps leading to fallback:", data.debugSteps);
            onCanvasReady?.();
            break;

          case "EXPORT_PNG":
            handleExportPNG(data.data);
            break;

          case "SAVE_CANVAS":
            setCanvasData(data.data);
            onCanvasSaved?.(data.data);
            console.log("Canvas saved");
            Alert.alert("Success", "Canvas saved successfully!");
            break;

          case "INITIALIZATION_ERROR":
            console.error("WebView initialization error:", data.error);
            console.error("Error stack:", data.stack);
            console.log("Debug steps before error:", data.debugSteps);
            setIsLoading(false);
            Alert.alert(
              "Loading Error",
              `Failed to load tldraw: ${data.error}\n\nUsing fallback canvas.`,
              [
                { text: "OK", style: "default" },
                {
                  text: "Show Debug",
                  onPress: () =>
                    console.log("Error debug steps:", data.debugSteps),
                },
              ]
            );
            break;

          default:
            console.log("Received message:", data);
        }
      } catch (error) {
        console.error("Error parsing WebView message:", error);
      }
    },
    [onCanvasReady, onCanvasSaved]
  );

  // Handle PNG export
  const handleExportPNG = async (base64SVG: string) => {
    try {
      const filename = `canvas_export_${Date.now()}.svg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, base64SVG, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Export Complete", `File saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Failed to export canvas");
    }
  };

  // Add image from device
  const addImageToCanvas = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        sendMessageToWebView({
          type: "ADD_IMAGE",
          base64: result.assets[0].base64,
          x: 200,
          y: 200,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add image");
    }
  };

  // Add text to canvas
  const addTextToCanvas = () => {
    Alert.prompt("Add Text", "Enter your text:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Add",
        onPress: (text) => {
          if (text && text.trim()) {
            sendMessageToWebView({
              type: "ADD_TEXT",
              text: text.trim(),
              x: 150,
              y: 150,
            });
          }
        },
      },
    ]);
  };

  // Load saved canvas
  const loadCanvas = () => {
    if (canvasData) {
      sendMessageToWebView({
        type: "LOAD_CANVAS",
        data: canvasData,
      });
    } else {
      Alert.alert("No Data", "No saved canvas data found");
    }
  };

  // Zoom to fit content
  const zoomToFit = () => {
    sendMessageToWebView({ type: "ZOOM_TO_FIT" });
  };

  // Set drawing tool
  const setDrawTool = () => {
    sendMessageToWebView({ type: "SET_TOOL", tool: "draw" });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    toolbar: {
      flexDirection: "row",
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: "#f8f9fa",
      borderBottomWidth: 1,
      borderBottomColor: "#e9ecef",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    button: {
      backgroundColor: "#007AFF",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 8,
      minWidth: 70,
      alignItems: "center",
    },
    secondaryButton: {
      backgroundColor: "#6C7B7F",
    },
    buttonText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    secondaryButtonText: {
      color: "white",
    },
    webview: {
      flex: 1,
      backgroundColor: "#fafafa",
      // fontFamily : ""
    },
    loadingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      zIndex: 1000,
    },
    loadingText: {
      fontSize: 16,
      color: "#666",
      marginBottom: 10,
    },
    debugText: {
      fontSize: 12,
      color: "#999",
      textAlign: "center",
      marginTop: 5,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {/* Native toolbar */}
      

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading drawing canvas...</Text>
          <Text style={styles.debugText}>Initializing tldraw with CJS...</Text>
        </View>
      )}

      {/* Enhanced WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        scrollEnabled={false}
        onMessage={handleWebViewMessage}
        onError={(error) => {
          console.error("WebView error:", error);
          setIsLoading(false);
        }}
        onLoadEnd={() => {
          console.log("WebView content loaded");
        }}
        onLoadStart={() => {
          console.log("WebView loading started");
        }}
        allowsInlineMediaPlayback={true} // ✅ Fixed typo: was "allowsInlineMediaPlaybook"
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        originWhitelist={["*"]}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default TldrawWebView;
