function isOverflownX(element) {
  return element.scrollWidth > element.clientWidth;
}

window.addEventListener("load", function () {
  document.querySelectorAll(".gh-content table:not(.gist table)").forEach((element) => {
    if (!isOverflownX(element)) {
      element.style.background = "none";
    }
  });

  document.querySelectorAll(".gh-content h2").forEach((element) => {
    const aCont = document.createElement("span");
    aCont.setAttribute("class", "cdz-content-header-link-container");

    const a = document.createElement("a");
    a.setAttribute("class", "cdz-content-header-link");
    a.setAttribute("href", "#" + element.getAttribute("id"));
    a.innerHTML =
      "<svg viewBox='0 0 16 16' version='1.1' width='16' height='16'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>";
    aCont.appendChild(a);

    element.prepend(aCont);
  });
});

window.addEventListener("DOMContentLoaded", function () {
  const populateMicroblog = function () {
    const microblogItems = JSON.parse(window.localStorage.getItem("cdz_microblog_feed")).items;
    const microblogFeed = document.getElementById("-cdz-microblog-feed");

    microblogItems.forEach(function (item) {
      const article = document.createElement("article");
      article.setAttribute("class", "gh-card post");

      const a = document.createElement("a");
      a.setAttribute("class", "gh-card-link");
      a.setAttribute("href", item.link);
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
          img.setAttribute("loading", "lazy");
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
  };

  const cached = window.localStorage.getItem("cdz_microblog_feed");
  let refreshCache = true;
  if (cached) {
    const cacheExp = new Date(Date.parse(JSON.parse(cached).exp));
    refreshCache = new Date().getTime() >= cacheExp.getTime();
  }

  if (refreshCache) {
    const parser = new RSSParser({
      customFields: {
        item: [
          ['media:content', 'media:content', {keepArray: true}],
        ]
      }
    });
    parser.parseURL("https://a2mi.social/@dzombak.rss", function (err, feed) {
      if (err) {
        console.error(err);
        return;
      }

      const feedItems = feed.items;
      feedItems.sort(function (a, b) {
        return new Date(Date.parse(b.pubDate)) - new Date(Date.parse(a.pubDate));
      });

      var items = [];
      feedItems.forEach(function (entry) {
        if (items.length >= 4) {
          return;
        }

        var item = {
          pubDate: new Date(Date.parse(entry.pubDate)),
          link: entry.link,
          content: entry.content.replaceAll("<br>", ""),
        };

        if (entry.enclosure) {
          item.encType = entry.enclosure.type;
          item.encURL = entry.enclosure.url;
        } else if (entry['media:content'] && entry['media:content'].length > 0) {
          const mediaContent = entry['media:content'][0];
          if (mediaContent.$) {
            item.encType = mediaContent.$.type;
            item.encURL = mediaContent.$.url;
          }
        }

        items.push(item);
      });

      window.localStorage.setItem(
        "cdz_microblog_feed",
        JSON.stringify({
          exp: new Date(new Date().getTime() + 5 * 60 * 1000),
          items: items,
        }),
      );
      populateMicroblog();
    });
  } else {
    populateMicroblog();
  }
});

window.addEventListener("DOMContentLoaded", function () {
  const populatePictures = function () {
    const pictureItems = JSON.parse(window.localStorage.getItem("cdz_pictures_feed")).items;
    const picturesFeed = document.getElementById("-cdz-pictures-feed");
    const bbItems = JSON.parse(window.localStorage.getItem("cdz_birdbuddy_feed")).items;
    const bbFeed = document.getElementById("-cdz-birdbuddy-feed");

    const addImage = function (el, item) {
      const itemTs = new Date(Date.parse(item.pubDate));
      const altTxt = item.title + " (Posted " + itemTs.toLocaleDateString() + " in " + item.category + ")";

      const img = document.createElement("img");
      img.setAttribute("src", item.encURL);
      img.setAttribute("alt", altTxt);
      img.setAttribute("loading", "lazy");

      const a = document.createElement("a");
      a.setAttribute("class", "gh-card-link masonry-item");
      a.setAttribute("href", item.link);
      a.setAttribute("title", altTxt);

      a.appendChild(img);
      el.appendChild(a);
    };

    pictureItems.forEach(function (item) {
      addImage(picturesFeed, item);
    });
    bbItems.forEach(function (item) {
      addImage(bbFeed, item);
    });
  };

  const cached = window.localStorage.getItem("cdz_pictures_feed");
  let refreshCache = true;
  if (cached) {
    const cacheExp = new Date(Date.parse(JSON.parse(cached).exp));
    refreshCache = new Date().getTime() >= cacheExp.getTime();
  }

  if (refreshCache) {
    const parser = new RSSParser();
    parser.parseURL("https://www.dzombak.com/feeds/pictures-all.rss.xml", function (err, feed) {
      if (err) {
        console.error(err);
        return;
      }

      const feedItems = feed.items;
      feedItems.sort(function (a, b) {
        return new Date(Date.parse(b.pubDate)) - new Date(Date.parse(a.pubDate));
      });

      var items = [];
      var birdbuddyItems = [];
      feedItems.forEach(function (entry) {
        var item = {
          pubDate: new Date(Date.parse(entry.pubDate)),
          link: entry.link,
          title: entry.title,
          category: null,
          encType: entry.enclosure.type,
          encURL: entry.enclosure.url,
        };
        if (entry.categories.length) {
          item.category = entry.categories[0];
        }

        if (item.category && item.category === "Bird Buddy" && birdbuddyItems.length < 3) {
          birdbuddyItems.push(item);
        } else if (item.category !== "Bird Buddy" && items.length < 12) {
          items.push(item);
        }
      });

      window.localStorage.setItem(
        "cdz_pictures_feed",
        JSON.stringify({
          exp: new Date(new Date().getTime() + 15 * 60 * 1000),
          items: items,
        }),
      );
      window.localStorage.setItem(
        "cdz_birdbuddy_feed",
        JSON.stringify({
          items: birdbuddyItems,
        }),
      );
      populatePictures();
    });
  } else {
    populatePictures();
  }
});

window.addEventListener("DOMContentLoaded", async function () {
  const populateBookmarksFeed = function () {
    const bookmarkItems = JSON.parse(window.localStorage.getItem("cdz_bookmarks_feed")).items;
    const bookmarksFeed = document.getElementById("-cdz-bookmarks-feed");

    bookmarkItems.forEach(function (item) {
      const eltTmpl = `
        <a class="kg-bookmark-container" href="${item.link}" target="_blank">
          <div class="kg-bookmark-content">
            <div class="kg-bookmark-title"></div>
            <div class="kg-bookmark-description"></div>
            <div class="kg-bookmark-metadata">
              <span class="accent">
                ↗ ${item.domain}
              </span>
            </div>
          </div>
        </a>`;

      const elt = document.createElement("div");
      elt.setAttribute("class", "cdz-card kg-card kg-bookmark-card");
      elt.innerHTML = eltTmpl;
      elt.querySelector(".kg-bookmark-title").textContent = item.title;
      elt.querySelector(".kg-bookmark-description").textContent = item.description;

      if (item.image && item.image !== "") {
        const imgTmpl = `<img src="${item.image}" loading="lazy" alt="" onerror="this.style.display = 'none'">`;
        const imgElt = document.createElement("div");
        imgElt.setAttribute("class", "kg-bookmark-thumbnail");
        imgElt.innerHTML = imgTmpl;
        elt.querySelector(".kg-bookmark-container").appendChild(imgElt);
      }

      bookmarksFeed.appendChild(elt);
    });
  };

  const cached = window.localStorage.getItem("cdz_bookmarks_feed");
  let refreshCache = true;
  if (cached) {
    const cacheExp = new Date(Date.parse(JSON.parse(cached).exp));
    refreshCache = new Date().getTime() >= cacheExp.getTime();
  }

  if (refreshCache) {
    try {
      const response = await fetch("https://www.dzombak.com/feeds/rd-homepage.json");
      if (!response.ok) {
        throw new Error(`bookmarks feed fetch failed: ${response}`);
      }

      const json = await response.json();

      const feedItems = json.items;
      feedItems.sort(function (a, b) {
        return new Date(Date.parse(b.at)) - new Date(Date.parse(a.at));
      });

      var items = [];
      feedItems.forEach(function (item) {
        if (items.length >= 6) {
          return;
        }
        if (item.description && item.description.length > 119) {
          item.description = item.description.slice(0, 120) + "…";
        }
        items.push(item);
      });

      window.localStorage.setItem(
        "cdz_bookmarks_feed",
        JSON.stringify({
          exp: new Date(new Date().getTime() + 5 * 60 * 1000),
          items: items,
        }),
      );
      populateBookmarksFeed();
    } catch (error) {
      console.error(error.message);
    }
  } else {
    populateBookmarksFeed();
  }
});

window.addEventListener("load", function () {
  (function () {
    try {
      pagination(false);
    } catch (error) {
      console.warn("Ghost pagination JS error:", error.message);
    }
  })();
});
