exports.call = function (page, URL, args, callback) {
  var opts = {
    method: 'GET',
    headers: {
      'User-Agent': UA,
      'Referer': referer,
    },
    args: [args || {}],
    debug: service.debug,
    noFail: true, // Don't throw on HTTP errors (400- status code)
    compression: true, // Will send 'Accept-Encoding: gzip' in request
    caching: true, // Enables Movian's built-in HTTP cache
  };

  // opts['headers'] = {
  //   'User-Agent': UA,
  //   'Referer': referer,
  // }
  log.d({
    'make request for': URL,
    'with opts': opts
  })
  http.request(URL, opts, function (err, result) {
    //if (page) page.loading = true;
    if (err) {
      if (page) page.error(err);
      else console.error(err);
    } else {
      try {
        var pageHtml = {
          text: result,
          dom: html.parse(result).root
        };
        callback(pageHtml);
      } catch (e) {
        if (page) page.error(e);
        throw (e);
      }
    }
   if (page) page.loading = false;
  });
  log.d('set referer to last requestet url:' + URL);
  referer = URL;
}