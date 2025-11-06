
import React, { useState, useEffect } from 'react';
import type { Results } from '../types';
import { DownloadCloudIcon, FileCodeIcon } from './icons';

interface ResultsPanelProps {
  results: Results | null;
  logs: string[];
  isRunning: boolean;
  targets: string[];
  pyodideState: 'loading' | 'ready' | 'error';
}

type Tab = 'logs' | 'changes' | 'downloads';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${
            active
                ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
        }`}
    >
        {children}
    </button>
);

const ResultList: React.FC<{ title: string; users: string[] }> = ({ title, users }) => (
    <div>
        <h4 className="text-md font-semibold text-sky-400 mb-2">{title} ({users.length})</h4>
        {users.length > 0 ? (
            <div className="bg-slate-800 rounded-md p-3 max-h-40 overflow-y-auto">
                <ul className="text-sm text-slate-300 space-y-1">
                    {users.map(user => <li key={user} className="font-mono">@{user}</li>)}
                </ul>
            </div>
        ) : (
            <p className="text-sm text-slate-500 italic">None found.</p>
        )}
    </div>
);


export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, logs, isRunning, targets, pyodideState }) => {
    const [activeTab, setActiveTab] = useState<Tab>('logs');
    const logContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);
    
     useEffect(() => {
        // Switch to logs tab automatically when a run starts
        if (isRunning) {
            setActiveTab('logs');
        }
        // Switch to changes tab when a run finishes and has results
        if (!isRunning && results) {
            setActiveTab('changes');
        }
    }, [isRunning, results]);

    const renderContent = () => {
        if (pyodideState === 'loading' || (isRunning && logs.length > 0) ) {
             return <LogsTab logs={logs} logContainerRef={logContainerRef} />;
        }
        
        if (!results && !isRunning && pyodideState === 'ready') {
            const hasRunLogs = logs.some(l => !l.includes('Python runtime') && !l.includes('Still working'));
            if (!hasRunLogs) {
                 return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="bg-slate-700/50 p-4 rounded-full mb-4">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-300">Python Environment Ready</h3>
                        <p className="text-slate-400 mt-2">Configure settings and click 'Start Monitoring' to run your script.</p>
                    </div>
                );
            }
        }
        
        switch (activeTab) {
            case 'logs':
                return <LogsTab logs={logs} logContainerRef={logContainerRef} />;
            case 'changes':
                return results ? <ChangesTab results={results} /> : <p className="text-slate-400 italic p-4">No follower change data from the last run.</p>;
            case 'downloads':
                return results ? <DownloadsTab results={results} /> : <p className="text-slate-400 italic p-4">No download data from the last run.</p>;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl h-[80vh] flex flex-col">
            <div className="flex-shrink-0 border-b border-slate-700 px-4 bg-slate-800/80 rounded-t-xl">
                <nav className="flex space-x-2">
                    <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>Logs</TabButton>
                    <TabButton active={activeTab === 'changes'} onClick={() => setActiveTab('changes')}>Follower Changes</TabButton>
                    <TabButton active={activeTab === 'downloads'} onClick={() => setActiveTab('downloads')}>Downloads</TabButton>
                </nav>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

const LogsTab: React.FC<{ logs: string[]; logContainerRef: React.RefObject<HTMLDivElement> }> = ({ logs, logContainerRef }) => {
    const getLogColor = (log: string) => {
        if (log.includes('[SUCCESS]')) return 'text-green-400';
        if (log.includes('[CRITICAL]') || log.includes('[ERROR]')) return 'text-red-400';
        if (log.includes('[WARNING]')) return 'text-yellow-400';
        if (log.includes('[DEBUG]')) return 'text-slate-500';
        return 'text-slate-400';
    };

    return (
        <div ref={logContainerRef} className="bg-black/50 rounded-md h-full p-4 overflow-y-auto font-mono text-sm leading-6">
            {logs.length > 0 ? logs.map((log, index) => (
                <div key={index} className="flex">
                  <span className="text-slate-600 mr-3 select-none text-right w-8">{String(index + 1).padStart(3, ' ')}</span>
                  <span className={`flex-1 ${getLogColor(log)} break-words whitespace-pre-wrap`}>{log}</span>
                </div>
            )) : <p className="text-slate-500 italic">Logs will appear here when you start a run.</p>}
        </div>
    );
};

const ChangesTab: React.FC<{ results: Results }> = ({ results }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-100">Follower Analysis for @{results.newFollowers.target || 'target'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResultList title="New Followers" users={results.newFollowers.users} />
            <ResultList title="New Following" users={results.newFollowing.users} />
            <ResultList title="Unfollowed By Target" users={results.unfollowedBy.users} />
            <ResultList title="Unfollowed You" users={results.unfollowedYou.users} />
            <ResultList title="Not Following You Back" users={results.notFollowingYouBack.users} />
            <ResultList title="Mutual Following" users={results.mutualFollowing.users} />
        </div>
    </div>
);

const DownloadsTab: React.FC<{ results: Results }> = ({ results }) => {
    const handleDownload = () => {
        if (!results.outputZipBase64) return;

        try {
            const byteCharacters = atob(results.outputZipBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/zip' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const target = results.newFollowers.target || 'instagram_monitor';
            const date = new Date().toISOString().split('T')[0];
            link.download = `results_${target}_${date}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Failed to decode or download zip file", error);
            // You could show an error to the user here
        }
    };
    
    const { downloadedMediaCount, generatedFiles } = results;
    const totalFiles = generatedFiles?.length ?? 0;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Downloads</h3>
            {results.outputZipBase64 ? (
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-6">
                        <div className="flex-shrink-0 text-sky-400 mb-4 sm:mb-0">
                           <DownloadCloudIcon className="w-16 h-16"/>
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                            <h4 className="text-lg font-semibold text-slate-100">All outputs have been archived.</h4>
                            <p className="text-slate-400 text-sm mt-1">
                                A zip file containing {totalFiles} files ({downloadedMediaCount} media items and {totalFiles - downloadedMediaCount} reports) is ready for download.
                            </p>
                        </div>
                        <div className="flex-shrink-0 mt-4 sm:mt-0 w-full sm:w-auto">
                            <button
                                onClick={handleDownload}
                                className="w-full sm:w-auto flex items-center justify-center bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-500 transition-colors"
                            >
                                <DownloadCloudIcon className="w-5 h-5" />
                                <span className="ml-2">Download Results (.zip)</span>
                            </button>
                        </div>
                    </div>
                     {generatedFiles && generatedFiles.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-700">
                            <h5 className="text-md font-semibold text-slate-300 mb-3">Archive Contents:</h5>
                            <div className="bg-slate-900/50 rounded-md p-3 max-h-48 overflow-y-auto font-mono text-xs text-slate-400">
                                {generatedFiles.map(file => <div key={file}>{file}</div>)}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-slate-500 italic">No downloadable files were generated in this run.</p>
            )}
        </div>
    );
};
