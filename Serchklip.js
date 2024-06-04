const CaverExtKAS = require('caver-js-ext-kas');
require('dotenv').config();

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const chainId = 8217;
const query = { size: 100 };
const address = '0xfb4530034f0e4000d1ca829f5a4dde3ad061ee51'


const caver = new CaverExtKAS();
caver.initKASAPI(chainId, accessKeyId, secretAccessKey);

async function getBlockNumber() {
  try {
    const result = await caver.kas.tokenHistory.getNFTList(
      address,
      query
    );
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

getBlockNumber();
