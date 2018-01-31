data = {}

function ScrapeList(href, pageHtml) {
    var returnValue = []

    //list
    var elements = pageHtml.dom.getElementByClassName('li_gen')
    for (i = 0; i < elements.length; i++) {
        element = elements[i]
        returnValue.push({
            url: element.getElementByClassName('btn-primary')[0].attributes.getNamedItem('href').value,
            tag: '',
            title: element.children[1].textContent.split('\n')[0],
            //image: BASE_URL + element.getElementByTagName("img")[0].attributes.getNamedItem('src').value,
            description: element.children[1].textContent //.split('\n')[1],
        })
    }
    //search list
    //log.p(dle_content.getElementByClassName('res-search').length)
    //log.p(pageHtml.dom.getElementByClassName('res-search') !== null)
    //var elements = dle_content.getElementByClassName('res-search').length ? dle_content.getElementByClassName('res-search')[0].children : ''
    //for (i = 0; i < elements.length; i++) {
    //  element = elements[i]
    //  returnValue.push({
    //    url: element.getElementByTagName("a")[0].attributes.getNamedItem('href').value.match(/http:\/\/amovies.biz(.*)/)[1],
    //    tag: '',
    //    title: element.getElementByTagName("img")[0].attributes.getNamedItem('alt').value,
    //    image: element.getElementByTagName("img")[0].attributes.getNamedItem('src').value,
    //    //description: element.getElementByClassName("film-date-t")[0].textContent,
    //  })
    //}

    //endOfData = document.getElementsByClassName('navigation').length ? document.getElementsByClassName('pagesList')[0].children[document.getElementsByClassName('pagesList')[0].children.length - 2].nodeName !== 'A' : true
    returnValue.endOfData = pageHtml.dom.getElementByClassName('navigation').length ? pageHtml.dom.getElementByClassName('pagesList')[0].children[pageHtml.dom.getElementByClassName('pagesList')[0].children.length - 2].nodeName !== 'a' : true;
    return returnValue
}

