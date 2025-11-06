import type { Config, Results } from './types';

// Make PyScript available globally
declare global {
  interface Window {
    pyscript: any;
  }
}

export function initializePyScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const TIMEOUT_MS = 180000; // 3 minutes

    // 1. Check if PyScript is already ready to prevent race conditions.
    // PyScript adds the 'py-ready' class to the <html> element when it's done.
    if (document.documentElement.classList.contains('py-ready')) {
      return resolve();
    }

    let timeoutId: number;

    // 2. If not ready, set up the event listener.
    const readyListener = () => {
      clearTimeout(timeoutId); // Clear the timeout since we succeeded.
      resolve();
    };
    window.addEventListener('py:ready', readyListener, { once: true });

    // 3. Set up a timeout as a fallback.
    timeoutId = window.setTimeout(() => {
      window.removeEventListener('py:ready', readyListener); // Clean up listener
      reject(new Error(`PyScript failed to initialize within ${TIMEOUT_MS / 1000} seconds. This can happen on a slow network connection. Please try reloading the page.`));
    }, TIMEOUT_MS);
  });
}

export async function* runPythonScript(config: Config): AsyncGenerator<string, Results, unknown> {
  if (!window.pyscript) {
    throw new Error("PyScript is not initialized.");
  }
  
  const outputElement = document.getElementById('py-terminal');
  if (!outputElement) {
    throw new Error("PyScript output element not found.");
  }
  
  // Clear previous output
  outputElement.innerHTML = '';
  let finalResults: Results | null = null;
  let scriptError: Error | null = null;

  const promise = new Promise<Results>((resolve, reject) => {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    const textContent = node.textContent || '';
                    if (textContent.startsWith("RESULTS_JSON:")) {
                        try {
                            const jsonString = textContent.substring("RESULTS_JSON:".length);
                            finalResults = JSON.parse(jsonString);
                            resolve(finalResults as Results);
                        } catch (e) {
                            scriptError = e as Error;
                            reject(scriptError);
                        }
                    }
                });
            }
        }
    });

    observer.observe(outputElement, { childList: true, subtree: true });

    // Create and run the script
    const pyScriptTag = document.createElement('py-script');
    
    // Pass config to Python by setting a global JS variable
    (window as any).config_json_string = JSON.stringify(config);
    
    pyScriptTag.setAttribute('output', 'py-terminal');
    pyScriptTag.innerHTML = `
import instagram_monitor
instagram_monitor.run_from_web()
    `;
    
    pyScriptTag.addEventListener('py:done', () => {
        observer.disconnect();
        if (finalResults) {
            resolve(finalResults);
        } else {
             // Script finished without sending results, probably an error occurred during execution
            const errorLog = outputElement.innerText;
            reject(new Error(`Script finished unexpectedly. Check logs for errors. Log snapshot: ${errorLog.slice(-500)}`));
        }
    });

     pyScriptTag.addEventListener('py:error', (e) => {
        observer.disconnect();
        reject(new Error(`A Python error occurred during execution.`));
     });
    
    document.body.appendChild(pyScriptTag);
  });
  
  // Yield logs as they come in
  let lastProcessedContent = '';
  while (!finalResults && !scriptError) {
      // Await a short time to allow new logs to appear
      await new Promise(res => setTimeout(res, 100));
      const currentContent = outputElement.innerText;
      if (currentContent.length > lastProcessedContent.length) {
          const newText = currentContent.substring(lastProcessedContent.length);
          const newLines = newText.split('\n').filter(line => line.trim() !== '');
          for(const line of newLines) {
              if (line.startsWith("RESULTS_JSON:")) {
                  // This will be handled by the observer, but we stop yielding here
                  break;
              }
              yield line;
          }
          lastProcessedContent = currentContent;
      }
      
      // Check if promise is settled
      const status = await Promise.race([promise, Promise.resolve('pending')]);
      if (status !== 'pending') break;
  }
  
  // Wait for the final result from the promise
  try {
      return await promise;
  } catch(e) {
      yield `[CRITICAL] Frontend runner error: ${(e as Error).message}`;
      // Return a default/empty result object on failure
       return {
          newFollowers: { target: '', users: [] },
          newFollowing: { target: '', users: [] },
          unfollowedBy: { target: '', users: [] },
          unfollowedYou: { target: '', users: [] },
          notFollowingYouBack: { target: '', users: [] },
          mutualFollowing: { target: '', users: [] },
          downloadedMediaCount: 0,
          outputZipBase64: '',
          generatedFiles: [],
       };
  }
}
