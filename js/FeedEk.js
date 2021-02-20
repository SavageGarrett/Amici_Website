/*
* FeedEk jQuery RSS/ATOM Feed Plugin v3.0 with YQL API
* http://jquery-plugins.net/FeedEk/FeedEk.html  https://github.com/enginkizil/FeedEk
* Author : Engin KIZIL http://www.enginkizil.com
*/

(function ($) {
    $.fn.FeedEk = function (opt) {
        var def = $.extend({
            MaxCount: 5,
            ShowDesc: true,
            ShowPubDate: true,
            DescCharacterLimit: 0,
            TitleLinkTarget: "_blank",
            DateFormat: "",
            DateFormatLang:"en"
        }, opt);

        var id = $(this).attr("id"), s = "", dt;
        $("#" + id).empty();
        if (def.FeedUrl == undefined) return;
        $("#" + id).append('<img src="images/loader.gif" />'); // No image file?

        var YQLstr = 'SELECT channel.item FROM feednormalizer WHERE output="rss_2.0" AND url ="' + def.FeedUrl + '" LIMIT ' + def.MaxCount;

        return $.ajax({
            url: def.FeedUrl,
            dataType: "jsonp",
            crossDomain: true,
            headers: {  'Access-Control-Allow-Origin': 'http://interestgroupnetworks.blogspot.com/' },
            error: function(error) {
                console.error(error);
            },
            success: function (data) {
                data = $.parseXML(data);

                var temp_data = [];

                $(data).find('channel').each(function(i, channel) {
                    if (i == 0) {
                        $(channel).find('item').each(function(j, item) {
                            if (i < def.MaxCount) {
                                temp_data.push(item);
                            } else {
                                return;
                            }
                        })
                    } else {
                        return;
                    }
                })

                var tmpCount = 1;
                $("#" + id).empty();
                if (!(temp_data instanceof Array)) {
                    temp_data = [temp_data];
                }
                $.each(temp_data, function (e, itm) {
                    if (def.MaxCount == 3){
                        s += '<li><div class="itemTitle"><a href="news.html#News' + tmpCount + '">' + $(itm).find('title').text() + '</a></div>';
                        tmpCount++;
                    }

                    else{
                        s += '<li><div class="itemTitle" id = "News' + tmpCount + '"><a href="' + $(itm).find('link').text() + '" >' + $(itm).find('title').text() + '</a></div>';
                        tmpCount++;
                    }

                    if (def.ShowPubDate){
                        dt = new Date($(itm).find('pubDate').text());
                        s += '<div class="itemDate">';
                        if ($.trim(def.DateFormat).length > 0) {
                            try {
                                moment.lang(def.DateFormatLang);
                                s += moment(dt).format(def.DateFormat);
                            }
                            catch (e){s += dt.toLocaleDateString();}
                        }
                        else {
                            s += dt.toLocaleDateString();
                        }
                        s += '</div>';
                    }
                    if (def.ShowDesc) {
                        s += '<div class="itemContent">';
                         if (def.DescCharacterLimit > 0 && $(itm).find('description').length > def.DescCharacterLimit) {
                            s += $(itm).find('description').text().substring(0, def.DescCharacterLimit) + '...';
                        }
                        else {
                            s += $(itm).find('description').text();
                         }
                         s += '</div>';
                    }
                });
                $("#" + id).append('<' + def.Tag + '>' + s + '</ol>');
            }
        });
    };
})(jQuery);
