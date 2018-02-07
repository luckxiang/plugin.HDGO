/**
 * HDGO plugin for Movian
 *
 *  Copyright (C) 2015 Buksa, Wain
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
//ver 0.0.6
var plugin = JSON.parse(Plugin.manifest);

var PREFIX = plugin.id;
var BASE_URL = 'http://hdgo.club';
var LOGO = Plugin.path + "logo.bmp";
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36';
var page = require('showtime/page');
var service = require("showtime/service");
var settings = require('showtime/settings');
var io = require('native/io');
var prop = require('showtime/prop');
var log = require('./src/log');
var browse = require('./src/browse');
var api = require('./src/api');

var http = require('showtime/http');
var html = require("showtime/html");
var result = '',
    referer = BASE_URL,
    data = {};



var tos = "The developer has no affiliation with the sites what so ever.\n";
tos += "Nor does he receive money or any other kind of benefits for them.\n\n";
tos += "The software is intended solely for educational and testing purposes,\n";
tos += "and while it may allow the user to create copies of legitimately acquired\n";
tos += "and/or owned content, it is required that such user actions must comply\n";
tos += "with local, federal and country legislation.\n\n";
tos += "Furthermore, the author of this software, its partners and associates\n";
tos += "shall assume NO responsibility, legal or otherwise implied, for any misuse\n";
tos += "of, or for any loss that may occur while using plugin.\n\n";
tos += "You are solely responsible for complying with the applicable laws in your\n";
tos += "country and you must cease using this software should your actions during\n";
tos += "plugin operation lead to or may lead to infringement or violation of the\n";
tos += "rights of the respective content copyright holders.\n\n";
tos += "plugin is not licensed, approved or endorsed by any online resource\n ";
tos += "proprietary. Do you accept this terms?";

io.httpInspectorCreate('http.*hdgo.cc/.*', function(ctrl) {
    ctrl.setHeader('User-Agent', UA);
    return 0;
});
io.httpInspectorCreate("http.*?\\/video\\/\\d+.*?[a-f0-9]{32}.mp4", function(ctrl) {
    ctrl.setHeader('User-Agent', UA);
    ctrl.setHeader('Referer', 'http://hdgo.cx')
    return 0;
});


io.httpInspectorCreate('http.*hdgo.club/.*', function(ctrl) {
    ctrl.setHeader('User-Agent', UA);
    return 0;
});
//http://couber.be

// Create the service (ie, icon on home screen)
service.create(plugin.title, PREFIX + ":start", "video", true, LOGO);


settings.globalSettings(plugin.id, plugin.title, LOGO, plugin.synopsis);
settings.createDivider("Settings:");
settings.createBool("tosaccepted", "Accepted TOS (available in opening the plugin)", false, function(v) {
    service.tosaccepted = v;
});
settings.createBool("debug", "Debug", false, function(v) {
    service.debug = v;
});
settings.createBool("Show_META", "Show more info from thetvdb", true, function(v) {
    service.tvdb = v;
});

new page.Route(PREFIX + ":browse:(.*):(.*)", function(page, href, title) {
    browse.list(page, {
        'href': href,
        'title': title
    });
});
//
new page.Route(PREFIX + ":page:(.*)", function(page, id) {
    log.d(id)
    browse.moviepage(page, id);
});
//
//
new page.Route(PREFIX + ":SEASON:(.*)", function(page, data) {
    browse.season(page, data);
});
//
new page.Route(PREFIX + ":play:(.*)", function(page, data) {
    var canonicalUrl = PREFIX + ":play:" + data;
    data = JSON.parse(data);
    log.d({
        function: 'play',
        data: data
    })

    var videoparams = {
        canonicalUrl: canonicalUrl,
        no_fs_scan: true,
        icon: data.cover,
        title: data.title,
        year: data.year ? data.year : 0,
        season: data.season ? data.season : -1,
        episode: data.episode ? data.episode : -1,
        sources: [{
            url: []
        }],
        subtitles: []
    };
    api.call(page, data.url, null, function(pageHtml) {
        log.d(pageHtml.text.toString())
        content = pageHtml.text.toString()
        regExp = /(http:.*?(?:mp4|\.flv))/g;
        while (((itemData = regExp.exec(content)) !== null)) {

            videoparams.sources = [{
                url: itemData[1] + " -H \"Referer:http://hdgo.cx\"",
            }]
            type = /mp4/.test(itemData[1]) ? '[MP4]' : '[FLV]'
            resolution = (/(\d+)-/.test(itemData[1]) ? '-' + /(\d+)-/.exec(itemData[1])[1] + '-' : '-')
            data.video_url = itemData[1]
            video = "videoparams:" + JSON.stringify(videoparams);
            page.appendItem(video, "video", {
                title: type + resolution + data.title,
                backdrops: [ {url:(/poster.*?'(.+?)'/.exec(content)[1])}],
                icon: 'cover'
            })
        }
    });
    //
    page.type = "directory";
    page.metadata.logo = LOGO;
    page.loading = false;
});
//
new page.Route(PREFIX + ":search:(.*)", function(page, query) {
    page.metadata.icon = LOGO;
    page.metadata.title = 'Search results for: ' + query;
    page.type = 'directory';
  //  browse.search(page, query, 'serials');
    browse.search(page, query, 'films');
});
//
page.Searcher(PREFIX + " - Сериалы", LOGO, function(page, query) {
    browse.search(page, query, 'serials');
});
page.Searcher(PREFIX + " - Фильмы", LOGO, function(page, query) {
    browse.search(page, query, 'films');
});


// Landing page
new page.Route(PREFIX + ":start", function(page) {
    page.type = 'directory';
    page.metadata.title = "HDGO";
    page.metadata.icon = LOGO;

 //   page.appendItem(PREFIX + ":search:", 'search', { //hdgo的search不好用,不要开启
  //      title: 'Search'
  //  });
    page.appendItem(PREFIX + ':browse:/serials:Сериалы', 'directory', {
        title: 'Сериалы'
    });
    page.appendItem(PREFIX + ':browse:/films:Фильмы', 'directory', {
        title: 'Фильмы'
    });

});
