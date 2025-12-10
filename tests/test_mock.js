window.chrome = {
  bookmarks: {
    getTree: (cb) => {
      // Simulate async
      setTimeout(() => {
        cb([{
          children: [
             {
               children: [ // Bookmarks Bar
                 { id: '10', title: 'Work Tools', children: [
                   { id: '11', title: 'GitHub - Where code lives', url: 'https://github.com' },
                   { id: '12', title: 'StackOverflow - Answers for devs', url: 'https://stackoverflow.com' },
                   { id: '13', title: 'Jira - Project Management', url: 'https://jira.atlassian.com' }, 
                   { id: '14', title: 'Figma - Design', url: 'https://figma.com' }
                 ]},
                 { id: '20', title: 'Social Media', children: [
                   { id: '21', title: 'Twitter / X', url: 'https://twitter.com' },
                   { id: '22', title: 'LinkedIn', url: 'https://linkedin.com' },
                   { id: '23', title: 'Instagram', url: 'https://instagram.com' }
                 ]},
                 { id: '30', title: 'Empty Folder', children: [] }
               ]
             },
             { children: [ // Other Bookmarks
                 { id: '41', title: 'Loose Link 1', url: 'https://google.com' },
                 { id: '42', title: 'Loose Link 2', url: 'https://youtube.com' }
             ] } 
          ]
        }]);
      }, 50);
    },
    getChildren: (id, cb) => cb([]),
    update: (id, data, cb) => { console.log('Mock update', id, data); if(cb) cb(); },
    remove: (id, cb) => { console.log('Mock remove', id); if(cb) cb(); },
    removeTree: (id, cb) => { console.log('Mock removeTree', id); if(cb) cb(); },
    move: (id, dest, cb) => { console.log('Mock move', id, dest); if(cb) cb(); },
    create: (data, cb) => { console.log('Mock create', data); if(cb) cb({id: Math.random().toString(), ...data}); },
    onMoved: { addListener: () => {} },
    onCreated: { addListener: () => {} },
    onRemoved: { addListener: () => {} }
  },
  runtime: {
    lastError: null
  },
  tabs: {
      create: (opts) => console.log('Opened tab', opts)
  }
};
