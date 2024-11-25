(function () {
  if (window.__notionInterceptorInjected) return;
  window.__notionInterceptorInjected = true;

  const originalFetch = window.fetch;
  const requestStatuses = new Map();

  window.fetch = async function (...args) {
    const [resource, config] = args;
    if (resource.includes('loadCachedPageChunkV2')) {
      requestStatuses.set(resource, 'pending');
      try {
        const response = await originalFetch.apply(this, args);
        requestStatuses.set(resource, 'success');
        const clone = response.clone();
        clone.json().then((data) => {
          window.postMessage(
            {
              type: 'notionDataCaptured',
              detail: {
                url: location.href,
                data,
                timestamp: new Date().toISOString(),
                status: 'normal',
              },
            },
            '*'
          );
        });
        return response;
      } catch (error) {
        requestStatuses.set(resource, 'cancelled');
        throw error;
      }
    }
    return originalFetch.apply(this, args);
  };

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (
        entry.name.includes('loadCachedPageChunkV2') &&
        (requestStatuses.get(entry.name) === 'cancelled' ||
          entry.transferSize === 0)
      ) {
        const pageId = extractPageId(location.href);
        if (!pageId) return;

        requestStatuses.delete(entry.name);
        fetch(entry.name, {
          method: 'POST',
          headers: {
            accept: '*/*',
            'content-type': 'application/json',
            'notion-audit-log-platform': 'web',
            'x-notion-active-user-header':
              document.cookie.match(/notion_user_id=([^;]+)/)?.[1] || '',
          },
          body: JSON.stringify({
            page: { id: pageId },
            limit: 30,
            cursor: { stack: [] },
            verticalColumns: false,
          }),
        });
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });

  function extractPageId(url) {
    const match = url.match(/([a-f0-9]{32})/);
    return match
      ? match[1].replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
      : null;
  }
})();