var total = 0;
function populateItemsFromList(page, list) {
    log.d({
        function: 'populateItemsFromList',
        list: list
    })
    for (i = 0; i < list.length; i++) {
        total++;
        page.appendItem(PREFIX + ":page:" + (list[i].url.match(/\d+/)[0]), "directory", {
            title: list[i].title,
            description: list[i].description,
            icon: list[i].image,
            extra_data: "total dynamic: " + total
        })
        page.entries++;
    }
}
exports.list = function (page, params) {
    page.loading = true;
    page.type = 'directory';
    page.metadata.logo = LOGO;
    page.metadata.title = params.title;
    page.entries = 0;
    log.d('exports.list')
    log.d(params)
    log.d(params.args)
    var nextPage = 1

    function loader() {
        url = params.page ? params.href + params.page : params.href + '?page=1'
        log.d('url=' + url) ///serials/page/1/ http://hdgo.club/serials?page=2
        api.call(page, BASE_URL + url, null, function (pageHtml) {

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

function ScrapePage(page, pageHtml) {
    log.d({
        function: 'ScrapePage',
        pageHtml: pageHtml.text.toString(),
        data: data
    })
    page.metadata.title = data.title;

    //season = document.getElementById('season');
    season = pageHtml.dom.getElementById("season");
    if (season) log.d("count season: " + season.children.length);
    //episode = document.getElementById('episode');
    episode = pageHtml.dom.getElementById("episode");
    if (episode) {
        log.d("count episode: " + episode.children.length);
        // api.call(page, data.url, {
        //     season: season.children.length
        // }, function (pageHtml) {
            episode = pageHtml.dom.getElementById("episode");
            log.d("count episode: " + episode.children.length);
            lastepisode = episode.children[episode.children.length - 1].attributes.getNamedItem("value").value;
            lastseason = season.children[season.children.length - 1].attributes.getNamedItem("value").value;
            //http://coubermedia.xyz/video/serials/Q298nQsLY481iJzUPrlwVnRh6EqC8Ctd/8811/
            //http://coubermedia.xyz/video/serials/Q298nQsLY481iJzUPrlwVnRh6EqC8Ctd/8811/?season=1&e=149155
            ///video/serials/Q298nQsLY481iJzUPrlwVnRh6EqC8Ctd/8812/?' + 'season=' + 1 + '&e=' + episode;
            data.url = data.url + '?' + 'season=' + lastseason + '&e=' + lastepisode;
            log.d(data.url)

            item = page.appendItem(PREFIX + ":play:" + JSON.stringify(data), "directory", {
                season: +season.children[season.children.length - 1].textContent.match(/\d+/),
                episode: +episode.children[episode.children.length - 1].textContent.match(/\d+/),
                title: season.children[season.children.length - 1].textContent + " " + episode.children[episode.children.length - 1].textContent,
                description: "Recently Updated:",
                icon: data.cover
            });
            //   item.bindVideoMetadata({
            //   title: data.title  + "S"+season.children[season.children.length - 1].textContent.match(/\d+/)+ "E"+episode.children[episode.children.length - 1].textContent.match(/\d+/)
            // });
            for (var i = 0; i < season.children.length; i++) {
                log.d(season.children[i].attributes.getNamedItem("value")
                    .value);
                data.season = season.children[i].attributes.getNamedItem("value")
                    .value;
                //data.url = data.url + '?' + 'season=' + data.season + '&e=' + lastepisode;
                page.appendItem(PREFIX + ":SEASON:" + JSON.stringify(data), "directory", {
                    title: season.children[i].textContent,
                    description: "Seasons:",
                    icon: data.cover
                });
            }
       // });


    } else page.redirect(PREFIX + ":play:" + JSON.stringify(data));
}





exports.search = function (page, query, type) {
    page.loading = true;
    page.type = 'directory';
    page.entries = 0;
    log.p({
        title: 'exports.search',
        params: query
    })
    try {
        log.d("Search aMovies Videos for: " + query);

        var v = http.request('http://hdgo.club/' + type, {
            debug: 1, //service.debug,
            headers: {
                'User-Agent': UA
            },
            postdata: {
                process: 'Искать',
                search: query,
                type: 1
                //story: encodeURIComponent(query)
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


exports.season = function (page, data) {
    log.d({
        route: 'season',
        data: data
    })

    data = JSON.parse(data)
    log.d({
        route: 'season',
        data: data
    })
    sN = season.children[data.season - 1].attributes.getNamedItem("value").value;
    api.call(page, data.url.replace(/\d+&e=\d+/, sN), null, function (pageHtml) {
        log.d((pageHtml.text.toString()))
        season = pageHtml.dom.getElementById("season");
        episode = pageHtml.dom.getElementById("episode");
        log.d("count episode: " + episode.children.length);
        iframe = data.url.replace(/\d+&e=\d+/, sN);
        for (i = 0; i < episode.children.length; i++) {
            data.url = iframe + "&e=" + episode.children[i].attributes.getNamedItem("value").value;
            data.series = {
                season: +data.season,
                episode: +episode.children[i].attributes.getNamedItem("value").value
            };
            log.d((data));
            item = page.appendItem(PREFIX + ":play:" + JSON.stringify(data), "directory", {
                episode: {
                    number: i + 1
                },
                title: data.title.replace(/\(\d{4}\)/, '') + 'S0' + data.season + "E0" + +episode.children[i].textContent.match(/\d+/),
                description: data.title,
                icon: data.cover,
                extra_data: "total: " + episode.children.length
            });

            //item.bindVideoMetadata({
            //    title: data.title.replace(/\(\d{4}\)/, '') + 'S0' + data.season + "E0" + +episode.children[i].textContent.match(/\d+/)
            //})

        }

        page.loading = false;
    });

    page.metadata.title = data.title + "|" + season.children[data.season - 1].textContent;
    page.loading = true;
    page.model.season.number = +data.season
    page.type = 'directory';


};
exports.moviepage = function (page, id) {
    page.loading = true;
    page.type = 'directory';
    url = BASE_URL + '/base_preview/' + id;


    api.call(page, url, null, function (pageHtml) {
        data.url = (/iframe src=".*?\/\/([^"]+)/.exec(pageHtml.text) || [])[1];
        log.d(pageHtml.text.toString())
          log.d('1 iFrame:' + data.url)
         data.title = /btn-primary11"> ([^)]+.)/.exec(pageHtml.text)[1];
         kpID = /kinopoisk.ru\/film\/(\d+)\//.exec(pageHtml.text);
         if (kpID) {data.cover = 'http://www.kinopoisk.ru/images/film/' + kpID[1] + '.jpg'} else data.cover ='';
         api.call(page, 'http://' + data.url, null, function (pageHtml) {
         log.d(pageHtml.text.toString())
         data.url = (/iframe src="([^"]+)/.exec(pageHtml.text) || [])[1];
         log.d('2 iFrame:' + data.url)
             api.call(page, data.url, null, function (pageHtml) {
                 data.url = (/iframe src="([^"]+)/.exec(pageHtml.text) || [])[1];
                 log.d('3 iFrame:' + (data.url = 'http:'+ data.url))
                      api.call(page, data.url, null, function (pageHtml) {
                     log.d(pageHtml.text.toString())
                     log.d('call Scrapepage:' + data.url)
                     ScrapePage(page, pageHtml)
                 })

             })
        });

    });
    page.loading = false;
}
