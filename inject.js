(function () {
  if (window.__notionInterceptorInjected) return;
  window.__notionInterceptorInjected = true;

  const originalFetch = window.fetch;
  const requestStatuses = new Map();
  let pendingResponses = {
    loadCachedPageChunkV2: null,
    getPublicPageData: null,
  };

  window.fetch = async function (...args) {
    const [resource, config] = args;

    if (
      resource.includes('loadCachedPageChunkV2') ||
      resource.includes('getPublicPageData')
    ) {
      requestStatuses.set(resource, 'pending');
      try {
        const response = await originalFetch.apply(this, args);
        requestStatuses.set(resource, 'success');
        const clone = response.clone();
        const data = await clone.json();

        if (resource.includes('loadCachedPageChunkV2')) {
          pendingResponses.loadCachedPageChunkV2 = data;
        } else {
          pendingResponses.getPublicPageData = data;
        }

        if (
          pendingResponses.loadCachedPageChunkV2 &&
          pendingResponses.getPublicPageData
        ) {
          window.postMessage(
            {
              type: 'notionDataCaptured',
              detail: {
                url: location.href,
                data: pendingResponses.loadCachedPageChunkV2,
                workspaceName: pendingResponses.getPublicPageData.spaceName,
                timestamp: new Date().toISOString(),
                status: 'normal',
              },
            },
            '*'
          );
          pendingResponses = {
            loadCachedPageChunkV2: null,
            getPublicPageData: null,
          };
        }
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
