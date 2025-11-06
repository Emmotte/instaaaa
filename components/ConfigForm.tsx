import React, { useState, useEffect } from 'react';
import type { Config } from '../types';
import { LogLevel } from '../types';
import { PlayIcon, RefreshCwIcon, LoaderIcon, XIcon, SettingsIcon, UsersIcon, DownloadCloudIcon, FileCodeIcon, BellIcon, BotIcon, ClockIcon } from './icons';

interface ConfigFormProps {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  onRun: () => void;
  onReset: () => void;
  isRunning: boolean;
}

const CollapsibleSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => (
    <details className="bg-slate-800 rounded-lg border border-slate-700/80" open={defaultOpen}>
        <summary className="cursor-pointer p-4 flex items-center justify-between list-none text-slate-100 font-semibold text-lg hover:bg-slate-700/50 rounded-t-lg transition-colors">
            <div className="flex items-center space-x-3">
                <div className="text-sky-400">{icon}</div>
                <span>{title}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform details-open:rotate-180 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </summary>
        <div className="p-4 border-t border-slate-700/80 space-y-4">
            {children}
        </div>
    </details>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
        <input {...props} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition" />
    </div>
);

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
        <textarea {...props} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition" />
    </div>
);

const FormToggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm text-slate-300">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition ${checked ? 'bg-sky-500' : 'bg-slate-700'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`}></div>
        </div>
    </label>
);

