data = {}

function indexList(href, pageHtml) {
  var returnValue = []
  
  //list
  var elements = pageHtml.dom.getElementByClassName('li_gen')
  for (i = 0; i < elements.length; i++) {
    element = elements[i]
    returnValue.push({
      url: element.children[5].getElementByClassName('btn-primary')[0].attributes.getNamedItem('href').value,
      tag: '',
      title: element.children[1].textContent.split('\n')[0],
      //image: BASE_URL + element.getElementByTagName("img")[0].attributes.getNamedItem('src').value,
      description: element.children[1].textContent//.split('\n')[1],
    })
  }
  
//endOfData = document.getElementsByClassName('navigation').length ? document.getElementsByClassName('pagesList')[0].children[document.getElementsByClassName('pagesList')[0].children.length - 2].nodeName !== 'A' : true
  returnValue.endOfData = pageHtml.dom.getElementByClassName('navigation').length ? pageHtml.dom.getElementByClassName('pagesList')[0].children[pageHtml.dom.getElementByClassName('pagesList')[0].children.length - 2].nodeName !== 'a' : true;
  return returnValue
}

function contentPage(page, href, pageHtml) {
  log.d(pageHtml.text.toString())
  season = pageHtml.dom.getElementById("season");
  episode = pageHtml.dom.getElementById("episode");
  if (episode) {
    //code
        page.appendItem("", "separator", {
            title: "Recently Updated:"
        });
        page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "directory", {
            title: season.children[season.children.length - 1].textContent + " " + episode.children[episode.children.length - 1].textContent,
            icon: 'cover'
        });
        page.appendItem("", "separator", {
            title: "Seasons:"
        });
        for (var i = 0; i < season.children.length; i++) {
            log.d(season.children[i].attributes.getNamedItem("value")
                .value);
            data.season = season.children[i].attributes.getNamedItem("value")
                .value;
            page.appendItem(PREFIX + ":SEASON:" + escape(JSON.stringify(data)), "directory", {
                title: season.children[i].textContent,
                icon: 'cover'
            });
        }
  }
//log.p(pageHtml.dom.getElementByTagName('option'))
//log.p('^^^^^^^^^^^^^^^^^^^^^^^^^')
//  var elements = pageHtml.dom.getElementByTagName('option')
//  for (i = 0; i < elements.length; i++) {
//    element = elements[i];
//    data.url = element.attributes.getNamedItem('value').value
//    data.title = element.textContent
//    page.appendItem(PREFIX + ":play:" + (JSON.stringify(data)), "video", {
//      title: element.textContent,
//      icon: 'poster',
//    })
//  }


  ////log.p(iFrame)
  //if (/couber.be\/video\/serials\/pl\/sound\//.test(iFrame)) {
  //  log.p('serial')
  //  var v = http.request(iFrame, {
  //    debug: service.debug,
  //    method: 'GET',
  //    headers: {
  //      'User-Agent': UA,
  //      Referer: BASE_URL + href
  //    }
  //  }).toString();
  //  log.p(v)
  //  log.p(iFrame = html.parse(v).root.getElementByTagName('iframe')[0].attributes.getNamedItem('src').value)
  //  
  //  var v = http.request(iFrame, {
  //    debug: service.debug,
  //    method: 'GET',
  //    headers: {
  //      'User-Agent': UA,
  //      Referer: BASE_URL + href
  //    }
  //  }).toString();
  //  log.p(v)
  //  
  //  eval(v.match(/uvk.show.[\s\S]+uvk.(show\([^)]+.)/)[1])
  //}
