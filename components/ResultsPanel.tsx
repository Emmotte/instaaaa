import React, { useState, useEffect } from 'react';
import type { Results } from '../types';
import { LoaderIcon } from './icons';

interface ResultsPanelProps {
  results: Results | null;
  logs: string[];
  isRunning: boolean;
  targets: string[];
}

type Tab = 'logs' | 'changes' | 'downloads';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            active
                ? 'bg-slate-700 text-sky-400 border-b-2 border-sky-400'
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


export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, logs, isRunning, targets }) => {
    const [activeTab, setActiveTab] = useState<Tab>('logs');
    const logContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const renderContent = () => {
        if (isRunning) {
            return <LogsTab logs={logs} logContainerRef={logContainerRef} />;
        }
        if (!results && !isRunning && logs.length === 0) {
             return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="bg-slate-700/50 p-4 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 12h.01"/><path d="M12 2a10 10 0 1 0 10 10h0a10 10 0 0 0-10-10zM2 12a10 10 0 0 1 9-9.95V2.05a10 10 0 0 1 11 9.95H22A10 10 0 0 1 3.05 13H2.05A10 10 0 0 1 2 12zM12 22a10 10 0 0 1-9.95-9H2.05a10 10 0 0 1 9.95 11v-1.95A10 10 0 0 1 12 22z"/></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-300">Awaiting Task</h3>
                    <p className="text-slate-400 mt-2">Configure your settings on the left and click 'Start Monitoring' to see the results here.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'logs':
                return <LogsTab logs={logs} logContainerRef={logContainerRef} />;
            case 'changes':
                return results ? <ChangesTab results={results} /> : <p>No change data available.</p>;
            case 'downloads':
                return results ? <DownloadsTab count={results.downloadedMediaCount} /> : <p>No download data available.</p>;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl h-[80vh] flex flex-col">
            <div className="flex-shrink-0 border-b border-slate-700 px-4">
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
        if (!log) return 'text-slate-400';
        if (log.startsWith('[SUCCESS]')) return 'text-green-400';
        if (log.startsWith('[ERROR]')) return 'text-red-400';
        if (log.startsWith('[WARNING]')) return 'text-yellow-400';
        return 'text-slate-400';
    };

    return (
        <div ref={logContainerRef} className="bg-black/50 rounded-md h-full p-4 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
                log ? (
                    <p key={index} className={getLogColor(log)}>
                      <span className="text-slate-500 mr-2 select-none">{String(index + 1).padStart(3, ' ')}</span>
                      {log}
                    </p>
                ) : null
            ))}
        </div>
    );
};

const ChangesTab: React.FC<{ results: Results }> = ({ results }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-100">Follower Analysis for @{results.newFollowers.target}</h3>
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

const DownloadsTab: React.FC<{ count: number }> = ({ count }) => (
    <div>
        <h3 className="text-xl font-bold text-slate-100 mb-4">Downloaded Media ({count} items)</h3>
        {count > 0 ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-700 rounded-md overflow-hidden">
                        <img src={`https://picsum.photos/200/200?random=${i}`} alt={`Downloaded media ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        ) : (
             <p className="text-slate-500 italic">No media was downloaded in this run.</p>
        )}
    </div>
);