const TagManager: React.FC<{ tags: string[]; setTags: (tags: string[]) => void; placeholder: string; label: string }> = ({ tags, setTags, placeholder, label }) => {
    const [newTag, setNewTag] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTag = newTag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setNewTag('');
        }
    };

    const handleRemove = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    return (
        <div>
             <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
            <form onSubmit={handleAdd} className="flex space-x-2">
                <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder={placeholder}
                    className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-500 transition-colors font-semibold">Add</button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
                {tags.map(tag => (
                    <div key={tag} className="flex items-center bg-slate-700 text-slate-200 text-sm rounded-full px-3 py-1">
                        <span>{tag}</span>
                        <button onClick={() => handleRemove(tag)} className="ml-2 text-slate-400 hover:text-red-400">
                            <XIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const NotificationManager: React.FC = () => {
    const [permission, setPermission] = useState('Notification' in window ? Notification.permission : 'denied');

    useEffect(() => {
        // This is to handle cases where permission is changed in browser settings outside the app
        const interval = setInterval(() => {
            if ('Notification' in window && Notification.permission !== permission) {
                setPermission(Notification.permission);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [permission]);

    const requestPermission = () => {
        if ('Notification' in window) {
            Notification.requestPermission().then(setPermission);
        }
    };

    if (permission === 'granted') {
        return <p className="text-sm text-green-400">✓ Browser notifications are enabled.</p>;
    }

    if (permission === 'denied') {
        return <p className="text-sm text-red-400">✗ Browser notifications are blocked. Please enable them in your browser settings.</p>;
    }

    return (
        <button onClick={requestPermission} className="w-full text-center bg-slate-700 hover:bg-slate-600 transition-colors text-slate-200 text-sm font-semibold py-2 px-3 rounded-md">
            Enable Browser Notifications
        </button>
    );
};


export const ConfigForm: React.FC<ConfigFormProps> = ({ config, setConfig, onRun, onReset, isRunning }) => {
    const handleChange = <T extends keyof Config,>(key: T, value: Config[T]) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };
    
    return (
        <div className="space-y-6">
            <CollapsibleSection icon={<UsersIcon />} title="Authentication & Targets" defaultOpen>
                <div className="space-y-4">
                    <FormInput label="Your Instagram Username" value={config.username} onChange={(e) => handleChange('username', e.target.value)} />
                    <FormInput label="Your Instagram Password" type="password" value={config.password} onChange={(e) => handleChange('password', e.target.value)} />
                    <TagManager tags={config.targets} setTags={(v) => handleChange('targets', v)} label="Target Usernames" placeholder="Add target username" />
                </div>
            </CollapsibleSection>

            <CollapsibleSection icon={<DownloadCloudIcon />} title="Data Fetching & Downloads">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 bg-slate-900/40 p-3 rounded-lg border border-slate-700">
                         <h4 className="font-semibold text-slate-200">Data to Fetch</h4>
                         <FormToggle label="Get Followers" checked={config.getFollowers} onChange={(v) => handleChange('getFollowers', v)} />
                         <FormToggle label="Get Following" checked={config.getFollowing} onChange={(v) => handleChange('getFollowing', v)} />
                         <FormToggle label="Get More Post Details" checked={config.getMorePostDetails} onChange={(v) => handleChange('getMorePostDetails', v)} />
                    </div>
                     <div className="space-y-3 bg-slate-900/40 p-3 rounded-lg border border-slate-700">
                         <h4 className="font-semibold text-slate-200">Media to Download</h4>
                         <FormToggle label="Profile Pictures" checked={config.downloadProfilePictures} onChange={(v) => handleChange('downloadProfilePictures', v)} />
                         <FormToggle label="Stories" checked={config.downloadStories} onChange={(v) => handleChange('downloadStories', v)} />
                         <FormToggle label="Highlights" checked={config.downloadHighlights} onChange={(v) => handleChange('downloadHighlights', v)} />
                         <FormToggle label="Posts" checked={config.downloadPosts} onChange={(v) => handleChange('downloadPosts', v)} />
                    </div>
                 </div>
                 <div className="pt-4 mt-4 border-t border-slate-700">
                    <FormInput label="Max Posts to Download" type="number" min="0" value={config.maxPostsToDownload} onChange={(e) => handleChange('maxPostsToDownload', parseInt(e.target.value, 10) || 0)} />
                 </div>
            </CollapsibleSection>
            
            <CollapsibleSection icon={<FileCodeIcon />} title="Output & Logging">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="New Followers File" value={config.newFollowersFile} onChange={(e) => handleChange('newFollowersFile', e.target.value)} />
                    <FormInput label="New Following File" value={config.newFollowingFile} onChange={(e) => handleChange('newFollowingFile', e.target.value)} />
                    <FormInput label="Unfollowed By File" value={config.unfollowedByFile} onChange={(e) => handleChange('unfollowedByFile', e.target.value)} />
                    <FormInput label="Unfollowed You File" value={config.unfollowedYouFile} onChange={(e) => handleChange('unfollowedYouFile', e.target.value)} />
                    <FormInput label="Not Following Back File" value={config.notFollowingYouBackFile} onChange={(e) => handleChange('notFollowingYouBackFile', e.target.value)} />
                    <FormInput label="Mutual Following File" value={config.mutualFollowingFile} onChange={(e) => handleChange('mutualFollowingFile', e.target.value)} />
                    <FormInput label="Download Directory" value={config.downloadDir} onChange={(e) => handleChange('downloadDir', e.target.value)} />
                    <FormInput label="Database File" value={config.databaseFile} onChange={(e) => handleChange('databaseFile', e.target.value)} />
                    <FormInput label="CSV File" value={config.csvFile} onChange={(e) => handleChange('csvFile', e.target.value)} />
                    <FormInput label="Log File Name" value={config.logFile} onChange={(e) => handleChange('logFile', e.target.value)} />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-700">
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Log Level</label>
                        <select
                            value={config.logLevel}
                            onChange={(e) => handleChange('logLevel', e.target.value as LogLevel)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        >
                            {Object.values(LogLevel).map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <FormToggle label="Disable Logging to File" checked={config.disableLogging} onChange={(v) => handleChange('disableLogging', v)} />
                    </div>
                 </div>
            </CollapsibleSection>

            <CollapsibleSection icon={<BellIcon />} title="Notifications">
                <NotificationManager />
                <div className="pt-4 mt-4 border-t border-slate-700 space-y-3">
                    <FormToggle label="Notify on Status Changes" checked={config.statusNotification} onChange={(v) => handleChange('statusNotification', v)} />
                    <FormToggle label="Notify on New Followers" checked={config.followersNotification} onChange={(v) => handleChange('followersNotification', v)} />
                    <FormToggle label="Notify on Errors" checked={config.errorNotification} onChange={(v) => handleChange('errorNotification', v)} />
                </div>
            </CollapsibleSection>

            <CollapsibleSection icon={<ClockIcon />} title="Intervals & Timing">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="Check Interval (s)" type="number" min="0" value={config.instaCheckInterval} onChange={(e) => handleChange('instaCheckInterval', parseFloat(e.target.value) || 0)} />
                     <FormInput label="Next Operation Delay (s)" type="number" min="0" step="0.1" value={config.nextOperationDelay} onChange={(e) => handleChange('nextOperationDelay', parseFloat(e.target.value) || 0)} />
                    <FormInput label="Random Sleep Low (s)" type="number" min="0" value={config.randomSleepDiffLow} onChange={(e) => handleChange('randomSleepDiffLow', parseFloat(e.target.value) || 0)} />
                    <FormInput label="Random Sleep High (s)" type="number" min="0" value={config.randomSleepDiffHigh} onChange={(e) => handleChange('randomSleepDiffHigh', parseFloat(e.target.value) || 0)} />
                    <FormInput label="Liveness Check Interval (s)" type="number" min="0" value={config.livenessCheckInterval} onChange={(e) => handleChange('livenessCheckInterval', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="pt-4 mt-4 border-t border-slate-700 space-y-4">
                     <FormToggle label="Check Posts in Specific Hours" checked={config.checkPostsInHoursRange} onChange={(v) => handleChange('checkPostsInHoursRange', v)} />
                     {config.checkPostsInHoursRange && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                             <FormInput label="Min Hour 1" type="number" min="0" max="23" value={config.minH1} onChange={(e) => handleChange('minH1', parseInt(e.target.value) || 0)} />
                             <FormInput label="Max Hour 1" type="number" min="0" max="23" value={config.maxH1} onChange={(e) => handleChange('maxH1', parseInt(e.target.value) || 0)} />
                             <FormInput label="Min Hour 2" type="number" min="0" max="23" value={config.minH2} onChange={(e) => handleChange('minH2', parseInt(e.target.value) || 0)} />
                             <FormInput label="Max Hour 2" type="number" min="0" max="23" value={config.maxH2} onChange={(e) => handleChange('maxH2', parseInt(e.target.value) || 0)} />
                        </div>
                     )}
                </div>
            </CollapsibleSection>

            <CollapsibleSection icon={<BotIcon />} title="Human Simulation">
                <FormToggle label="Enable Human-like Behavior" checked={config.beHuman} onChange={(v) => handleChange('beHuman', v)} />
                {config.beHuman && (
                     <div className="pt-4 mt-4 border-t border-slate-700 space-y-4">
                        <FormInput label="Daily Human Actions" type="number" min="0" value={config.dailyHumanHits} onChange={(e) => handleChange('dailyHumanHits', parseInt(e.target.value) || 0)} />
                        <TagManager tags={config.myHashtags} setTags={(v) => handleChange('myHashtags', v)} label="Hashtags to Browse" placeholder="Add hashtag" />
                        <FormToggle label="Verbose Human Simulation" checked={config.beHumanVerbose} onChange={(v) => handleChange('beHumanVerbose', v)} />
                     </div>
                )}
            </CollapsibleSection>

            <CollapsibleSection icon={<SettingsIcon />} title="Advanced Settings">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormToggle label="Skip Session Login" checked={config.skipSession} onChange={(v) => handleChange('skipSession', v)} />
                    <FormToggle label="Skip Followers" checked={config.skipFollowers} onChange={(v) => handleChange('skipFollowers', v)} />
                    <FormToggle label="Skip Followings" checked={config.skipFollowings} onChange={(v) => handleChange('skipFollowings', v)} />
                    <FormToggle label="Skip Story Details" checked={config.skipGettingStoryDetails} onChange={(v) => handleChange('skipGettingStoryDetails', v)} />
                    <FormToggle label="Skip Post Details" checked={config.skipGettingPostsDetails} onChange={(v) => handleChange('skipGettingPostsDetails', v)} />
                    <FormToggle label="Detect Profile Pic Change" checked={config.detectChangedProfilePic} onChange={(v) => handleChange('detectChangedProfilePic', v)} />
                </div>
                <div className="pt-4 mt-4 border-t border-slate-700 space-y-4">
                    <FormInput label="Local Timezone" value={config.localTimezone} onChange={(e) => handleChange('localTimezone', e.target.value)} />
                    <FormInput label="Empty Profile Pic File" value={config.profilePicFileEmpty} onChange={(e) => handleChange('profilePicFileEmpty', e.target.value)} />
                    <FormInput label="Imgcat Path" value={config.imgcatPath} onChange={(e) => handleChange('imgcatPath', e.target.value)} />
                </div>
                 <div className="pt-4 mt-4 border-t border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormToggle label="Enable HTTP Jitter" checked={config.enableJitter} onChange={(v) => handleChange('enableJitter', v)} />
                        <FormToggle label="Verbose Jitter" checked={config.jitterVerbose} onChange={(v) => handleChange('jitterVerbose', v)} />
                    </div>
                    <FormTextarea label="User Agent (Desktop)" value={config.userAgent} onChange={(e) => handleChange('userAgent', e.target.value)} />
                    <FormTextarea label="User Agent (Mobile)" value={config.userAgentMobile} onChange={(e) => handleChange('userAgentMobile', e.target.value)} />
                 </div>
                 <div className="pt-4 mt-4 border-t border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="Internet Check URL" value={config.checkInternetUrl} onChange={(e) => handleChange('checkInternetUrl', e.target.value)} />
                    <FormInput label="Internet Check Timeout (s)" type="number" min="0" value={config.checkInternetTimeout} onChange={(e) => handleChange('checkInternetTimeout', parseInt(e.target.value) || 0)} />
                 </div>
            </CollapsibleSection>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700">
                <button
                    onClick={onRun}
                    disabled={isRunning}
                    className="w-full flex items-center justify-center bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    {isRunning ? <LoaderIcon /> : <PlayIcon />}
                    <span className="ml-2">{isRunning ? 'Running...' : 'Start Monitoring'}</span>
                </button>
                <button
                    onClick={onReset}
                    disabled={isRunning}
                    className="w-full sm:w-auto flex items-center justify-center bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                    <RefreshCwIcon />
                    <span className="ml-2">Reset</span>
                </button>
            </div>
        </div>
    );
};