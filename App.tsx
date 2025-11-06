import React, { useState, useCallback } from 'react';
import { ConfigForm } from './components/ConfigForm';
import { ResultsPanel } from './components/ResultsPanel';
import { Header } from './components/Header';
import type { Config, Results } from './types';
import { LogLevel } from './types';
import { DEFAULT_CONFIG, generateMockResults, generateMockLogStream } from './constants';

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [results, setResults] = useState<Results | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setResults(null);
    setLogs([]);

    const MOCK_LOG_STREAM = generateMockLogStream(config);
    const MOCK_RESULTS = generateMockResults(config);

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < MOCK_LOG_STREAM.length) {
        setLogs(prev => [...prev, MOCK_LOG_STREAM[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
        setResults(MOCK_RESULTS);
        setIsRunning(false);

        const hasError = MOCK_LOG_STREAM.some(l => l && l.startsWith('[ERROR]'));
        if (hasError && config.errorNotification) {
          sendNotification('Instagram Monitor Error', 'An error occurred during the run. Check logs for details.');
        } else if (!hasError && config.statusNotification) {
          sendNotification('Instagram Monitor Finished', 'Monitoring run completed successfully.');
        }
      }
    }, 400);
  }, [config]);

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
            />
          </div>
          <div className="lg:col-span-3">
            <ResultsPanel
              results={results}
              logs={logs}
              isRunning={isRunning}
              targets={config.targets}
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
