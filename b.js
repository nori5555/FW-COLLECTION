// B站UP主最新投稿插件（支持筛选、自定义方向/颜色）
WidgetMetadata = {
  id: "bilibili.up.latest",
  title: "B站追更",
  description: "追踪指定UP主最新投稿（默认：大耳朵）",
  version: "1.0.0",
  author: "chatgpt",
  site: "https://space.bilibili.com/54525878",
  detailCacheDuration: 3600,
  modules: [
    {
      title: "最新投稿",
      functionName: "loadLatestVideos",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        {
          name: "uid",
          title: "UP主UID",
          type: "input",
          description: "默认：大耳朵 UID",
          value: "54525878",
          placeholders: [{ title: "大耳朵", value: "54525878" }]
        },
        {
          name: "title_filter",
          title: "标题关键词过滤",
          type: "input",
          description: "如填写“更新”，则只展示标题中包含“更新”的视频",
          value: "",
          placeholders: [
            { title: "全部", value: "" },
            { title: "番剧", value: "番剧" },
            { title: "更新", value: "更新" },
          ]
        },
        {
          name: "bg_color",
          title: "封面背景色（如无封面）",
          type: "input",
          value: "20B2AA",
          placeholders: [
            { title: "浅海洋蓝", value: "20B2AA" },
            { title: "亮灰色", value: "DCDCDC" },
            { title: "小麦色", value: "F5DEB3" },
          ]
        },
        {
          name: "direction",
          title: "封面方向",
          type: "enumeration",
          value: "V",
          enumOptions: [
            { title: "竖向", value: "V" },
            { title: "横向", value: "H" }
          ]
        }
      ]
    }
  ]
};

async function loadLatestVideos(params = {}) {
  const uid = params.uid || "54525878";
  const titleFilter = params.title_filter || "";
  const bgColor = params.bg_color || "20B2AA";
  const direction = params.direction || "V";

  const apiUrl = `https://api.bilibili.com/x/space/wbi/arc/search?mid=${uid}&pn=1&ps=10&order=pubdate`;

  const res = await Widget.http.get(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });

  const videos = res?.data?.data?.list?.vlist || [];
  const author = videos[0]?.author || `UID ${uid}`;
  const total = videos.length;

  const filtered = videos.filter((v) => {
    if (!titleFilter) return true;
    try {
      return new RegExp(titleFilter, 'i').test(v.title);
    } catch {
      return v.title.toLowerCase().includes(titleFilter.toLowerCase());
    }
  });

  return filtered.map((video, index) => {
    const cover = video.pic ? `https:${video.pic}` : `https://via.placeholder.com/320x180/${bgColor}/FFFFFF?text=${encodeURIComponent(video.title)}`;
    const title = `${video.title} (${index + 1}/${total})`;
    const url = `https://www.bilibili.com/video/${video.bvid}`;
    const description = `播放: ${video.play} | 弹幕: ${video.video_review} | ${formatTime(video.created)}`;

    return {
      id: video.bvid,
      type: "url",
      title,
      description,
      link: url,
      ...(direction === "V"
        ? { posterPath: cover }
        : { backdropPath: cover })
    };
  });
}

function formatTime(ts) {
  const date = new Date(ts * 1000);
  return date.toLocaleString("zh-CN", { hour12: false });
}
