// copies / crops the PPT pictures into the deck's assets folder (prefix c21- = 대단원 II · 소단원 1)
const fs = require('fs'), path = require('path');
const { createCanvas, loadImage } = require('../node_modules/canvas');
const media = path.join(__dirname, 'x', 'ppt', 'media');
const out = 'E:/OneDrive/OneDrive - 민족사관고등학교/kmla-korean history study/assets';
const jobs = [
  // [output name, source image, crop {x,y,w,h} or null]
  ['c21-un-charter.png', 'image7.png'],
  ['c21-tokyo-trial.png', 'image8.png'],
  ['c21-tokyo-photo.png', 'image8.png', { x: 1050, y: 84, w: 626, h: 468 }],
  ['c21-truman.png', 'image9.png'],
  ['c21-cartoon-ice.png', 'image10.png'],
  ['c21-cartoon-sam.png', 'image11.png'],
  ['c21-sanfrancisco.png', 'image12.png'],
  ['c21-eastasia-map.png', 'image13.png'],
  ['c21-coldwar-map.png', 'image14.png'],
  ['c21-liberation-joy.png', 'image15.png'],
  ['c21-rusk.png', 'image16.png'],
  ['c21-geonjun-org.png', 'image17.png'],
  ['c21-geonjun-declaration.png', 'image18.png'],
  ['c21-geonjun-leaders.png', 'image19.png'],
  ['c21-welcome.png', 'image20.png'],
  ['c21-line38-village.png', 'image21.png'],
  ['c21-line38-crossing.png', 'image22.png'],
  ['c21-line38-story.png', 'image23.png'],
  ['c21-usamgj-policy.png', 'image24.png'],
  ['c21-benninghoff.png', 'image25.png'],
  ['c21-flag-change.png', 'image26.png'],
  ['c21-moscow-docs-left.png', 'image27.png', { x: 0, y: 0, w: 776, h: 590 }],
  ['c21-moscow-docs-right.png', 'image27.png', { x: 780, y: 0, w: 776, h: 590 }],
  ['c21-trusteeship-flow.png', 'image28.png'],
  ['c21-moscow-news.png', 'image29.png'],
  ['c21-antitrust-docs.png', 'image30.png', { x: 0, y: 0, w: 792, h: 1233 }],
  ['c21-pro-docs.png', 'image30.png', { x: 792, y: 0, w: 792, h: 1233 }],
  ['c21-left-right-cartoon.png', 'image31.png'],
];
(async () => {
  for (const [name, src, crop] of jobs) {
    const im = await loadImage(path.join(media, src));
    if (!crop) { fs.copyFileSync(path.join(media, src), path.join(out, name)); console.log('copy', name, im.width + 'x' + im.height); continue; }
    const c = createCanvas(crop.w, crop.h), g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, crop.w, crop.h);
    g.drawImage(im, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    fs.writeFileSync(path.join(out, name), c.toBuffer('image/png'));
    console.log('crop', name, crop.w + 'x' + crop.h);
  }
})();
