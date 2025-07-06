// ==UserScript==
// @name         B站UP主追新（默认：大耳朵）
// @namespace    bilibili.up.latest
// @version      1.0.0
// @description  获取指定B站UP主最新投稿（默认：大耳朵）
// @author       ChatGPT
// @grant        none
// ==/UserScript==

export default defineWidget({
  name: "B站UP主追新",
  description: "获取指定B站UP主最新投稿视频（默认：大耳朵）",
  author: "ChatGPT",
  version: "1.0.0",
  example_config: {
    uid: "54525878"  // 默认：大耳朵
  },

  async run({ args }) {
    const uid = args.uid || "54525878"; // 默认 UID
    const api = `https://api.bilibili.com/x/space/wbi/arc/search?mid=${uid}&ps=10&pn=1`;

    const res = await axios.get(api);
    if (!res?.data?.data?.list?.vlist) {
      throw new Error("获取失败，请检查UID");
    }

    const videos = res.data.data.list.vlist.map(v => {
      return {
        title: v.title,
        description: `播放: ${v.play} | 弹幕: ${v.video_review}`,
        image: `https:${v.pic}`,
        url: `https://www.bilibili.com/video/${v.bvid}`
      };
    });

    return {
      title: `UP主：${res.data.data.list.vlist[0]?.author || '未知'} 最新投稿`,
      items: videos
    };
  }
});
