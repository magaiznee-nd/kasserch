const CaverExtKAS = require('caver-js-ext-kas');
require('dotenv').config();
const pathh = require('path');
const fs = require('fs');
const path = '/Users/ijiheon/Desktop/klaytn_structure/(legacy)address';
const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const chainId = 8217;
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const query = { size: 1000 };
const address = '0xb26e09db6656b998d2913f13870e06c151c37900'


const caver = new CaverExtKAS();
caver.initKASAPI(chainId, accessKeyId, secretAccessKey);

async function getaddress() {
  let cursor ='9Ag4N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R1d319yoeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG0DVM';
  let pageNumber = 1610; // 페이지 번호를 추적하기 위한 변수 추가
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



async function combineAndParseJSONtoCSV(address) {
  const files = fs.readdirSync(path);
  const allItems = [];
  let fileCounter = 1;
  let itemCount = 0;
  const maxItemsPerFile = 5000; // 한 CSV 파일 당 최대 아이템 수

  // 모든 JSON 파일을 읽고 데이터를 합칩니다.
  for (const file of files) {
    if (file.endsWith('.json')) {
      const data = fs.readFileSync(`${path}/${file}`);
      const items = JSON.parse(data).map(item => ({
        owner: item.owner,
        previousOwner: item.previousOwner,
        tokenId: item.tokenId,
        tokenUri: item.tokenUri,
        transactionHash: item.transactionHash,
        createdAt: new Date(item.createdAt * 1000).toISOString(),
        updatedAt: new Date(item.updatedAt * 1000).toISOString()
      }));

      // 이전 소유자가 동일한 데이터를 제외하고 추가
      const filteredItems = items.filter((item, index, self) =>
        self.filter(t => t.owner === item.owner).length <= 2 || index === self.findIndex(t => t.owner === item.owner)
      );
      allItems.push(...filteredItems);

      // CSV 파일 분할 저장 로직
      if (allItems.length >= maxItemsPerFile) {
        await writeCSV(allItems.splice(0, maxItemsPerFile), fileCounter++, address);
      }
    }
  }

  // 남은 데이터가 있으면 저장
  if (allItems.length > 0) {
    await writeCSV(allItems, fileCounter, address);
  }
}

async function writeCSV(items, fileCounter, address) {
  const csvWriter = createCsvWriter({
    path: `address/csv/${address}_${fileCounter}.csv`,
    header: [
      {id: 'owner', title: 'OWNER'},
      // {id: 'previousOwner', title: 'PREVIOUS_OWNER'},
      {id: 'tokenId', title: 'TOKEN_ID'},
      // {id: 'tokenUri', title: 'TOKEN_URI'},
      // {id: 'transactionHash', title: 'TRANSACTION_HASH'},
      {id: 'createdAt', title: 'CREATED_AT'},
      // {id: 'updatedAt', title: 'UPDATED_AT'}
    ]
  });

  // CSV 파일 작성
  await csvWriter.writeRecords(items)
    .then(() => {
      console.log(`CSV file ${fileCounter} has been written successfully`);
    })
    .catch(err => {
      console.error('Error while writing CSV file:', err);
    });
}

combineAndParseJSONtoCSV('0xb26e09db6656b998d2913f13870e06c151c37900');



async function combineAllCSVFiles(address) {
  const path = require('path');
  const directoryPath = path.join(__dirname, 'address/csv/');
  const outputPath = path.join(directoryPath, `${address}_combined.csv`);
  const output = fs.createWriteStream(outputPath);

  try {
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      if (path.extname(file) === '.csv') {
        const filePath = path.join(directoryPath, file);
        const input = fs.createReadStream(filePath);
        await new Promise((resolve, reject) => {
          input.on('data', (chunk) => {
            output.write(chunk);
          });
          input.on('end', () => {
            output.write('\n'); // 파일 간 구분을 위해 줄바꿈 추가
            resolve();
          });
          input.on('error', reject);
        });
      }
    }
    console.log('모든 CSV 파일이 성공적으로 합쳐졌습니다.');
  } catch (error) {
    console.error('CSV 파일을 합치는 동안 오류가 발생했습니다:', error);
  } finally {
    output.close();
  }
}

combineAllCSVFiles();

