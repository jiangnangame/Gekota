import fs from 'fs';
import CompileFrames from './CompileFrames.js';
const SaveXML = (fileName, data) => {
    fs.writeFileSync(fileName, data);
    console.log('Output XML Successfully: ' + fileName);
};
export default function CompileXfl(jsonPath, xflPath, xflConfig) {
    const {mediasNames, symbolsNames} = xflConfig;
    //编译时间轴
    const {frames, info} = JSON.parse(fs.readFileSync(jsonPath + 'MainAnims.json'));
    const {FramesXml, Medias} = CompileFrames(frames, jsonPath);
    mediasNames.push(...Medias);
    //编译头部
    let xml = `<DOMDocument xmlns="http://ns.adobe.com/xfl/2008/" width="500" height="500" xflVersion="2.96" backgroundColor="#333333" frameRate="${info.fps}"><media>`;
    mediasNames.forEach(imageID => xml += `<DOMBitmapItem name="${imageID}.png" allowSmoothing="true" href="${imageID}.png"/>`);
    xml += `</media><symbols>`;
    symbolsNames.forEach(name => xml += `<Include href="${name}.xml"/>`);
    xml += `</symbols><timelines><DOMTimeline name="Scene">${FramesXml}</DOMTimeline></timelines></DOMDocument>`;
    SaveXML(xflPath + 'DOMDocument.xml', xml);
}