//  if (/\/video\/t\/.*\/\d+\//.test(iFrame)) {
//    log.p('iFrame');
//    log.p(iFrame);
//log.d(iFrame)
//    data.url = iFrame;
//    page.appendItem(PREFIX + ":play:" + JSON.stringify(data), "video", {
//      title: data.title,
//      icon: data.poster,
//    })
//  }

  function show(a, b) {
    for (var i = 0; i < a.length; i++) {
      page.appendItem("", "separator", {
        title: a[i]
      });
      log.d(a)
      log.d(b)
      //sss.perevod[i] = {title: a[i]};
      sss[i] = [{
          title: a[i]
        }
      ]

      for (var j = 0; j < b[i].length; j++) {
        data.url = b[i][j]
        data.title = (j + 1) + " серия"
        page.appendItem(PREFIX + ":play:" + JSON.stringify(data), "video", {
          title: data.title,
          icon: data.poster,
        })

        sss[i].push({
          Perevod2: a[i],
          url: b[i][j],
          episode: (j + 1)
        })

      }
    }
    log.p(sss)
  }
}


function populateItemsFromList(page, list) {
  log.d({
    function: 'populateItemsFromList',
    list: list
  })
  for (i = 0; i < list.length; i++) {
    page.appendItem(PREFIX + ":page:" + (list[i].url.match(/\d+/)[0]), "directory", {
      title: list[i].title,
      description: list[i].description,
      icon: list[i].image
    })
    page.entries++;
  }
}

exports.search = function(page, query) {
  page.loading = true;
  page.type = 'directory';
  page.entries = 0;
  log.p({
    title: 'exports.search',
    params: query
  })
 try {
  log.d("Search aMovies Videos for: " + query);

  var v = http.request(BASE_URL + '/index.php?do=search', {
    debug: 1, //service.debug,
    headers: {
      'User-Agent': UA
    },
    postdata: {
      do :'search',
      subaction: 'search',
      search_start: 1,
      full_search: 0,
      result_from: 1,
      story: encodeURIComponent(query)
    }
  });

  pageHtml = {
    text: v,
    dom: html.parse(v).root
  }

  list = ScrapeList('', pageHtml)

  populateItemsFromList(page, list);
  } catch (err) {
   log.d('aMovies - Ошибка поиска: ' + err);
  log.e(err);
  }
  page.loading = false;
}

exports.list = function(page, params) {
  page.loading = true;
  page.type = 'directory';
//  page.model.contents = 'grid';
  page.entries = 0;
  log.d('exports.list')
  log.d(params)
  log.d(params.args)
  var nextPage = 1

    function loader() {
      url = params.page ? params.href + params.page : params.href + '?page=1'
      log.d('url='+url) ///serials/page/1/ http://hdgo.club/serials?page=2
      api.call(page, BASE_URL+url, null, function(pageHtml) {

        list = ScrapeList(url, pageHtml);
        populateItemsFromList(page, list);
        nextPage++
        params.page = '?page=' + nextPage

        page.haveMore(list.endOfData !== undefined && !list.endOfData);
      });
    }

  loader();
  page.asyncPaginator = loader;
}

exports.moviepage = function(page, id) {
  page.loading = true;
  page.type = 'directory';
  log.d(id)
  url = BASE_URL+'/base_preview/'+id;
  log.d(url)
  api.call(page, url, null, function(pageHtml) {
    url = pageHtml.dom.getElementByTagName('iframe')[0].attributes.getNamedItem('src').value
    log.d(url)
    api.call(page, url, null, function(pageHtml) {
      url = pageHtml.dom.getElementByTagName('iframe')[0].attributes.getNamedItem('src').value
      log.d(url)
      api.call(page, url, null, function(pageHtml) {
        url = pageHtml.dom.getElementByTagName('iframe')[0].attributes.getNamedItem('src').value
        log.d(url)
        api.call(page, url, null, function(pageHtml) {
          ScrapePage(page, url, pageHtml)
        });
      });
    });
  });
  page.loading = false;
}

//

function getProperty(item, className) {
  var prop = item.getElementByClassName(className);
  if (!prop.length) {
    return '';
  }
  prop = prop[0].textContent;
  if (prop) {
    return prop.trim();
  }
  return '';
}