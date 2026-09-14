const http = require('http');

http.get('http://localhost:3000/admin', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const cssMatches = data.match(/href="([^"]+\.css[^"]*)"/);
    if (!cssMatches) return console.log('No CSS match');
    const cssUrl = 'http://localhost:3000' + cssMatches[1];
    http.get(cssUrl, (cRes) => {
      let cData = '';
      cRes.on('data', c => cData += c);
      cRes.on('end', () => {
        const testClasses = [
          'bg-slate-50', 'text-slate-900', 'h-screen', 'grid-cols-4',
          'rounded-3xl', 'bg-sky-600', 'border-slate-200', 'shadow-md',
          'max-w-[1600px]', 'sticky', 'h-16', 'flex-1', 'overflow-auto',
          'p-6', 'gap-4', 'w-56', 'rounded-2xl', 'text-xs', 'font-bold'
        ];
        testClasses.forEach(cls => {
          console.log(cls + ':', cData.includes(cls));
        });
      });
    });
  });
});
