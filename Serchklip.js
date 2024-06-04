const CaverExtKAS = require('caver-js-ext-kas');
require('dotenv').config();
const fs = require('fs');
const path = '/Users/ijiheon/Desktop/klaytn_structure/address';
const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const chainId = 8217;


const query = { size: 1000 };
const address = '0xfb4530034f0e4000d1ca829f5a4dde3ad061ee51'


const caver = new CaverExtKAS();
caver.initKASAPI(chainId, accessKeyId, secretAccessKey);

async function getaddress() {
  let cursor;
  let pageNumber = 0; // 페이지 번호를 추적하기 위한 변수 추가
  try {
    do {
      const result = await caver.kas.tokenHistory.getNFTList(address, { ...query, cursor });
      const data = JSON.stringify(result.items, null, 2);
      fs.writeFileSync(`${path}/${pageNumber}_${cursor}.json`, data);
      pageNumber++; // 페이지 번호 증가
      console.log(`Page ${pageNumber}:`, result.items); // 페이지 번호와 함께 아이템 출력
      cursor = result.cursor; // 다음 요청을 위해 커서 업데이트

      console.log(`Page ${pageNumber}:`);
    } while (cursor); // 커서가 없을 때까지 반복
  } catch (error) {
    console.error('Error:', error);
  }
}

getaddress();
