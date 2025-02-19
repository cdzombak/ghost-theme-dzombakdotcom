function isOverflownX(element) {
    return element.scrollWidth > element.clientWidth;
}

window.addEventListener('load', function() {
    document.querySelectorAll('.gh-content table:not(.gist table)').forEach((element) => {
        if (!isOverflownX(element)) {
            element.style.background = 'none';
        }
    });
});

window.addEventListener('DOMContentLoaded', function() {
    // TODO(cdzombak): check cache & expiration ts

    let parser = new RSSParser();
    parser.parseURL('https://www2025.dzombak.com/rss/microblog.rss', function(err, feed) {
        if (err) {
            console.error(err);
            return;
        }

        const feedItems = feed.items;
        feedItems.sort(function(a, b){
            return new Date(Date.parse(b.pubDate)) - new Date(Date.parse(a.pubDate));
        });

        var items = [];
        feedItems.forEach(function(entry) {
            if (items.length >= 3) {
                return;
            }

            var item = {
                pubDate: new Date(Date.parse(entry.pubDate)),
                link: entry.link,
                content: entry.content.replaceAll("<br>", "")
            };

            if (entry.enclosure) {
                item.encType = entry.enclosure.type;
                item.encURL = entry.enclosure.url;
            }

            items.push(item);
        });

        window.localStorage.setItem('cdz_microblog_feed', JSON.stringify({
            exp: new Date(new Date().getTime() + 5*60*1000),
            items: items
        }));
    });

    const microblogItems = JSON.parse(window.localStorage.getItem('cdz_microblog_feed')).items;
    const microblogFeed = document.getElementById("-cdz-microblog-feed");

    microblogItems.forEach(function(item) {
        const article = document.createElement("article");
        article.setAttribute("class", "gh-card post");

        const a = document.createElement("a");
        a.setAttribute("class", "gh-card-link");
        a.setAttribute("href", item.link);
        a.setAttribute("target", "_blank");
        article.appendChild(a);

        const containerDiv = document.createElement("div");
        containerDiv.setAttribute("class", "gh-card-excerpt cdz-microblog-container");
        a.appendChild(containerDiv);

        const contentDiv = document.createElement("div");
        contentDiv.setAttribute("class", "cdz-microblog-content");
        containerDiv.appendChild(contentDiv);

        const textContentDiv = document.createElement("div");
        textContentDiv.setAttribute("class", "cdz-microblog-text-content");
        textContentDiv.innerHTML = item.content;
        contentDiv.appendChild(textContentDiv);

        if (item.encType) {
            if (item.encType.startsWith("image/") && !!item.encURL) {
                const img = document.createElement("img");
                img.setAttribute("src", item.encURL);
                contentDiv.appendChild(img);
            } else {
                console.warn("microblog item has unsuported enclosure type:", item);
            }
        }

        const footer = document.createElement("footer");
        footer.setAttribute("class", "gh-card-meta");
        textContentDiv.appendChild(footer);

        const itemTs = new Date(Date.parse(item.pubDate));
        const time = document.createElement("time");
        time.setAttribute("class", "gh-card-date");
        time.setAttribute("datetime", item.pubDate);
        time.appendChild(document.createTextNode(itemTs.toLocaleString()));
        footer.appendChild(time);

        microblogFeed.appendChild(article);
    });
});

window.addEventListener('DOMContentLoaded', function() {
    // TODO(cdzombak): check cache & expiration ts

    let parser = new RSSParser();
    parser.parseURL('https://www2025.dzombak.com/rss/pictures.rss', function(err, feed) {
        if (err) {
            console.error(err);
            return;
        }

        const feedItems = feed.items;
        feedItems.sort(function(a, b){
            return new Date(Date.parse(b.pubDate)) - new Date(Date.parse(a.pubDate));
        });

        var items = [];
        var birdbuddyItems = [];
        feedItems.forEach(function(entry) {
            var item = {
                pubDate: new Date(Date.parse(entry.pubDate)),
                link: entry.link,
                title: entry.title,
                category: null,
                encType: entry.enclosure.type,
                encURL: entry.enclosure.url
            };
            if (entry.categories.length) {
                item.category = entry.categories[0];
            }

            if (item.category && item.category === 'Bird Buddy' && birdbuddyItems.length < 3) {
                birdbuddyItems.push(item);
            } else if (item.category !== 'Bird Buddy' && items.length < 3) {
                items.push(item);
            }
        });

        window.localStorage.setItem('cdz_pictures_feed', JSON.stringify({
            exp: new Date(new Date().getTime() + 15*60*1000),
            items: items
        }));
        window.localStorage.setItem('cdz_birdbuddy_feed', JSON.stringify({
            exp: new Date(new Date().getTime() + 15*60*1000),
            items: birdbuddyItems
        }));
    });

    const pictureItems = JSON.parse(window.localStorage.getItem('cdz_pictures_feed')).items;
    const picturesFeed = document.getElementById("-cdz-pictures-feed");
    const bbItems = JSON.parse(window.localStorage.getItem('cdz_birdbuddy_feed')).items;
    const bbFeed = document.getElementById("-cdz-birdbuddy-feed");

    const addImage = function(el, item) {
        const itemTs = new Date(Date.parse(item.pubDate));
        const altTxt = item.title + " (Posted " + itemTs.toLocaleDateString() + " in “" + item.category + "”)";

        const img = document.createElement("img");
        img.setAttribute("src", item.encURL);
        img.setAttribute("alt", altTxt);

        const a = document.createElement("a");
        a.setAttribute("class", "gh-card-link");
        a.setAttribute("href", item.link);
        a.setAttribute("target", "_blank");
        a.setAttribute("title", altTxt);

        a.appendChild(img);
        el.appendChild(a);
    }

    pictureItems.forEach(function(item) {
        addImage(picturesFeed, item);
    });
    bbItems.forEach(function(item) {
        addImage(bbFeed, item);
    });
});

(function () {
    pagination(false);
})();
