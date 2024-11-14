// Inject the interceptor script first
(function injectScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
})();

// Global state
let updateTimeout = null;
let lastEditTime = null;
let notionResponse = null;
// let contentObserver = null;

let hasLoggedPublic = false;
let callUpdateFirstTime = false
// store the timeout for checking if the page is public, to clear it when the page is changed
let checkIfPublicPageTimeOut = null
// variable to check if the url is changed
let lastUrl = '';
// max time to try to wait for checking if the page is public
let countTry = 0
const MAX_TRY = 20

// why for load complete
initialize()

function initialize() {
  if (document.readyState !== 'complete') {
    // wait for 0.1 second and check again
    setTimeout(initialize, 100);
    return
  }

  console.log('readyState is complete');
  const pageLoadObserver = new MutationObserver((mutations) => {
    const url = location.href;
    
    if (url !== lastUrl) {
      cleanup()
      waitForLoad();
      lastUrl = url;
    }
  });
  
  // Start observing the document with the configured parameters
  pageLoadObserver.observe(document.body, {
  childList: true,
  subtree: true
  });
}

function checkIfPublicPage(notionContent) {
    if (hasLoggedPublic) return;
    countTry++

    // Look for the specific text pattern
    const elements = document.querySelectorAll('.tx-uiregular-14-med');
    
    for (const element of elements) {
        const text = element.textContent;
        if (text && text.includes('This page is live on') && text.includes('notion.site')) {
            hasLoggedPublic = true;
            console.log('this is public');
            handleCrawling()
            // Set up content change observer
            const contentObserver = new MutationObserver(handleContentChange);
            contentObserver.observe(notionContent, {
                childList: true,
                subtree: true,
                characterData: true,
            });
            return;
        }
    }

    console.log('this is private');
    // re call it after 1 second in 10 times
    if(countTry < MAX_TRY){
      checkIfPublicPageTimeOut = setTimeout(() => {
        checkIfPublicPage(notionContent)
      }, 500);
    }
}

function handleContentChange(mutations) {
  if(!callUpdateFirstTime){
    callUpdateFirstTime = true
    return false
  }
  
  // Filter out non-content changes
  const hasContentChange = mutations.some(mutation => {
      // Check if it's a text content change
      if (mutation.type === 'characterData') {
          return true;
      }
      
      // Check for added or removed nodes that contain text
      if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          const removedNodes = Array.from(mutation.removedNodes);
          
          const hasTextChange = [...addedNodes, ...removedNodes].some(node => {
              // Check if the node is a text node or contains text
              return node.nodeType === Node.TEXT_NODE || 
                     (node.textContent && node.textContent.trim().length > 0);
          });
          
          return hasTextChange;
      }
      
      return false;
  });

  if (!hasContentChange) return;

  // Clear existing timeout if there is one
  if (updateTimeout) {
      clearTimeout(updateTimeout);
  }

  lastEditTime = Date.now();

  // Set new timeout
  updateTimeout = setTimeout(() => {
      const timeSinceLastEdit = Date.now() - lastEditTime;
      if (timeSinceLastEdit >= 3000) { // 10 seconds
        handleCrawling()
      }
  }, 3000);
}

// Wait for the page to be fully loaded
function waitForLoad() {
  const notionContent = document.querySelector('.notion-page-content');
  const isPageLoaded = document.readyState === 'complete';
  const notionTopBar = document.querySelector('.notion-topbar');
  
  if (notionContent && isPageLoaded && notionTopBar) {
    checkIfPublicPage(notionContent);
  } else {
    // If not loaded yet, wait and try again
    setTimeout(waitForLoad, 500);
  }
}


// cleanup and reset all the global variables when the page is changed
function cleanup(){
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
  }
  
  hasLoggedPublic = false;
  updateTimeout = null;
  lastEditTime = null;
  callUpdateFirstTime = false
  checkIfPublicPageTimeOut = null
  countTry = 0
}


async function handleCrawling() {
  try {
      // const [notionContent] = await Promise.all([
      //   waitForNotionContent(),
      //   waitForNotionResponse(),
      //   waitForCompleteLoad(),
      // ]);
  
      // if (!notionContent) {
      //   throw new Error('Failed to load Notion content');
      // }

    // Process elements after page is fully loaded and API response is available
    const markdown = processElements();
    console.log('Markdown:', markdown.join('\n\n'));

    // Set up observer for future changes
  } catch (error) {
    console.error('Error initializing:', error);
  }
}

/**
 * Page load and content waiting functions
 */
function waitForNotionContent() {
  return new Promise((resolve) => {
    function checkContent() {
      const notionContent = document.querySelector('.notion-page-content');
      if (notionContent) {
        resolve(notionContent);
      } else {
        requestAnimationFrame(checkContent);
      }
    }
    checkContent();
  });
}

function waitForCompleteLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve, { once: true });
    }
  });
}

async function waitForNotionResponse() {
  return new Promise((resolve) => {
    if (notionResponse) {
      resolve(notionResponse);
      return;
    }

    const messageListener = (event) => {
      if (event.data.type === 'notionDataCaptured') {
        notionResponse = event.data.detail.data;
        window.removeEventListener('message', messageListener);
        resolve(notionResponse);
      }
    };

    window.addEventListener('message', messageListener);
  });
}

