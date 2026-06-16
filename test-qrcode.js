// 测试二维码生成
const PAD0 = 0xEC;
const PAD1 = 0x11;

const ECC_BLOCKS = {
  '1-L': [[1, 26, 19]],
  '1-M': [[1, 26, 16]],
  '1-Q': [[1, 26, 13]],
  '1-H': [[1, 26, 9]],
  '2-L': [[1, 44, 34]],
  '2-M': [[1, 44, 28]],
  '3-L': [[1, 70, 55]],
  '3-M': [[1, 70, 44]],
  '4-L': [[1, 100, 80]],
  '4-M': [[2, 50, 32]],
  '5-L': [[1, 134, 108]],
  '5-M': [[2, 67, 43]],
  '6-L': [[2, 86, 68]],
  '6-M': [[4, 43, 27]],
  '7-L': [[2, 98, 78]],
  '7-M': [[4, 49, 31]],
  '8-L': [[2, 121, 97]],
  '8-M': [[4, 60, 38]],
  '9-L': [[2, 146, 116]],
  '9-M': [[4, 73, 47]],
  '10-L': [[2, 86, 68], [2, 87, 69]]
};

const GLUT = {};
const FLUT = {};

(function initLUT() {
  let e = 1;
  for (let i = 0; i < 255; i++) {
    GLUT[i] = e;
    FLUT[e] = i;
    e = (e << 1) ^ (e & 0x80 ? 0x11d : 0);
  }
})();

function glog(n) {
  if (n < 1) throw new Error('glog(' + n + ')');
  return FLUT[n];
}

function gexp(n) {
  while (n < 0) n += 255;
  while (n >= 256) n -= 255;
  return GLUT[n];
}

function generateErrorCorrection(data, eccLen) {
  const gen = [];
  gen.unshift(1);
  for (let i = 0; i < eccLen; i++) {
    gen.unshift(0);
    for (let j = 0; j < gen.length - 1; j++) {
      gen[j] = gen[j + 1] ^ gexp(glog(gen[j]) + i);
    }
  }

  const res = data.slice();
  for (let i = 0; i < eccLen; i++) res.push(0);

  for (let i = 0; i < data.length; i++) {
    const coff = res[i];
    if (coff !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gexp(glog(gen[j]) + glog(coff));
      }
    }
  }

  return res.slice(data.length);
}

function generateQRCode(text, eccLevel = 'M') {
  let data = [];
  const encoder = new TextEncoder();
  const utf8 = encoder.encode(text);

  data.push(0b0100 << 4);
  let len = utf8.length;
  if (len < 256) {
    data.push(len >>> 4);
    data.push((len & 0xf) << 4);
  }

  let bit = 0;
  for (let i = 0; i < utf8.length; i++) {
    for (let j = 7; j >= 0; j--) {
      if (bit === 0) data.push(0);
      if ((utf8[i] >>> j) & 1) {
        data[data.length - 1] |= 1 << (7 - bit);
      }
      bit = (bit + 1) % 8;
    }
  }

  console.log('Data length (bytes):', data.length);
  console.log('Text length:', text.length, 'UTF8 bytes:', utf8.length);

  let version = 1;
  while (version <= 10) {
    const blocks = ECC_BLOCKS[`${version}-${eccLevel}`];
    if (blocks) {
      let totalData = 0;
      for (const b of blocks) {
        totalData += b[0] * (b[2]);
      }
      console.log(`Version ${version}-${eccLevel}: capacity = ${totalData} bytes`);
      if (data.length <= totalData) break;
    }
    version++;
  }

  if (version > 10) {
    throw new Error(`内容过长（${data.length}字节），无法生成二维码。最大支持版本10-M约271字节`);
  }

  console.log('Selected version:', version);
  console.log('Test text:', text.substring(0, 50) + '...');
  
  return { success: true, version, dataLength: data.length };
}

// 测试数据 - 模拟最复杂的商品
const testCases = [
  {
    name: '基础测试 - 简单短内容',
    content: 'BR|prod-001|婴儿车|宝宝妈妈小王|3|1|5.0|5.0|800|sold'
  },
  {
    name: '长标题测试（20字符）',
    content: 'BR|prod-001|Cybex Priam高景观婴儿推车|宝宝妈妈小王|3|1|5.0|5.0|800|sold'
  },
  {
    name: '复杂数据测试',
    content: 'BR|prod_1234567890|超长商品名称CybexPriam高景观婴儿推车铝合金|超级超级长的持有人名字测试一下|10|9|4.8|4.9|12800|published'
  },
  {
    name: '模拟真实长标题',
    content: 'BR|prod-001|Cybex Priam高景观双向婴儿推车+睡篮|宝宝妈妈小王|3|1|5.0|5.0|1280|sold'
  },
  {
    name: '完整格式验证',
    content: 'BR|prod-001|婴儿手推车|当前持有人测试|3|1|1|5.0|5.0|800|sold'
  }
];

console.log('='.repeat(60));
console.log('二维码生成测试开始');
console.log('='.repeat(60));

for (const testCase of testCases) {
  console.log(`\n【${testCase.name}】`);
  try {
    const result = generateQRCode(testCase.content, 'M');
    console.log('  ✅ 成功！版本:', result.version, '数据长度:', result.dataLength, '字节');
    console.log('  内容长度:', testCase.content.length, '字符');
  } catch (e) {
    console.log('  ❌ 失败:', e.message);
  }
}

console.log('\n' + '='.repeat(60));
console.log('所有测试完成');
console.log('='.repeat(60));
