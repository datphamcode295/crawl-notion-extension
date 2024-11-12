(function () {
  // Ensure we only inject once
  if (window.__notionInterceptorInjected) return;
  window.__notionInterceptorInjected = true;

  // Store original methods before any other scripts can modify them
  const originalFetch = window.fetch;
  const originalXHR = window.XMLHttpRequest.prototype.open;

  // Create a proxy for XMLHttpRequest
  window.XMLHttpRequest.prototype.open = function (method, url, ...args) {
    if (url.includes('loadCachedPageChunk')) {
      const originalOnLoad = this.onload;
      this.onload = function (...loadArgs) {
        try {
          const data = JSON.parse(this.responseText);
          console.log(data);

          window.postMessage(
            {
              type: 'notionDataCaptured',
              detail: {
                url,
                data,
                timestamp: new Date().toISOString(),
                requestType: 'xhr',
              },
            },
            '*'
          );
        } catch (error) {
          console.error('[Notion Interceptor] XHR Parse Error:', error);
        }

        if (originalOnLoad) {
          originalOnLoad.apply(this, loadArgs);
        }
      };
    }
    return originalXHR.apply(this, [method, url, ...args]);
  };

  // Create a proxy for fetch
  window.fetch = async function (...args) {
    const [resource, config] = args;

    if (resource.includes('loadCachedPageChunk')) {
      try {
        const response = await originalFetch.apply(this, args);
        const clone = response.clone();

        clone.json().then((data) => {
          window.postMessage(
            {
              type: 'notionDataCaptured',
              detail: {
                url: resource,
                data,
                timestamp: new Date().toISOString(),
                requestType: 'fetch',
              },
            },
            '*'
          );
        });

        return response;
      } catch (error) {
        console.error('[Notion Interceptor] Fetch Error:', error);
        throw error;
      }
    }

    return originalFetch.apply(this, args);
  };

  console.log(
    '[Notion Interceptor] Successfully injected request interceptors'
  );
})();
