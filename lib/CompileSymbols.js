import fs from 'fs';
import CompileFrames from './CompileFrames.mjs';
const SaveXML = (fileName, data) => {
    fs.writeFileSync(fileName, data);
    console.log('Output XML Successfully: ' + fileName);
};
export default function CompileSymbols(jsonPath, xflPath) {
    let mediasNames = [];
    let symbolsNames = [];
    //编译pam中定义的元件
    const SubAnims = JSON.parse(fs.readFileSync(jsonPath + 'SubAnimsList.json'));
    for(let symbol of SubAnims) {
        const sName = symbol.name;
        const {FramesXml, Medias} = CompileFrames(symbol.frames, jsonPath);
        const xml = 
        `<DOMSymbolItem xmlns="http://ns.adobe.com/xfl/2008/" name="${sName}">
        <timeline>
        <DOMTimeline name="${sName}">
        ${FramesXml}
        </DOMTimeline>
        </timeline>
        </DOMSymbolItem>`;
        mediasNames.push(...Medias);
        symbolsNames.push(sName);
        SaveXML(xflPath + 'LIBRARY/' + sName + '.xml', xml);
    }
    //转位图为元件
    const Sprites = JSON.parse(fs.readFileSync(jsonPath + 'SpritesList.json'));
    for(let sprite of Sprites) {
        const imageID = sprite.imageID;
        const {left, top, a, b, c, d} = sprite.properties;
        const xml = 
        `<DOMSymbolItem xmlns="http://ns.adobe.com/xfl/2008/" name="${imageID}">
        <timeline>
        <DOMTimeline name="${imageID}">
        <layers>
        <DOMLayer name="${imageID}">
          <frames>
            <DOMFrame index="0">
              <elements>
                <DOMBitmapInstance libraryItemName="${imageID}.png">
                  <matrix><Matrix tx="${left}" ty="${top}" a="${a/20}" b="${b/20}" c="${c/20}" d="${d/20}"/></matrix>
                </DOMBitmapInstance>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
        </layers>
        </DOMTimeline>
        </timeline>
        </DOMSymbolItem>`;
        mediasNames.push(imageID);
        symbolsNames.push(imageID);
        SaveXML(xflPath + 'LIBRARY/' + imageID + '.xml', xml);
    }
    return {mediasNames, symbolsNames};
}