/**
 * Content observation and change handling
 */

function handleContentChange() {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  lastEditTime = Date.now();

  updateTimeout = setTimeout(() => {
    const timeSinceLastEdit = Date.now() - lastEditTime;
    if (timeSinceLastEdit >= 10000) {
      handleCrawling();
    }
  }, 10000);
}

function elementToMarkdown(element) {
  const classToMarkdown = {
    'notion-header-block': () => `# ${element.textContent}`,
    'notion-sub_header-block': () => `## ${element.textContent}`,
    'notion-sub_sub_header-block': () => `### ${element.textContent}`,
    'notion-table-tbody-selectable': () =>
      htmlTableToMardownTable(element.innerHTML),
    'notion-bulleted_list-block': () => processingBulletList(element),
    'notion-numbered_list-block': () => `1. ${element.textContent}`,
    'notion-to_do-block': () => `- [ ] ${element.textContent}`,
    'notion-to_do-block-checked': () => `- [x] ${element.textContent}`,
    'notion-text-block': () => element.textContent,
    'notion-code-block': () => processingCodeBlock(element),
    'notion-quote-block': () => `> ${element.textContent}`,
    'notion-toggle-block': () => `> ${element.textContent}`,
    'notion-callout-block': () => `> ${element.textContent}`,
    'notion-divider-block': () => '---',
    'notion-equation-block': () => `$${element.textContent}$`,
    'notion-image-block': () => `![${element.textContent}](${element.src})`,
    'notion-video-block': () => `[![Video](${element.src})](${element.src})`,
    'notion-embed-block': () => `[![Embed](${element.src})](${element.src})`,
    'notion-file-block': () => `[![File](${element.src})](${element.src})`,
    'notion-pdf-block': () => `[![PDF](${element.src})](${element.src})`,
    'notion-bookmark-block': () =>
      `[![Bookmark](${element.src})](${element.src})`,
    'notion-link-preview-block': () =>
      `[![Link Preview](${element.src})](${element.src})`,
    'notion-tweet-block': () => `[![Tweet](${element.src})](${element.src})`,
    'notion-gist-block': () => `[![Gist](${element.src})](${element.src})`,
  };

  for (const [className, converter] of Object.entries(classToMarkdown)) {
    if (element.classList.contains(className)) {
      return converter();
    }
  }
  return '';
}

function processingBulletList(element) {
  const blockID = element.dataset.blockId;
  const bulletedBlock = notionResponse?.recordMap?.block[blockID];

  if (bulletedBlock) {
    const value = bulletedBlock.value.value.properties.title[0][0];
    return `- ${value}`;
  }
  return '- ' + element.textContent;
}

function processingCodeBlock(element) {
  const blockID = element.dataset.blockId;
  const codeBlock = notionResponse?.recordMap?.block[blockID];

  if (codeBlock) {
    const code = codeBlock.value.value.properties.title[0][0];
    return '```\n' + code + '\n```';
  }
  return element.innerHTML;
}

function cleanCellContent(text) {
  return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function htmlTableToMardownTable(htmlContent) {
  const container = document.createElement('div');
  container.innerHTML = htmlContent;

  const tables = container.getElementsByTagName('table');
  const markdownOutput = [];

  for (const table of tables) {
    const rows = table.getElementsByTagName('tr');
    const markdownRows = [];
    const maxColumnWidths = [];

    for (let i = 0; i < rows.length; i++) {
      const cells = [
        ...rows[i].getElementsByTagName('th'),
        ...rows[i].getElementsByTagName('td'),
      ];
      const markdownCells = cells.map((cell) => {
        let content = cleanCellContent(cell.textContent);
        const links = cell.getElementsByTagName('a');
        if (links.length > 0) {
          for (const link of links) {
            const text = cleanCellContent(link.textContent);
            const href = link.getAttribute('href');
            content = content.replace(text, `[${text}](${href})`);
          }
        }
        return content;
      });

      markdownCells.forEach((cell, index) => {
        maxColumnWidths[index] = Math.max(
          maxColumnWidths[index] || 0,
          cell.length
        );
      });

      markdownRows.push(markdownCells);
    }

    markdownRows.forEach((row, rowIndex) => {
      const formattedRow = row
        .map((cell, cellIndex) => cell.padEnd(maxColumnWidths[cellIndex], ' '))
        .join(' | ');

      markdownOutput.push(`| ${formattedRow} |`);

      if (rowIndex === 0) {
        const separator = maxColumnWidths
          .map((width) => '-'.repeat(width))
          .join(' | ');
        markdownOutput.push(`| ${separator} |`);
      }
    });

    markdownOutput.push('');
    markdownOutput.push('');
  }

  return markdownOutput.join('\n').replace(/\n+$/, '\n');
}

function processElements() {
  const elements = document.querySelectorAll('[data-block-id]');
  const elementMarkdown = [];
  for (const element of elements) {
    const markdown = elementToMarkdown(element);
    if (markdown) {
      elementMarkdown.push(markdown);
    }
  }
  return elementMarkdown;
}