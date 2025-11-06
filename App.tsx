
import React, { useState, useCallback, useEffect } from 'react';
import { ConfigForm } from './components/ConfigForm';
import { ResultsPanel } from './components/ResultsPanel';
import { Header } from './components/Header';
import type { Config, Results } from './types';
import { DEFAULT_CONFIG } from './constants';
import { initializePyScript, runPythonScript } from './api';

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [results, setResults] = useState<Results | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [pyScriptState, setPyScriptState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let timerId: number | undefined;

    async function loadPyScript() {
      try {
        setLogs(prev => [...prev, '[INFO] Initializing Python runtime... This may take a few minutes.']);
        setLogs(prev => [...prev, '[INFO] This involves downloading Python and installing packages like "instaloader".']);
        
        timerId = window.setInterval(() => {
            setLogs(prev => [...prev, '[INFO] Still working on setup... please wait.']);
        }, 30000); // Log a message every 30 seconds

        await initializePyScript();
        
        if (timerId) window.clearInterval(timerId);

        setPyScriptState('ready');
        setLogs(prev => [...prev, '[SUCCESS] Python runtime ready.']);
      } catch (error) {
        if (timerId) window.clearInterval(timerId);
        console.error("PyScript initialization failed:", error);
        setPyScriptState('error');
        const errorMessage = error instanceof Error ? error.message : String(error);
        setLogs(prev => [...prev, `[CRITICAL] Failed to load Python runtime: ${errorMessage}`]);
      }
    }
    loadPyScript();

    return () => {
        if (timerId) window.clearInterval(timerId);
    };
  }, []);

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const handleRun = useCallback(async () => {
    if (pyScriptState !== 'ready') return;

    setIsRunning(true);
    setResults(null);
    setLogs([]);
    let hasError = false;

    try {
      const scriptRunner = runPythonScript(config);
      // FIX: Replaced the loop to correctly handle async generator return types. The previous structure
      // caused TypeScript to incorrectly infer the type of `logLine` inside the loop.
      // This `while(true)` structure ensures proper type narrowing for both yielded values and the final return value.
      while (true) {
        const { done, value } = await scriptRunner.next();
        if (done) {
          setResults(value);
          break;
        }

        const logLine = value;
        // FIX: Add a `typeof` check to ensure `logLine` is a string. The compiler was failing
        // to narrow the type from `string | Results`, causing errors on the following lines.
        if (typeof logLine === 'string' && logLine) { // Ensure logline is a non-empty string
          setLogs(prev => [...prev, logLine]);
          if (logLine.includes('[ERROR]')) {
            hasError = true;
          }
        }
      }


      if (hasError && config.errorNotification) {
        sendNotification('Instagram Monitor Error', 'An error occurred during the run. Check logs for details.');
      } else if (!hasError && config.statusNotification) {
        sendNotification('Instagram Monitor Finished', 'Monitoring run completed successfully.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setLogs(prev => [...prev, `[CRITICAL] Frontend Error: ${errorMessage}`]);
      if(config.errorNotification) {
        sendNotification('Instagram Monitor Failed', 'A critical error stopped the script. Check logs.');
      }
    } finally {
      setIsRunning(false);
    }
  }, [config, pyScriptState]);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setResults(null);
    setLogs([]);
    setIsRunning(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <ConfigForm
              config={config}
              setConfig={setConfig}
              onRun={handleRun}
              onReset={handleReset}
              isRunning={isRunning}
              pyodideState={pyScriptState}
            />
          </div>
          <div className="lg:col-span-3">
            <ResultsPanel
              results={results}
              logs={logs}
              isRunning={isRunning}
              targets={config.targets}
              pyodideState={pyScriptState}
            />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Instagram Monitor UI &copy; 2024. All rights reserved.</p>
      </footer>
    </div>
  );
}
