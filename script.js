document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('bookmark-container');
  const btnCard = document.getElementById('view-card');
  const btnColumn = document.getElementById('view-column');
  const colSettings = document.getElementById('column-settings-item');
  const colDecBtn = document.getElementById('col-dec');
  const colIncBtn = document.getElementById('col-inc');
  const colDisplay = document.getElementById('col-display');
  const importBtn = document.getElementById('import-btn');
  const importDropdown = document.getElementById('import-dropdown');
  const importFileTrigger = document.getElementById('import-file-trigger');
  const importBrowserTrigger = document.getElementById('import-browser-trigger');
  const importFile = document.getElementById('import-file');
  const addCategoryBtn = document.getElementById('add-category-btn');
  const lockBtn = document.getElementById('lock-btn');
  const menuBtn = document.getElementById('menu-btn');
  const mainMenu = document.getElementById('main-menu');
  const toggleTitlesBtn = document.getElementById('toggle-titles-btn');
  const titlesToggle = document.getElementById('titles-toggle');
  const toggleClockBtn = document.getElementById('toggle-clock-btn');
  const toggleDateBtn = document.getElementById('toggle-date-btn');
  
  if (menuBtn) {
      menuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          mainMenu.classList.toggle('hidden');
      });
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
          if (!mainMenu.contains(e.target) && e.target !== menuBtn) {
              mainMenu.classList.add('hidden');
          }
      });
  }

  // Import Dropdown Logic inside Menu (Duplicate removed)
  
  // Context Menu & Drag Variables (Moved to top)
  const ctxMenu = document.getElementById('context-menu');
  const ctxEdit = document.getElementById('ctx-edit');
  const ctxDelete = document.getElementById('ctx-delete');
  let currentCtxNode = null;
  let draggedCategoryNode = null;

  // Load Lock State

  // Load Lock State
  // Load Lock State
  // --- Settings & Sync Logic ---
  
  // Default Settings
  let isLocked = false;
  let showTitles = true;
  let showClock = true;
  let showDate = true;
  let accentColor = 'purple'; // New: Accent color theme
  let viewMode = 'card-view';
  let columnCount = 3;
  let titleAlign = 'left';

  // Helper to save setting
  function saveSetting(key, value) {
      chrome.storage.sync.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
              console.error("Sync Error:", chrome.runtime.lastError);
          }
      });
  }

  // Load Settings from Sync (Async)
  function loadSettings() {
      const keys = ['isLocked', 'showTitles', 'showClock', 'showDate', 'accentColor', 'viewMode', 'columnCount', 'titleAlign'];
      chrome.storage.sync.get(keys, (res) => {
          // Apply stored values or keep defaults
          if (res.isLocked !== undefined) isLocked = res.isLocked;
          if (res.showTitles !== undefined) showTitles = res.showTitles;
          if (res.showClock !== undefined) showClock = res.showClock;
          if (res.showDate !== undefined) showDate = res.showDate;
          if (res.accentColor !== undefined) accentColor = res.accentColor;
          if (res.viewMode !== undefined) viewMode = res.viewMode;
          if (res.columnCount !== undefined) columnCount = res.columnCount;
          if (res.titleAlign !== undefined) titleAlign = res.titleAlign;

          // Apply to UI
          updateLockState();
          updateTitlesState();
          updateClockState();
          updateDateState();
          updateAccentColor(); // New: Apply accent color theme
          updateViewModeUI();
          updateColumnCountUI();
          updateAlignUI();

          // Finally load bookmarks
          loadBookmarks();
      });
  }

  // --- Lock Mode Logic ---
  // Realtime Clock & Date
  function updateClock() {
      const now = new Date();
      const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
      const clockEl = document.getElementById('realtime-clock');
      if (clockEl) clockEl.textContent = timeString;
      
      // Update date (dd-mm-yy format)
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const dateString = `${day}-${month}-${year}`;
      const dateEl = document.getElementById('realtime-date');
      if (dateEl) dateEl.textContent = dateString;
  }
  setInterval(updateClock, 1000);
  updateClock(); // Initial call

  function updateLockState() {
      if (!lockBtn) return; // Safety check

      if (isLocked) {
          // lockBtn.textContent = "🔒 Locked"; // Removed to preserve SVG
          lockBtn.classList.add('locked');
          lockBtn.title = "Locked (Click to Unlock)";
          document.body.classList.add('locked-mode');
      } else {
          // lockBtn.textContent = "🔓 Unlocked"; // Removed to preserve SVG
          lockBtn.classList.remove('locked');
          lockBtn.title = "Unlocked (Click to Lock)";
          document.body.classList.remove('locked-mode');
      }
      // Re-render
      loadBookmarks(); 
  }
  
  // Call updateLockState safely
  if (lockBtn) {
      updateLockState();
  } else {
      // Fallback if button missing (shouldn't happen)
      loadBookmarks();
  }


  // ...

  // --- Event Listeners untuk Ganti Tampilan ---

  btnCard.addEventListener('click', () => {
    viewMode = 'card-view';
    saveSetting('viewMode', 'card-view'); 
    updateViewModeUI();
  });

  btnColumn.addEventListener('click', () => {
    viewMode = 'column-view';
    saveSetting('viewMode', 'column-view'); 
    updateViewModeUI();
  });

  // Titles Logic (State handled by loadSettings)
  function updateTitlesState() {
      if (showTitles) {
          titlesToggle.classList.add('active');
      } else {
          titlesToggle.classList.remove('active');
      }
      
      const links = document.querySelectorAll('#bookmark-container a');
      links.forEach(a => {
          if (showTitles) {
              a.title = a.dataset.title || "";
          } else {
              a.dataset.title = a.title;
              a.removeAttribute('title');
          }
      });
  }

  // --- Settings UI Helpers ---
  function updateClockState() {
      const clockToggle = document.getElementById('clock-toggle');
      const clockEl = document.getElementById('realtime-clock');
      if (showClock) {
          if(clockToggle) clockToggle.classList.add('active');
          if(clockEl) clockEl.classList.remove('hidden');
      } else {
          if(clockToggle) clockToggle.classList.remove('active');
          if(clockEl) clockEl.classList.add('hidden');
      }
  }

  function updateDateState() {
      const dateToggle = document.getElementById('date-toggle');
      const dateEl = document.getElementById('realtime-date');
      if (showDate) {
          if(dateToggle) dateToggle.classList.add('active');
          if(dateEl) dateEl.classList.remove('hidden');
      } else {
          if(dateToggle) dateToggle.classList.remove('active');
          if(dateEl) dateEl.classList.add('hidden');
      }
  }

  function updateAccentColor() {
      // Apply accent color theme to html element
      document.documentElement.setAttribute('data-accent', accentColor);
      
      // Update active swatch
      document.querySelectorAll('.color-swatch').forEach(btn => {
          btn.classList.remove('active');
          if (btn.dataset.color === accentColor) {
              btn.classList.add('active');
          }
      });
  }

  function updateViewModeUI() {
      const viewToggles = document.querySelector('.view-toggles');
      
      if (viewMode === 'card-view') {
          container.className = 'card-view';
          setActiveButton(btnCard);
          colSettings.classList.add('hidden');
          if (viewToggles) viewToggles.classList.remove('column-active');
          document.querySelectorAll('details').forEach(d => d.open = true);
      } else {
          container.className = 'column-view';
          setActiveButton(btnColumn);
          colSettings.classList.remove('hidden');
          if (viewToggles) viewToggles.classList.add('column-active');
          updateColumnCountUI();
      }
  }

  function updateColumnCountUI() {
      if(colDisplay) colDisplay.textContent = columnCount;
      document.documentElement.style.setProperty('--column-count', columnCount);
  }

  function updateAlignUI() {
      document.documentElement.style.setProperty('--title-align', titleAlign);
      // Update Buttons
      Object.values(alignBtns).forEach(btn => btn.classList.remove('active'));
      if (alignBtns[titleAlign]) alignBtns[titleAlign].classList.add('active');
  }

  // --- Toggle Listeners (Titles & Clock) ---
  if (toggleTitlesBtn) {
      toggleTitlesBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showTitles = !showTitles;
          saveSetting('showTitles', showTitles);
          updateTitlesState();
      });
  }

  if (toggleClockBtn) {
      toggleClockBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showClock = !showClock;
          saveSetting('showClock', showClock);
          updateClockState();
      });
  }

  if (toggleDateBtn) {
      toggleDateBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showDate = !showDate;
          saveSetting('showDate', showDate);
          updateDateState();
      });
  }

  // Color Picker Event Listeners
  document.querySelectorAll('.color-swatch').forEach(btn => {
      btn.addEventListener('click', (e) => {
          e.stopPropagation();
          accentColor = btn.dataset.color;
          saveSetting('accentColor', accentColor);
          updateAccentColor();
      });
  });

  // Initial Load
  loadSettings();

  // ... (Lock listeners)
  lockBtn.addEventListener('click', () => {
      isLocked = !isLocked;
      saveSetting('isLocked', isLocked);
      updateLockState();
  });

  const searchInput = document.getElementById('search-input');
  
  // Modal Elements
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalInput = document.getElementById('modal-input');
  const modalMessage = document.getElementById('modal-message');
  const modalConfirm = document.getElementById('modal-confirm');
  const modalCancel = document.getElementById('modal-cancel');
  
  let modalCallback = null;

  // --- Search Logic ---
  searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      
      const cards = document.querySelectorAll('.category-card');
      
      cards.forEach(card => {
          let hasVisibleBookmark = false;
          const links = card.querySelectorAll('li');
          const title = card.querySelector('summary span').textContent.toLowerCase();
          
          // Check bookmarks
          links.forEach(li => {
              const text = li.querySelector('.bookmark-text').textContent.toLowerCase();
              const url = li.querySelector('a').href.toLowerCase(); // Check URL too
              
              if (text.includes(term) || url.includes(term)) {
                  li.style.display = '';
                  hasVisibleBookmark = true;
              } else {
                  li.style.display = 'none';
              }
          });
          
          // Show Category if it matches Title OR contains visible bookmarks
          if (title.includes(term) || hasVisibleBookmark) {
               card.style.display = '';
               // If searching, open details to show matches
               if (term.length > 0) card.querySelector('details').open = true;
          } else {
               card.style.display = 'none';
          }
      });
  });

  // --- Modal Logic ---
  function openModal(options) {
      modalTitle.textContent = options.title;
      modalConfirm.textContent = options.confirmText || 'Confirm';
      
      // Reset classes
      modalConfirm.className = options.isDanger ? 'primary danger' : 'primary';
      
      // Setup Body
      if (options.type === 'input') {
          modalInput.value = '';
          modalInput.classList.remove('hidden');
          modalInput.placeholder = options.placeholder || '';
          modalMessage.classList.add('hidden');
          setTimeout(() => modalInput.focus(), 100);
      } else {
          modalInput.classList.add('hidden');
          modalMessage.textContent = options.message || '';
          modalMessage.classList.remove('hidden');
      }
      
      modalCallback = options.onConfirm;
      modalOverlay.classList.remove('hidden');
  }

  function closeModal() {
      modalOverlay.classList.add('hidden');
      modalCallback = null;
  }

  modalCancel.addEventListener('click', closeModal);
  modalConfirm.addEventListener('click', () => {
      if (modalCallback) {
          const value = modalInput.value;
          modalCallback(value);
      }
      closeModal();
  });
  
  // Close on Enter key in input
  modalInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') modalConfirm.click();
  });
  // Close on Outside Click
  modalOverlay.addEventListener('click', (e) => {
     if (e.target === modalOverlay) closeModal();
  });


  // --- Add Category Logic (Refactored) ---
  addCategoryBtn.addEventListener('click', () => {
      openModal({
          title: 'New Category',
          type: 'input',
          placeholder: 'Category Name (e.g., Work, Social)',
          confirmText: 'Create',
          onConfirm: (categoryName) => {
              if (categoryName && categoryName.trim() !== '') {
                  chrome.bookmarks.create({
                    parentId: '1',
                    title: categoryName
                  }, (newFolder) => {
                    if (chrome.runtime.lastError) {
                      alert("Error: " + chrome.runtime.lastError.message);
                    } else {
                      loadBookmarks();
                    }
                  });
              }
          }
      });
  });

  // --- Import Bookmarks Logic ---
  
  // Toggle Dropdown
  // Toggle Dropdown
  importBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Use 'active' check or just toggle class. 
    // Usually we use 'hidden' class for logic, but earlier CSS used .import-dropdown:not(.hidden) or similar?
    // Let's check styles. CSS uses .import-dropdown.hidden { display: none; } and .import-dropdown:not(.hidden) for viz.
    // Actually the previous JS used classList.toggle('show')?
    // Wait, let's check Step 435 output line 281: `importDropdown.classList.toggle('show');`
    // My updated CSS uses `.hidden`.
    // I should check if the toggle class matches what CSS expects.
    // CSS Step 389 uses `.import-dropdown:not(.hidden)`.
    // So JS should toggle 'hidden'.
    
    // BUT fixing the immediate bug first:
    // colSettings.classList.add('hidden'); <--- REMOVE THIS
    
    // Also fixing the class toggle to match CSS (hidden vs show)
    if (importDropdown.classList.contains('hidden')) {
        importDropdown.classList.remove('hidden');
    } else {
        importDropdown.classList.add('hidden');
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!importBtn.contains(e.target) && !importDropdown.contains(e.target)) {
        importDropdown.classList.add('hidden'); // Hide
    }
  });

  // Option 1: Import from HTML File
  importFileTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    importDropdown.classList.add('hidden'); // Hide
    importFile.click();
  });

  // Option 2: Import from Browser (Native Settings)
  // if (importBrowserTrigger) ...

  // Export to File
  const exportTrigger = document.getElementById('export-trigger');
  if (exportTrigger) {
      exportTrigger.addEventListener('click', (e) => {
          e.preventDefault();
          importDropdown.classList.add('hidden'); // Hide
          exportBookmarks();
      });
  }
  if (importBrowserTrigger) {
      importBrowserTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        importDropdown.classList.add('hidden');
        chrome.tabs.create({ url: 'chrome://settings/importData' });
      });
  }

  // Handle File Selection (Existing Logic)
  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      processImport(content);
    };
    reader.readAsText(file);
    importFile.value = ''; // Reset input
  });

  function processImport(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Create a root folder for this import
    const folderName = `Imported ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    
    chrome.bookmarks.create({ title: folderName }, (newFolder) => {
      // Start processing from the body or dl
      const rootDl = doc.querySelector('dl');
      if (rootDl) {
        traverseBookmarks(rootDl, newFolder.id);
      } else {
        alert('Invalid bookmark file format.');
      }
    });
  }

  function traverseBookmarks(element, parentId) {
    // Bookmark files structure: <dt> <h3>Folder</h3> <dl>...</dl> </dt>  OR  <dt> <a href="...">Link</a> </dt>
    const children = element.children;
    
    // Convert HTMLCollection to Array to handle it easier
    Array.from(children).forEach(node => {
        if (node.tagName === 'DT') {
            const h3 = node.querySelector('h3');
            const a = node.querySelector('a');
            const dl = node.querySelector('dl');

            if (h3 && dl) {
                // It's a folder
                chrome.bookmarks.create({
                    parentId: parentId,
                    title: h3.textContent
                }, (newFolder) => {
                    traverseBookmarks(dl, newFolder.id);
                });
            } else if (a) {
                // It's a link
                chrome.bookmarks.create({
                    parentId: parentId,
                    title: a.textContent,
                    url: a.href
                });
            }
        }
        // Sometimes DL is direct child of DL in some exports (rare but happens)
        // Standard Netscape format puts DL inside DT.
    });
  }

  // State Persistence

  // State Persistence
  let savedView = localStorage.getItem('viewMode') || 'card-view';
  
  // Migrate old 'view-card' to 'card-view' if present
  if (savedView === 'view-card') savedView = 'card-view';
  
  const savedCols = localStorage.getItem('columnCount') || '3';

  // Apply Initial State
  container.className = savedView;
  if(document.getElementById('col-display')) {
      document.getElementById('col-display').textContent = savedCols;
  }
  document.documentElement.style.setProperty('--column-count', savedCols);
  
  if (savedView === 'card-view') {
    setActiveButton(btnCard);
    colSettings.classList.add('hidden');
  } else {
    setActiveButton(btnColumn);
    colSettings.classList.remove('hidden');
  }

  // Load Bookmarks (via Lock State update to ensure UI sync)
  updateLockState();

  // Listener untuk perubahan bookmark (biar auto-update saat drag & drop)
  chrome.bookmarks.onMoved.addListener(() => {
    loadBookmarks();
  });
  chrome.bookmarks.onCreated.addListener(() => {
    loadBookmarks();
  });
  chrome.bookmarks.onRemoved.addListener(() => {
    loadBookmarks();
  });
  
  function loadBookmarks() {
    chrome.bookmarks.getTree((tree) => {
      container.innerHTML = ''; // Clear INSIDE callback to avoid race conditions
      
      const bookmarksBar = tree[0].children[0];
      const otherBookmarks = tree[0].children[1];
      
      let allNodes = [];
      if (bookmarksBar && bookmarksBar.children) {
          allNodes = allNodes.concat(bookmarksBar.children);
      }
      if (otherBookmarks && otherBookmarks.children) {
          allNodes = allNodes.concat(otherBookmarks.children);
      }

      renderBookmarks(allNodes);
    });
  }

  // Fungsi Render
  function renderBookmarks(nodes) {
    const looseBookmarks = [];

    nodes.forEach(node => {
      // Jika node adalah folder (memiliki children)
      if (node.children) {
        createCategoryCard(node);
      } else if (node.url) {
        // Jika node adalah bookmark langsung (bukan folder)
        looseBookmarks.push(node);
      }
    });

    // Render loose bookmarks (yg tidak dalam folder) dalam satu card "General"
    if (looseBookmarks.length > 0) {
        const generalNode = {
            id: 'misc', // virtual ID
            title: 'General / Uncategorized',
            children: looseBookmarks
        };
        createCategoryCard(generalNode);
    }
  }

  function createCategoryCard(node) {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        // Check if real folder or virtual
        if (node.id !== 'misc') {
            categoryCard.dataset.id = node.id;
             // Drop Listeners for Reordering (Card acts as Target)
             if (!isLocked) {
                 categoryCard.addEventListener('dragover', handleCategoryDragOver);
                 categoryCard.addEventListener('drop', handleCategoryDrop);
             }
        } else {
            categoryCard.classList.add('misc-category');
        }

        // Drop Zone for Bookmarks (Always active to allow receiving bookmarks unless locked? Maybe keep allowed)
        categoryCard.addEventListener('dragover', handleDragOver); // For bookmark drop
        categoryCard.addEventListener('drop', handleDrop);       // For bookmark drop


        // Gunakan elemen <details> untuk Accordion
        const details = document.createElement('details');
        details.open = true; // Default terbuka

        const summary = document.createElement('summary');
        summary.style.position = 'relative'; // For absolute positioning of actions
        
        // Build Summary Content
        const titleSpan = document.createElement('span');
        titleSpan.textContent = node.title;
        summary.appendChild(titleSpan);

        // Add action buttons INSIDE summary but absolutely positioned
        if (node.id !== 'misc' && !isLocked) {
             const actionsDiv = document.createElement('div');
            actionsDiv.className = 'category-actions';
            
            // Edit Button with SVG
            const editBtn = document.createElement('button');
            editBtn.className = 'icon-btn';
            editBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            `;
            editBtn.title = 'Rename Category';
            editBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent accordion toggle
                openModal({
                    title: 'Rename Category',
                    type: 'input',
                    placeholder: 'New Category Name',
                    confirmText: 'Save',
                    onConfirm: (newName) => {
                        if (newName && newName.trim() !== '') {
                            chrome.bookmarks.update(node.id, { title: newName }, () => {
                                loadBookmarks();
                            });
                        }
                    }
                });
                setTimeout(() => { modalInput.value = node.title; }, 50);
            };
            actionsDiv.appendChild(editBtn);

            // Delete Button with SVG
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'icon-btn';
            deleteBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            `;
            deleteBtn.title = 'Delete Category';
            deleteBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent accordion toggle
                openModal({
                    title: 'Delete Category',
                    type: 'message',
                    message: `Are you sure you want to delete "${node.title}" and all its bookmarks?`,
                    confirmText: 'Delete',
                    isDanger: true,
                    onConfirm: () => {
                        chrome.bookmarks.removeTree(node.id, () => {
                             // Auto refreshes
                        });
                    }
                });
            };
            actionsDiv.appendChild(deleteBtn);
            summary.appendChild(actionsDiv);
        }

        // Make Summary Draggable (Handle) - FOR ALL CATEGORIES INCLUDING MISC
        if (!isLocked) {
             summary.draggable = true;
             summary.addEventListener('dragstart', handleCategoryDragStart);
             summary.addEventListener('dragend', () => {
                 categoryCard.style.opacity = '1';
             });
        }

        details.appendChild(summary);

        const list = document.createElement('ul');

        // Loop isi folder
        node.children.forEach(child => {
          if (child.url) { // Jika itu adalah link (bukan folder di dalam folder)
            const li = document.createElement('li');
            
            if (!isLocked) {
                li.draggable = true; // Enable drag
                li.dataset.id = child.id; // Simpan ID bookmark
                li.addEventListener('dragstart', handleDragStart);
            }

            const a = document.createElement('a');
            a.href = child.url;
            a.dataset.title = child.title; // Store for toggle logic
            if (showTitles) {
                a.title = child.title; 
            }
            a.draggable = false; // Prevent native link drag
            
            // Thumbnail / Icon Wrapper
            const thumbDiv = document.createElement('div');
            thumbDiv.className = 'bookmark-thumb';
            
            // High Res Favicon
            const hostname = new URL(child.url).hostname;
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
            const img = document.createElement('img');
            img.className = 'favicon';
            img.alt = '';
            img.draggable = false;
            
            // Try to load favicon, fallback to skeleton on error
            img.src = faviconUrl;
            img.onerror = () => {
                // Fallback to skeleton placeholder
                img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+';
            };
            thumbDiv.appendChild(img);

            // Info / Text Wrapper
            const infoDiv = document.createElement('div');
            infoDiv.className = 'bookmark-info';
            const titleSpan = document.createElement('span');
            titleSpan.className = 'bookmark-text';
            titleSpan.textContent = child.title;
            infoDiv.appendChild(titleSpan);

            a.appendChild(thumbDiv);
            a.appendChild(infoDiv);
                        
            li.appendChild(a);

            // Add action buttons (Edit/Delete) - shown on hover
            if (!isLocked) {
                const bookmarkActions = document.createElement('div');
                bookmarkActions.className = 'bookmark-actions';
                
                // Edit Button
                const editBtn = document.createElement('button');
                editBtn.className = 'icon-btn';
                editBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                `;
                editBtn.title = 'Edit Bookmark';
                editBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal({
                        title: 'Edit Bookmark',
                        type: 'input',
                        placeholder: 'New Title',
                        confirmText: 'Save',
                        onConfirm: (newTitle) => {
                            if (newTitle && newTitle.trim() !== '') {
                                chrome.bookmarks.update(child.id, { title: newTitle }, () => {
                                    loadBookmarks();
                                });
                            }
                        }
                    });
                    setTimeout(() => { modalInput.value = child.title; }, 50);
                };
                bookmarkActions.appendChild(editBtn);
                
                // Delete Button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'icon-btn';
                deleteBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                `;
                deleteBtn.title = 'Delete Bookmark';
                deleteBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal({
                        title: 'Delete Bookmark',
                        type: 'message',
                        message: `Delete "${child.title}"?`,
                        confirmText: 'Delete',
                        isDanger: true,
                        onConfirm: () => {
                            chrome.bookmarks.remove(child.id, () => {
                                loadBookmarks();
                            });
                        }
                    });
                };
                bookmarkActions.appendChild(deleteBtn);
                
                li.appendChild(bookmarkActions);
            }

            list.appendChild(li);
          }
        });

        // Show if it has children OR if it is a real folder (not general)
        // This ensures creating a new empty folder still shows up
        // Show if it has children OR if it is a real folder (not general)
        if (list.childElementCount > 0 || node.id !== 'misc') {
          details.appendChild(summary);
          
          // Wrapper for Animation
          const contentWrapper = document.createElement('div');
          contentWrapper.className = 'accordion-content open'; // Default open
          contentWrapper.appendChild(list);
          details.appendChild(contentWrapper);
          
          // Animation Logic
          summary.addEventListener('click', (e) => {
              // Ignore clicks on buttons inside summary
              if (e.target.tagName === 'BUTTON') return;
              
              e.preventDefault(); // Stop default instant toggle
              
              if (details.open) {
                  // Closing Animation
                  contentWrapper.style.maxHeight = contentWrapper.scrollHeight + 'px'; // Set explicit height first
                  requestAnimationFrame(() => {
                      contentWrapper.classList.remove('open');
                      contentWrapper.style.maxHeight = '0';
                      contentWrapper.style.opacity = '0';
                  });
                  
                  // Wait for transition end
                  setTimeout(() => {
                      details.open = false;
                  }, 300); // Match CSS transition time
              } else {
                  // Opening Animation
                  details.open = true;
                  contentWrapper.classList.remove('open'); // Reset state just in case
                  contentWrapper.style.maxHeight = '0';
                  contentWrapper.style.opacity = '0';
                  
                  requestAnimationFrame(() => {
                      contentWrapper.classList.add('open');
                      contentWrapper.style.maxHeight = contentWrapper.scrollHeight + 'px';
                      contentWrapper.style.opacity = '1';
                  });
                  
                  // Cleanup after animation (optional, but good for resize)
                  setTimeout(() => {
                      contentWrapper.style.maxHeight = 'none';
                  }, 300);
              }
          });

          categoryCard.appendChild(details);
          container.appendChild(categoryCard);
        }
  }

  // --- Event Listeners untuk Ganti Tampilan ---

  btnCard.addEventListener('click', () => {
    container.className = 'card-view'; // Corrected to match CSS
    localStorage.setItem('viewMode', 'card-view'); 
    colSettings.classList.add('hidden');
    setActiveButton(btnCard);
    // Di Card View, sebaiknya semua accordion terbuka
    document.querySelectorAll('details').forEach(d => d.open = true);
  });

  btnColumn.addEventListener('click', () => {
    container.className = 'column-view'; // Corrected to match CSS
    localStorage.setItem('viewMode', 'column-view'); 
    colSettings.classList.remove('hidden');
    setActiveButton(btnColumn);
    // Restore column count from storage
    updateColumnCount(localStorage.getItem('columnCount') || 3);
  });

  // Column Control Logic (DOM selectors moved to top, see below replacement)
  // Logic remains here
  
  function updateColumnCount(newVal) {
     let val = parseInt(newVal);
     if (isNaN(val)) val = 3;
     if (val < 2) val = 2;
     if (val > 6) val = 6;
     
     columnCount = val;
     saveSetting('columnCount', val);
     updateColumnCountUI();
  }

  if (colDecBtn && colIncBtn) {
      colDecBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          let current = parseInt(colDisplay ? colDisplay.textContent : 3);
          updateColumnCount(current - 1);
      });
      
      colIncBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          let current = parseInt(colDisplay ? colDisplay.textContent : 3);
          updateColumnCount(current + 1);
      });
  }

  // --- Title Alignment Logic ---
  const alignBtns = {
      left: document.getElementById('align-left'),
      center: document.getElementById('align-center'),
      right: document.getElementById('align-right')
  };
  
  let savedAlign = localStorage.getItem('titleAlign') || 'left';
  applyTitleAlign(savedAlign);

  function applyTitleAlign(align) {
      // Remove all classes first
      document.body.classList.remove('title-align-left', 'title-align-center', 'title-align-right');
      document.body.classList.add(`title-align-${align}`);
      
      // Update Buttons
      Object.values(alignBtns).forEach(btn => btn.classList.remove('active'));
      if(alignBtns[align]) alignBtns[align].classList.add('active');
      
      localStorage.setItem('titleAlign', align);
  }

  Object.entries(alignBtns).forEach(([align, btn]) => {
      if(btn) {
          btn.addEventListener('click', (e) => {
              e.stopPropagation();
              applyTitleAlign(align);
          });
      }
  });

  // --- Drag and Drop Handlers ---

  // --- Context Menu Logic ---
  // (Variables moved to top)

  function showContextMenu(e, node) {
      if (isLocked) return; 
      
      currentCtxNode = node;
      
      let x = e.pageX;
      let y = e.pageY;
      
      if (x + 150 > window.innerWidth) x -= 150;
      
      ctxMenu.style.left = `${x}px`;
      ctxMenu.style.top = `${y}px`;
      ctxMenu.classList.remove('hidden');
  }

  document.addEventListener('click', () => {
      ctxMenu.classList.add('hidden');
  });
  
  ctxEdit.addEventListener('click', () => {
      if (!currentCtxNode) return;
      const node = currentCtxNode;
      
      openModal({
          title: 'Edit Bookmark Name',
          type: 'input',
          placeholder: 'New Name',
          confirmText: 'Save',
          onConfirm: (newName) => {
              if (newName && newName.trim() !== '') {
                  chrome.bookmarks.update(node.id, { title: newName }, () => {
                      loadBookmarks();
                  });
              }
          }
      });
      setTimeout(() => { modalInput.value = node.title; }, 50);
  });

  ctxDelete.addEventListener('click', () => {
      if (!currentCtxNode) return;
      const node = currentCtxNode;
      
      openModal({
            title: 'Delete Bookmark',
            type: 'message',
            message: `Delete "${node.title}"?`,
            confirmText: 'Delete',
            isDanger: true,
            onConfirm: () => {
                chrome.bookmarks.remove(node.id, () => {
                    loadBookmarks();
                });
            }
        });
  });

  // Category Drag Handlers
  function handleCategoryDragStart(e) {
      if (isLocked) { e.preventDefault(); return; }
      
      const card = e.target.closest('.category-card');
      if (card) {
          draggedCategoryNode = card;
          e.dataTransfer.setData('text/plain', card.dataset.id); 
          e.dataTransfer.effectAllowed = 'move';
          card.style.opacity = '0.5';
      }
  }

  function handleCategoryDragOver(e) {
      e.preventDefault();
      // Only allow if we are dragging a category
      if (draggedCategoryNode) {
        e.dataTransfer.dropEffect = 'move';
      }
  }

  function handleCategoryDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      const targetCard = e.target.closest('.category-card');
      
      if (draggedCategoryNode && targetCard && targetCard !== draggedCategoryNode) {
          draggedCategoryNode.style.opacity = '1';
          
          const fromId = draggedCategoryNode.dataset.id; // Could be 'misc'
          const toId = targetCard.dataset.id;
          
          if (fromId === 'misc') {
              // Special Layout: Convert 'misc' to Real Folder then Move
              convertMiscToRealFolder((newFolderId) => {
                  // After conversion, move it
                   chrome.bookmarks.get(toId, (result) => {
                     if (chrome.runtime.lastError) return;
                     const targetNode = result[0];
                     chrome.bookmarks.move(newFolderId, { parentId: targetNode.parentId, index: targetNode.index });
                   });
              });
          } else {
              // Normal Move
              chrome.bookmarks.get(toId, (result) => {
                 if (chrome.runtime.lastError) return;
                 const targetNode = result[0];
                 chrome.bookmarks.move(fromId, { parentId: targetNode.parentId, index: targetNode.index });
              });
          }
      }
      if (draggedCategoryNode) draggedCategoryNode.style.opacity = '1';
      draggedCategoryNode = null;
  }

  function convertMiscToRealFolder(callback) {
      // 1. Create 'General' folder
      chrome.bookmarks.create({ parentId: '1', title: 'General' }, (newFolder) => {
          // 2. Find all loose bookmarks
           chrome.bookmarks.getChildren('1', (children) => {
               const loose = children.filter(c => c.url); // only bookmarks
               let movedCount = 0;
               
               if (loose.length === 0) {
                   callback(newFolder.id);
                   return;
               }

               loose.forEach(bm => {
                   chrome.bookmarks.move(bm.id, { parentId: newFolder.id }, () => {
                       movedCount++;
                       if (movedCount === loose.length) {
                           callback(newFolder.id);
                       }
                   });
               });
           });
      });
  }
  
  // Bookmark Drag Handlers
  function handleDragStart(e) {
    const li = e.target.closest('li');
    if (li && li.dataset.id) {
        e.dataTransfer.setData('text/plain', li.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(e) {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over'); // Optional visual feedback
  }

  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const bookmarkId = e.dataTransfer.getData('text/plain');
    const targetFolderId = e.currentTarget.dataset.id; 

    if (bookmarkId && targetFolderId) {
      chrome.bookmarks.move(bookmarkId, { parentId: targetFolderId }, (result) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } else {
            console.log("Bookmark moved:", result);
            // UI update handled by onMoved listener
        }
      });
    }
  }

  function setActiveButton(btn) {
    // Only target view mode buttons, not all buttons in controls
    document.querySelectorAll('.view-toggles button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
});